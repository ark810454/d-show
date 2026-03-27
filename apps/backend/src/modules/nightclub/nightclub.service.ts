import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  ActivityType,
  FinancialTransactionType,
  MenuItemStatus,
  NightclubBottleOrderStatus,
  NightclubEventStatus,
  NightclubTicketStatus,
  PaymentStatus,
  Prisma,
  ReservationStatus,
  ResourceStatus,
} from "@prisma/client";
import { PrismaService } from "../../config/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { CreateNightclubBookingDto } from "./dto/create-nightclub-booking.dto";
import { CreateNightclubBottleCategoryDto } from "./dto/create-nightclub-bottle-category.dto";
import { CreateNightclubBottleItemDto } from "./dto/create-nightclub-bottle-item.dto";
import { CreateNightclubBottleOrderDto } from "./dto/create-nightclub-bottle-order.dto";
import { CreateNightclubBottlePaymentDto } from "./dto/create-nightclub-bottle-payment.dto";
import { CreateNightclubEventDto } from "./dto/create-nightclub-event.dto";
import { CreateNightclubTicketDto } from "./dto/create-nightclub-ticket.dto";
import { CreateNightclubZoneDto } from "./dto/create-nightclub-zone.dto";
import { ValidateNightclubTicketDto } from "./dto/validate-nightclub-ticket.dto";

@Injectable()
export class NightclubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async createZone(dto: CreateNightclubZoneDto) {
    await this.ensureNightclubActivity(dto.companyId, dto.activityId);
    return this.prisma.nightclubZone.create({
      data: {
        companyId: dto.companyId,
        activityId: dto.activityId,
        code: dto.code,
        nom: dto.nom,
        capacite: dto.capacite,
        description: dto.description,
        statut: dto.statut ?? ResourceStatus.LIBRE,
      },
    });
  }

  listZones(companyId: string, activityId: string) {
    return this.prisma.nightclubZone.findMany({
      where: { companyId, activityId, deletedAt: null },
      include: { bookings: { where: { deletedAt: null }, take: 3, orderBy: { createdAt: "desc" } } },
      orderBy: [{ nom: "asc" }],
    });
  }

  async updateZoneStatus(id: string, companyId: string, activityId: string, statut: ResourceStatus) {
    const zone = await this.prisma.nightclubZone.findFirst({ where: { id, companyId, activityId, deletedAt: null } });
    if (!zone) throw new NotFoundException("Zone VIP introuvable");
    const updated = await this.prisma.nightclubZone.update({ where: { id }, data: { statut } });
    this.realtimeGateway.broadcastNightclubReservationUpdated(updated);
    return updated;
  }

  async createEvent(dto: CreateNightclubEventDto) {
    await this.ensureNightclubActivity(dto.companyId, dto.activityId);
    if (dto.heureOuverture && dto.heureFermeture) {
      const start = new Date(dto.heureOuverture);
      const end = new Date(dto.heureFermeture);
      if (end < start) {
        throw new BadRequestException("L'heure de fermeture doit etre posterieure a l'heure d'ouverture.");
      }
    }
    const event = await this.prisma.nightclubEvent.create({
      data: {
        companyId: dto.companyId,
        activityId: dto.activityId,
        nom: dto.nom,
        djInvite: dto.djInvite,
        dateEvenement: new Date(dto.dateEvenement),
        heureOuverture: dto.heureOuverture ? new Date(dto.heureOuverture) : undefined,
        heureFermeture: dto.heureFermeture ? new Date(dto.heureFermeture) : undefined,
        prixEntree: dto.prixEntree,
        description: dto.description,
        statut: dto.statut ?? NightclubEventStatus.PUBLIE,
      },
    });
    this.realtimeGateway.broadcastNightclubEventCreated(event);
    return event;
  }

  listEvents(companyId: string, activityId: string) {
    return this.prisma.nightclubEvent.findMany({
      where: { companyId, activityId, deletedAt: null },
      include: { _count: { select: { tickets: true, bottleOrders: true } } },
      orderBy: [{ dateEvenement: "desc" }],
    });
  }

  async createTicket(dto: CreateNightclubTicketDto) {
    await this.ensureNightclubActivity(dto.companyId, dto.activityId);

    const client = dto.clientId
      ? await this.prisma.client.findFirst({ where: { id: dto.clientId, companyId: dto.companyId, deletedAt: null } })
      : null;

    const event = dto.eventId
      ? await this.prisma.nightclubEvent.findFirst({
          where: { id: dto.eventId, companyId: dto.companyId, activityId: dto.activityId, deletedAt: null },
        })
      : null;

    const ticket = await this.prisma.$transaction(async (tx) => {
      const created = await tx.nightclubEntryTicket.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          clientId: dto.clientId,
          eventId: dto.eventId,
          bookingId: dto.bookingId,
          reference: this.makeReference("NTK"),
          qrCode: this.makeQrCode(),
          typeTicket: dto.typeTicket,
          montant: dto.montant,
          note: dto.note,
        },
        include: { client: true, event: true },
      });

      await tx.financialTransaction.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          clientId: dto.clientId,
          reference: this.makeReference("FIN-NTK"),
          typeTransaction: FinancialTransactionType.VENTE,
          statutPaiement: PaymentStatus.PAYE,
          montant: dto.montant,
          description: `Billetterie boîte de nuit${event ? ` - ${event.nom}` : ""}`,
        },
      });

      return created;
    });

    this.realtimeGateway.broadcastNightclubTicketCreated({
      ...ticket,
      vip: client?.typeClient === "VIP" || dto.typeTicket === "VIP",
    });
    return ticket;
  }

  listTickets(companyId: string, activityId: string) {
    return this.prisma.nightclubEntryTicket.findMany({
      where: { companyId, activityId },
      include: { client: true, event: true, booking: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async validateTicket(companyId: string, activityId: string, dto: ValidateNightclubTicketDto) {
    await this.ensureNightclubActivity(companyId, activityId);

    const ticket = await this.prisma.nightclubEntryTicket.findFirst({
      where: { companyId, activityId, qrCode: dto.qrCode },
      include: { client: true, event: true },
    });

    if (!ticket) {
      await this.logAccess(companyId, activityId, undefined, undefined, dto.validatedByUserId, "REFUSE", "Ticket introuvable", dto.ipAddress);
      throw new NotFoundException("Ticket introuvable");
    }

    if (ticket.client?.blackliste) {
      await this.logAccess(companyId, activityId, ticket.clientId ?? undefined, ticket.id, dto.validatedByUserId, "REFUSE", "Client blacklisté", dto.ipAddress);
      await this.prisma.nightclubEntryTicket.update({ where: { id: ticket.id }, data: { statut: NightclubTicketStatus.REFUSE } });
      throw new BadRequestException("Accès refusé : client blacklisté");
    }

    if (ticket.statut === NightclubTicketStatus.VALIDE) {
      await this.logAccess(companyId, activityId, ticket.clientId ?? undefined, ticket.id, dto.validatedByUserId, "REFUSE", "Ticket déjà utilisé", dto.ipAddress);
      throw new BadRequestException("Ce ticket a déjà été validé");
    }

    const updated = await this.prisma.nightclubEntryTicket.update({
      where: { id: ticket.id },
      data: {
        statut: NightclubTicketStatus.VALIDE,
        validatedAt: new Date(),
        usedAt: new Date(),
        validatedByUserId: dto.validatedByUserId,
      },
      include: { client: true, event: true },
    });

    await this.logAccess(companyId, activityId, updated.clientId ?? undefined, updated.id, dto.validatedByUserId, "VALIDE", "Entrée autorisée", dto.ipAddress);
    this.realtimeGateway.broadcastNightclubTicketValidated(updated);
    return {
      ticket: updated,
      vip: updated.client?.typeClient === "VIP" || updated.typeTicket === "VIP",
      message: updated.client?.typeClient === "VIP" || updated.typeTicket === "VIP" ? "Accès VIP autorisé" : "Entrée validée",
    };
  }

  async createBooking(dto: CreateNightclubBookingDto) {
    await this.ensureNightclubActivity(dto.companyId, dto.activityId);
    const booking = await this.prisma.$transaction(async (tx) => {
      const created = await tx.nightclubBooking.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          clientId: dto.clientId,
          zoneId: dto.zoneId,
          assigneeUserId: dto.assigneeUserId,
          reference: this.makeReference("NBK"),
          typeReservation: dto.typeReservation,
          dateEvenement: new Date(dto.dateEvenement),
          heureDebut: dto.heureDebut ? new Date(dto.heureDebut) : undefined,
          heureFin: dto.heureFin ? new Date(dto.heureFin) : undefined,
          nombrePersonnes: dto.nombrePersonnes,
          statut: ReservationStatus.CONFIRMEE,
          totalTtc: dto.totalTtc,
          montantPaye: dto.acompte ?? 0,
          note: dto.note,
          statutPaiement: (dto.acompte ?? 0) > 0 ? PaymentStatus.PARTIEL : PaymentStatus.IMPAYE,
        },
        include: { client: true, zone: true },
      });

      if (dto.zoneId) {
        await tx.nightclubZone.update({ where: { id: dto.zoneId }, data: { statut: ResourceStatus.RESERVEE } });
      }

      if ((dto.acompte ?? 0) > 0) {
        await tx.financialTransaction.create({
          data: {
            companyId: dto.companyId,
            activityId: dto.activityId,
            clientId: dto.clientId,
            reference: this.makeReference("FIN-NBK"),
            typeTransaction: FinancialTransactionType.VENTE,
            statutPaiement: PaymentStatus.PARTIEL,
            montant: dto.acompte ?? 0,
            description: "Acompte réservation boîte de nuit",
          },
        });
      }

      return created;
    });

    this.realtimeGateway.broadcastNightclubReservationUpdated(booking);
    return booking;
  }

  listBookings(companyId: string, activityId: string) {
    return this.prisma.nightclubBooking.findMany({
      where: { companyId, activityId, deletedAt: null },
      include: { client: true, zone: true, tickets: true, bottleOrders: true },
      orderBy: { dateEvenement: "desc" },
    });
  }

  async updateBookingStatus(id: string, companyId: string, activityId: string, statut: ReservationStatus) {
    const booking = await this.prisma.nightclubBooking.findFirst({
      where: { id, companyId, activityId, deletedAt: null },
    });
    if (!booking) throw new NotFoundException("Réservation introuvable");
    const updated = await this.prisma.nightclubBooking.update({ where: { id }, data: { statut } });
    this.realtimeGateway.broadcastNightclubReservationUpdated(updated);
    return updated;
  }

  async createBottleCategory(dto: CreateNightclubBottleCategoryDto) {
    await this.ensureNightclubActivity(dto.companyId, dto.activityId);
    try {
      return await this.prisma.nightclubBottleCategory.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          nom: dto.nom,
          description: dto.description,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException("Une categorie bouteilles portant ce nom existe deja pour cette activite.");
      }
      throw error;
    }
  }

  async createBottleItem(dto: CreateNightclubBottleItemDto) {
    await this.ensureNightclubActivity(dto.companyId, dto.activityId);
    return this.prisma.nightclubBottleItem.create({
      data: {
        companyId: dto.companyId,
        activityId: dto.activityId,
        categoryId: dto.categoryId,
        nom: dto.nom,
        prix: dto.prix,
        description: dto.description,
        estPack: dto.estPack ?? false,
        vipOnly: dto.vipOnly ?? false,
        statut: MenuItemStatus.DISPONIBLE,
      },
    });
  }

  bottleMenu(companyId: string, activityId: string) {
    return this.prisma.nightclubBottleCategory.findMany({
      where: { companyId, activityId, deletedAt: null, actif: true },
      include: {
        items: {
          where: { deletedAt: null },
          orderBy: [{ ordre: "asc" }, { nom: "asc" }],
        },
      },
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
    });
  }

  async createBottleOrder(dto: CreateNightclubBottleOrderDto) {
    await this.ensureNightclubActivity(dto.companyId, dto.activityId);
    const totalTtc = dto.items.reduce((sum, item) => sum + item.quantite * item.prixUnitaire, 0);
    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.nightclubBottleOrder.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          clientId: dto.clientId,
          bookingId: dto.bookingId,
          zoneId: dto.zoneId,
          serverId: dto.serverId,
          eventId: dto.eventId,
          reference: this.makeReference("NBO"),
          totalTtc,
          note: dto.note,
          items: {
            create: dto.items.map((item) => ({
              companyId: dto.companyId,
              activityId: dto.activityId,
              bottleItemId: item.bottleItemId,
              libelle: item.libelle,
              quantite: item.quantite,
              prixUnitaire: item.prixUnitaire,
              totalLigne: item.quantite * item.prixUnitaire,
              note: item.note,
            })),
          },
        },
        include: { items: true, zone: true, event: true },
      });

      if (dto.zoneId) {
        await tx.nightclubZone.update({ where: { id: dto.zoneId }, data: { statut: ResourceStatus.OCCUPEE } });
      }

      return created;
    });

    this.realtimeGateway.broadcastNightclubBottleSaleUpdated(order);
    return order;
  }

  bottleOrders(companyId: string, activityId: string) {
    return this.prisma.nightclubBottleOrder.findMany({
      where: { companyId, activityId, deletedAt: null },
      include: { items: true, zone: true, booking: true, event: true, client: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateBottleOrderStatus(id: string, companyId: string, activityId: string, statut: NightclubBottleOrderStatus) {
    const order = await this.prisma.nightclubBottleOrder.findFirst({
      where: { id, companyId, activityId, deletedAt: null },
    });
    if (!order) throw new NotFoundException("Commande bouteilles introuvable");
    const updated = await this.prisma.nightclubBottleOrder.update({ where: { id }, data: { statut } });
    this.realtimeGateway.broadcastNightclubBottleSaleUpdated(updated);
    return updated;
  }

  async createBottlePayment(dto: CreateNightclubBottlePaymentDto) {
    await this.ensureNightclubActivity(dto.companyId, dto.activityId);
    const order = await this.prisma.nightclubBottleOrder.findFirst({
      where: { id: dto.bottleOrderId, companyId: dto.companyId, activityId: dto.activityId, deletedAt: null },
      include: { payments: true },
    });
    if (!order) throw new NotFoundException("Commande bouteilles introuvable");

    const alreadyPaid = order.payments.reduce((sum, payment) => sum + Number(payment.montant), 0);
    const paidAfter = alreadyPaid + dto.montant;
    const statutPaiement = paidAfter >= Number(order.totalTtc) ? PaymentStatus.PAYE : PaymentStatus.PARTIEL;

    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.nightclubBottlePayment.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          bottleOrderId: dto.bottleOrderId,
          processedByUserId: dto.processedByUserId,
          reference: this.makeReference("NBP"),
          montant: dto.montant,
          modePaiement: dto.modePaiement,
        },
      });

      await tx.nightclubBottleOrder.update({
        where: { id: order.id },
        data: {
          statutPaiement,
          modePaiement: dto.modePaiement,
          statut: statutPaiement === PaymentStatus.PAYE ? NightclubBottleOrderStatus.SERVI : order.statut,
        },
      });

      await tx.financialTransaction.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          clientId: order.clientId,
          userId: dto.processedByUserId,
          reference: this.makeReference("FIN-NBP"),
          typeTransaction: FinancialTransactionType.VENTE,
          modePaiement: dto.modePaiement,
          statutPaiement: PaymentStatus.PAYE,
          montant: dto.montant,
          description: "Vente bouteilles boîte de nuit",
        },
      });

      return created;
    });

    this.realtimeGateway.broadcastNightclubBottleSaleUpdated({
      id: order.id,
      companyId: dto.companyId,
      activityId: dto.activityId,
      statutPaiement,
      montant: dto.montant,
    });
    return payment;
  }

  async vipOverview(companyId: string, activityId: string) {
    await this.ensureNightclubActivity(companyId, activityId);
    const [vipClients, blacklistedClients, recentAccessLogs, activeBookings] = await Promise.all([
      this.prisma.client.findMany({
        where: { companyId, typeClient: "VIP", blackliste: false, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 12,
      }),
      this.prisma.client.findMany({
        where: { companyId, blackliste: true, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
      this.prisma.nightclubAccessLog.findMany({
        where: { companyId, activityId },
        include: { client: true, ticket: true },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      this.prisma.nightclubBooking.findMany({
        where: {
          companyId,
          activityId,
          deletedAt: null,
          statut: { in: [ReservationStatus.CONFIRMEE, ReservationStatus.EN_COURS] },
        },
        include: { client: true, zone: true },
        orderBy: { dateEvenement: "asc" },
        take: 10,
      }),
    ]);

    return { vipClients, blacklistedClients, recentAccessLogs, activeBookings };
  }

  async dashboard(companyId: string, activityId: string) {
    await this.ensureNightclubActivity(companyId, activityId);
    const [tickets, bookings, bottleOrders, events, recentAccessLogs] = await Promise.all([
      this.prisma.nightclubEntryTicket.findMany({ where: { companyId, activityId }, include: { client: true, event: true }, orderBy: { createdAt: "desc" } }),
      this.prisma.nightclubBooking.findMany({ where: { companyId, activityId, deletedAt: null }, include: { client: true, zone: true }, orderBy: { createdAt: "desc" } }),
      this.prisma.nightclubBottleOrder.findMany({ where: { companyId, activityId, deletedAt: null }, include: { zone: true, event: true }, orderBy: { createdAt: "desc" } }),
      this.prisma.nightclubEvent.findMany({ where: { companyId, activityId, deletedAt: null }, orderBy: { dateEvenement: "desc" }, take: 6 }),
      this.prisma.nightclubAccessLog.findMany({ where: { companyId, activityId }, include: { client: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    ]);

    return {
      kpis: {
        totalEntries: tickets.filter((ticket) => ticket.statut === NightclubTicketStatus.VALIDE).length,
        ticketRevenue: tickets.reduce((sum, ticket) => sum + Number(ticket.montant), 0),
        reservations: bookings.length,
        bottleSales: bottleOrders.reduce((sum, order) => sum + Number(order.totalTtc), 0),
      },
      events,
      latestTickets: tickets.slice(0, 8),
      latestBookings: bookings.slice(0, 8),
      latestBottleOrders: bottleOrders.slice(0, 8),
      recentAccessLogs,
    };
  }

  async stats(companyId: string, activityId: string) {
    await this.ensureNightclubActivity(companyId, activityId);
    const [tickets, bookings, bottleOrders] = await Promise.all([
      this.prisma.nightclubEntryTicket.findMany({ where: { companyId, activityId }, include: { event: true } }),
      this.prisma.nightclubBooking.findMany({ where: { companyId, activityId, deletedAt: null } }),
      this.prisma.nightclubBottleOrder.findMany({ where: { companyId, activityId, deletedAt: null }, include: { items: true } }),
    ]);

    const entriesByEvent = new Map<string, number>();
    const bottleSalesByLabel = new Map<string, number>();

    for (const ticket of tickets) {
      const eventName = ticket.event?.nom ?? "Sans evenement";
      entriesByEvent.set(eventName, (entriesByEvent.get(eventName) ?? 0) + 1);
    }

    for (const order of bottleOrders) {
      for (const item of order.items) {
        bottleSalesByLabel.set(item.libelle, (bottleSalesByLabel.get(item.libelle) ?? 0) + item.quantite);
      }
    }

    return {
      totalEntries: tickets.filter((ticket) => ticket.statut === NightclubTicketStatus.VALIDE).length,
      ticketRevenue: tickets.reduce((sum, ticket) => sum + Number(ticket.montant), 0),
      reservations: bookings.length,
      bottleRevenue: bottleOrders.reduce((sum, order) => sum + Number(order.totalTtc), 0),
      vipEntries: tickets.filter((ticket) => ticket.typeTicket === "VIP").length,
      entriesByEvent: Array.from(entriesByEvent.entries()).map(([label, value]) => ({ label, value })),
      topBottleSales: Array.from(bottleSalesByLabel.entries())
        .map(([label, qty]) => ({ label, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 10),
    };
  }

  private async ensureNightclubActivity(companyId: string, activityId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, companyId, type: ActivityType.BOITE_NUIT, deletedAt: null },
    });
    if (!activity) throw new BadRequestException("Cette activité n'est pas une boîte de nuit valide");
    return activity;
  }

  private async logAccess(
    companyId: string,
    activityId: string,
    clientId: string | undefined,
    ticketId: string | undefined,
    validatedByUserId: string | undefined,
    decision: string,
    reason?: string,
    ipAddress?: string,
  ) {
    return this.prisma.nightclubAccessLog.create({
      data: {
        companyId,
        activityId,
        clientId,
        ticketId,
        validatedByUserId,
        decision,
        reason,
        ipAddress,
      },
    });
  }

  private makeReference(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private makeQrCode() {
    return `QR-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }
}
