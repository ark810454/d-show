import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { CreateMenuCategoryDto } from "./dto/create-menu-category.dto";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { CreateRestaurantOrderDto } from "./dto/create-order.dto";
import { CreateRestaurantPaymentDto } from "./dto/create-payment.dto";
import { CreateRestaurantTableDto } from "./dto/create-table.dto";
import { RestaurantStatsQueryDto } from "./dto/restaurant-stats-query.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";

const ACTIVITY_TYPE = {
  RESTAURANT: "RESTAURANT",
} as const;

const FINANCIAL_TRANSACTION_TYPE = {
  VENTE: "VENTE",
} as const;

const MENU_ITEM_STATUS = {
  DISPONIBLE: "DISPONIBLE",
} as const;

const ORDER_STATUS = {
  EN_COURS: "EN_COURS",
  SERVI: "SERVI",
  PAYE: "PAYE",
  ANNULE: "ANNULE",
  BROUILLON: "BROUILLON",
} as const;

const PAYMENT_STATUS = {
  PAYE: "PAYE",
  PARTIEL: "PARTIEL",
} as const;

const RESOURCE_STATUS = {
  LIBRE: "LIBRE",
  OCCUPEE: "OCCUPEE",
  EN_NETTOYAGE: "EN_NETTOYAGE",
} as const;

const RESTAURANT_KITCHEN_STATUS = {
  EN_ATTENTE: "EN_ATTENTE",
  EN_PREPARATION: "EN_PREPARATION",
  PRET: "PRET",
  SERVI: "SERVI",
  ANNULE: "ANNULE",
} as const;

@Injectable()
export class RestaurantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async createTable(dto: CreateRestaurantTableDto) {
    await this.ensureRestaurantActivity(dto.companyId, dto.activityId);

    return this.prisma.restaurantTable.create({
      data: {
        companyId: dto.companyId,
        activityId: dto.activityId,
        code: dto.code,
        nom: dto.nom,
        capacite: dto.capacite,
        statut: dto.statut ?? RESOURCE_STATUS.LIBRE,
      },
    });
  }

  listTables(companyId: string, activityId: string) {
    return this.prisma.restaurantTable.findMany({
      where: { companyId, activityId, deletedAt: null },
      orderBy: [{ code: "asc" }],
    });
  }

  async updateTableStatus(id: string, companyId: string, activityId: string, statut: string) {
    const table = await this.prisma.restaurantTable.findFirst({
      where: { id, companyId, activityId, deletedAt: null },
    });
    if (!table) throw new NotFoundException("Table introuvable");

    const updated = await this.prisma.restaurantTable.update({
      where: { id },
      data: { statut: statut as any },
    });

    this.realtimeGateway.broadcastRestaurantTableUpdated(updated);
    return updated;
  }

  async createMenuCategory(dto: CreateMenuCategoryDto) {
    await this.ensureRestaurantActivity(dto.companyId, dto.activityId);

    return this.prisma.menuCategory.create({
      data: {
        companyId: dto.companyId,
        activityId: dto.activityId,
        nom: dto.nom,
        description: dto.description,
        ordre: dto.ordre ?? 0,
      },
    });
  }

  listMenu(companyId: string, activityId: string) {
    return this.prisma.menuCategory.findMany({
      where: { companyId, activityId, deletedAt: null, actif: true },
      include: {
        items: {
          where: { deletedAt: null },
          include: { options: { where: { actif: true } } },
          orderBy: [{ ordre: "asc" }, { nom: "asc" }],
        },
      },
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
    });
  }

  async createMenuItem(dto: CreateMenuItemDto) {
    await this.ensureRestaurantActivity(dto.companyId, dto.activityId);

    return this.prisma.menuItem.create({
      data: {
        companyId: dto.companyId,
        activityId: dto.activityId,
        categoryId: dto.categoryId,
        nom: dto.nom,
        prix: dto.prix,
        description: dto.description,
        image: dto.image,
        statut: dto.statut ?? MENU_ITEM_STATUS.DISPONIBLE,
        options: dto.options?.length
          ? {
              create: dto.options.map((option) => ({
                companyId: dto.companyId,
                activityId: dto.activityId,
                nom: option.nom,
                prix: option.prix,
              })),
            }
          : undefined,
      },
      include: { options: true, category: true },
    });
  }

  async updateMenuItem(id: string, companyId: string, activityId: string, dto: UpdateMenuItemDto) {
    const existing = await this.prisma.menuItem.findFirst({
      where: { id, companyId, activityId, deletedAt: null },
      include: { options: true },
    });

    if (!existing) {
      throw new NotFoundException("Plat introuvable");
    }

    return this.prisma.$transaction(async (tx: any) => {
      if (dto.options) {
        await tx.menuItemOption.deleteMany({
          where: { menuItemId: id },
        });
      }

      return tx.menuItem.update({
        where: { id },
        data: {
          categoryId: dto.categoryId,
          nom: dto.nom,
          prix: dto.prix,
          description: dto.description,
          image: dto.image,
          statut: dto.statut,
          options: dto.options
            ? {
                create: dto.options.map((option) => ({
                  companyId,
                  activityId,
                  nom: option.nom,
                  prix: option.prix,
                })),
              }
            : undefined,
        },
        include: { options: true, category: true },
      });
    });
  }

  async createOrder(dto: CreateRestaurantOrderDto) {
    await this.ensureRestaurantActivity(dto.companyId, dto.activityId);

    const table = await this.prisma.restaurantTable.findFirst({
      where: { id: dto.tableId, companyId: dto.companyId, activityId: dto.activityId, deletedAt: null },
    });
    if (!table) throw new NotFoundException("Table introuvable");

    const total = dto.items.reduce((sum, item) => sum + item.quantite * item.prixUnitaire, 0);
    const reference = `R-${Date.now()}`;
    const kitchenCode = `KT-${Date.now()}`;

    const order = await this.prisma.$transaction(async (tx: any) => {
      const createdOrder = await tx.restaurantOrder.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          clientId: dto.clientId,
          serverId: dto.serverId,
          tableId: dto.tableId,
          reference,
          statut: ORDER_STATUS.EN_COURS,
          statutCuisine: RESTAURANT_KITCHEN_STATUS.EN_ATTENTE,
          commentaire: dto.commentaire,
          notesCuisine: dto.notesCuisine,
          totalTtc: total,
          items: {
            create: dto.items.map((item) => ({
              companyId: dto.companyId,
              activityId: dto.activityId,
              menuItemId: item.menuItemId,
              libelle: item.libelle,
              quantite: item.quantite,
              prixUnitaire: item.prixUnitaire,
              totalLigne: item.quantite * item.prixUnitaire,
              note: item.note,
            })),
          },
        },
        include: {
          items: true,
          table: true,
          serveur: true,
        },
      });

      await tx.kitchenTicket.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          restaurantOrderId: createdOrder.id,
          code: kitchenCode,
          statut: RESTAURANT_KITCHEN_STATUS.EN_ATTENTE,
          note: dto.notesCuisine,
        },
      });

      await tx.restaurantTable.update({
        where: { id: dto.tableId },
        data: { statut: RESOURCE_STATUS.OCCUPEE },
      });

      return createdOrder;
    });

    this.realtimeGateway.broadcastRestaurantOrderCreated(order);
    this.realtimeGateway.broadcastKitchenTicketCreated({
      companyId: dto.companyId,
      activityId: dto.activityId,
      orderId: order.id,
      reference: order.reference,
      table: order.table?.nom ?? order.table?.code,
      items: order.items,
    });
    this.realtimeGateway.broadcastRestaurantTableUpdated({
      id: dto.tableId,
      companyId: dto.companyId,
      activityId: dto.activityId,
        statut: RESOURCE_STATUS.OCCUPEE,
    });

    return order;
  }

  listOrders(companyId: string, activityId: string) {
    return this.prisma.restaurantOrder.findMany({
      where: { companyId, activityId, deletedAt: null },
      include: {
        items: true,
        table: true,
        client: true,
        serveur: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  kitchenBoard(companyId: string, activityId: string) {
    return this.prisma.kitchenTicket.findMany({
      where: {
        companyId,
        activityId,
        statut: { in: [RESTAURANT_KITCHEN_STATUS.EN_ATTENTE, RESTAURANT_KITCHEN_STATUS.EN_PREPARATION, RESTAURANT_KITCHEN_STATUS.PRET] },
      },
      include: {
        restaurantOrder: {
          include: {
            items: true,
            table: true,
            serveur: true,
          },
        },
      },
      orderBy: { sentAt: "asc" },
    });
  }

  async updateKitchenStatus(id: string, companyId: string, activityId: string, statut: string, handledByUserId?: string) {
    const ticket = await this.prisma.kitchenTicket.findFirst({
      where: { id, companyId, activityId },
      include: { restaurantOrder: true },
    });
    if (!ticket) throw new NotFoundException("Ticket cuisine introuvable");

    const updated = await this.prisma.$transaction(async (tx: any) => {
      const nextTicket = await tx.kitchenTicket.update({
        where: { id },
        data: {
          statut,
          handledByUserId,
          readyAt: statut === RESTAURANT_KITCHEN_STATUS.PRET ? new Date() : undefined,
          servedAt: statut === RESTAURANT_KITCHEN_STATUS.SERVI ? new Date() : undefined,
        },
        include: {
          restaurantOrder: {
            include: { table: true, serveur: true, items: true },
          },
        },
      });

      await tx.restaurantOrder.update({
        where: { id: ticket.restaurantOrderId },
        data: {
          statutCuisine: statut,
          statut:
            statut === RESTAURANT_KITCHEN_STATUS.SERVI
              ? ORDER_STATUS.SERVI
              : statut === RESTAURANT_KITCHEN_STATUS.ANNULE
                ? ORDER_STATUS.ANNULE
                : ORDER_STATUS.EN_COURS,
        },
      });

      return nextTicket;
    });

    this.realtimeGateway.broadcastKitchenStatusUpdated(updated);
    if (statut === RESTAURANT_KITCHEN_STATUS.PRET) {
      this.realtimeGateway.broadcastRestaurantDishReady({
        ticketId: updated.id,
        companyId,
        activityId,
        orderId: updated.restaurantOrderId,
        reference: updated.restaurantOrder.reference,
        table: updated.restaurantOrder.table?.nom ?? updated.restaurantOrder.table?.code,
      });
    }
    return updated;
  }

  async createPayment(dto: CreateRestaurantPaymentDto) {
    await this.ensureRestaurantActivity(dto.companyId, dto.activityId);

    const order = await this.prisma.restaurantOrder.findFirst({
      where: { id: dto.restaurantOrderId, companyId: dto.companyId, activityId: dto.activityId, deletedAt: null },
      include: { payments: true, table: true },
    });
    if (!order) throw new NotFoundException("Commande introuvable");

    const alreadyPaid = order.payments.reduce((sum: number, item: { montant: unknown }) => sum + Number(item.montant), 0);
    const newPaid = alreadyPaid + dto.montant;
    const reference = `PAY-${Date.now()}`;

    const payment = await this.prisma.$transaction(async (tx: any) => {
      const createdPayment = await tx.payment.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          restaurantOrderId: dto.restaurantOrderId,
          processedByUserId: dto.processedByUserId,
          reference,
          montant: dto.montant,
          modePaiement: dto.modePaiement,
          statut: PAYMENT_STATUS.PAYE,
          note: dto.note,
        },
      });

      const statutPaiement =
        newPaid >= Number(order.totalTtc) ? PAYMENT_STATUS.PAYE : PAYMENT_STATUS.PARTIEL;

      await tx.restaurantOrder.update({
        where: { id: order.id },
        data: {
          statutPaiement,
          modePaiement: dto.modePaiement,
          statut: statutPaiement === PAYMENT_STATUS.PAYE ? ORDER_STATUS.PAYE : order.statut,
        },
      });

      await tx.financialTransaction.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          userId: dto.processedByUserId,
          restaurantOrderId: dto.restaurantOrderId,
          reference: `FIN-${reference}`,
          typeTransaction: FINANCIAL_TRANSACTION_TYPE.VENTE,
          modePaiement: dto.modePaiement,
          statutPaiement: PAYMENT_STATUS.PAYE,
          montant: dto.montant,
          description: "Encaissement restaurant",
        },
      });

      if (statutPaiement === PAYMENT_STATUS.PAYE && order.tableId) {
        await tx.restaurantTable.update({
          where: { id: order.tableId },
          data: { statut: RESOURCE_STATUS.EN_NETTOYAGE },
        });
      }

      return createdPayment;
    });

    this.realtimeGateway.broadcastRestaurantPaymentCreated(payment);
    if (order.tableId && newPaid >= Number(order.totalTtc)) {
      this.realtimeGateway.broadcastRestaurantTableUpdated({
        id: order.tableId,
        companyId: dto.companyId,
        activityId: dto.activityId,
        statut: RESOURCE_STATUS.EN_NETTOYAGE,
      });
    }

    return payment;
  }

  async restaurantStats(companyId: string, activityId: string, query: RestaurantStatsQueryDto) {
    const now = new Date();
    const from = query.from ? new Date(query.from) : new Date(now.getFullYear(), now.getMonth(), 1);
    const to = query.to ? new Date(query.to) : now;

    const [orders, items, tickets] = await Promise.all([
      this.prisma.restaurantOrder.findMany({
        where: { companyId, activityId, createdAt: { gte: from, lte: to } },
        include: { items: true },
      }),
      this.prisma.restaurantOrderItem.findMany({
        where: {
          companyId,
          activityId,
          createdAt: { gte: from, lte: to },
        },
      }),
      this.prisma.kitchenTicket.findMany({
        where: { companyId, activityId, sentAt: { gte: from, lte: to } },
      }),
    ]);

    const revenue = orders.reduce((sum: number, order: { totalTtc: unknown }) => sum + Number(order.totalTtc), 0);
    const byItem = new Map<string, { label: string; qty: number }>();
    for (const item of items) {
      const current = byItem.get(item.libelle) ?? { label: item.libelle, qty: 0 };
      current.qty += item.quantite;
      byItem.set(item.libelle, current);
    }

    const prepTimes = tickets
      .filter((ticket: { readyAt: Date | null }) => ticket.readyAt)
      .map((ticket: { readyAt: Date | null; sentAt: Date }) => new Date(ticket.readyAt!).getTime() - new Date(ticket.sentAt).getTime());

    const averagePreparationMinutes = prepTimes.length
      ? Math.round(prepTimes.reduce((sum: number, value: number) => sum + value, 0) / prepTimes.length / 60000)
      : 0;

    return {
      revenue,
      totalOrders: orders.length,
      averagePreparationMinutes,
      topItems: Array.from(byItem.values())
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 8),
      statuses: {
        pending: orders.filter((order: { statutCuisine: string }) => order.statutCuisine === RESTAURANT_KITCHEN_STATUS.EN_ATTENTE).length,
        preparing: orders.filter((order: { statutCuisine: string }) => order.statutCuisine === RESTAURANT_KITCHEN_STATUS.EN_PREPARATION).length,
        ready: orders.filter((order: { statutCuisine: string }) => order.statutCuisine === RESTAURANT_KITCHEN_STATUS.PRET).length,
        served: orders.filter((order: { statutCuisine: string }) => order.statutCuisine === RESTAURANT_KITCHEN_STATUS.SERVI).length,
      },
    };
  }

  private async ensureRestaurantActivity(companyId: string, activityId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, companyId, type: ACTIVITY_TYPE.RESTAURANT, deletedAt: null },
    });
    if (!activity) {
      throw new BadRequestException("Cette activite n'est pas un restaurant valide");
    }
    return activity;
  }
}
