import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ActivityType } from "@prisma/client";
import { PrismaService } from "../../config/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { CreateHappyHourDto } from "./dto/create-happy-hour.dto";
import { CreateTerraceCategoryDto } from "./dto/create-terrace-category.dto";
import { CreateTerraceItemDto } from "./dto/create-terrace-item.dto";
import { CreateTerraceOrderDto } from "./dto/create-terrace-order.dto";
import { CreateTerracePaymentDto } from "./dto/create-terrace-payment.dto";
import { CreateTerraceTableDto } from "./dto/create-terrace-table.dto";

const RESOURCE_STATUS = {
  LIBRE: "LIBRE",
  OCCUPEE: "OCCUPEE",
} as const;

const MENU_ITEM_STATUS = {
  DISPONIBLE: "DISPONIBLE",
} as const;

const PAYMENT_STATUS = {
  PAYE: "PAYE",
  PARTIEL: "PARTIEL",
} as const;

const TERRACE_ORDER_STATUS = {
  EN_ATTENTE: "EN_ATTENTE",
  SERVI: "SERVI",
} as const;

const FINANCIAL_TRANSACTION_TYPE = {
  VENTE: "VENTE",
} as const;

type HappyHourMatch = {
  nom: string;
  reductionPct: unknown;
  joursSemaine: string;
};

@Injectable()
export class TerraceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async createTable(dto: CreateTerraceTableDto) {
    await this.ensureTerraceActivity(dto.companyId, dto.activityId);
    return this.prisma.terraceTable.create({
      data: {
        companyId: dto.companyId,
        activityId: dto.activityId,
        code: dto.code,
        nom: dto.nom,
        emplacement: dto.emplacement,
        capacite: dto.capacite,
        statut: dto.statut ?? RESOURCE_STATUS.LIBRE,
      },
    });
  }

  listTables(companyId: string, activityId: string) {
    return this.prisma.terraceTable.findMany({
      where: { companyId, activityId, deletedAt: null },
      orderBy: [{ code: "asc" }],
    });
  }

  async updateTableStatus(id: string, companyId: string, activityId: string, statut: string) {
    const table = await this.prisma.terraceTable.findFirst({
      where: { id, companyId, activityId, deletedAt: null },
    });
    if (!table) throw new NotFoundException("Zone terrasse introuvable");
    const updated = await this.prisma.terraceTable.update({ where: { id }, data: { statut: statut as never } });
    this.realtimeGateway.broadcastTerraceTableUpdated(updated);
    return updated;
  }

  async createCategory(dto: CreateTerraceCategoryDto) {
    await this.ensureTerraceActivity(dto.companyId, dto.activityId);
    try {
      return await this.prisma.terraceMenuCategory.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          nom: dto.nom,
          description: dto.description,
        },
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") {
        throw new BadRequestException("Une categorie portant ce nom existe deja pour cette terrasse.");
      }
      throw error;
    }
  }

  async createItem(dto: CreateTerraceItemDto) {
    await this.ensureTerraceActivity(dto.companyId, dto.activityId);
    return this.prisma.terraceMenuItem.create({
      data: {
        companyId: dto.companyId,
        activityId: dto.activityId,
        categoryId: dto.categoryId,
        nom: dto.nom,
        prix: dto.prix,
        description: dto.description,
        boissonUniquement: dto.boissonUniquement ?? true,
        statut: MENU_ITEM_STATUS.DISPONIBLE,
      },
    });
  }

  menu(companyId: string, activityId: string) {
    return this.prisma.terraceMenuCategory.findMany({
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

  async createHappyHour(dto: CreateHappyHourDto) {
    await this.ensureTerraceActivity(dto.companyId, dto.activityId);
    return this.prisma.happyHourRule.create({
      data: {
        companyId: dto.companyId,
        activityId: dto.activityId,
        nom: dto.nom,
        reductionPct: dto.reductionPct,
        startTime: dto.startTime,
        endTime: dto.endTime,
        joursSemaine: dto.joursSemaine,
        actif: dto.actif ?? true,
      },
    });
  }

  happyHours(companyId: string, activityId: string) {
    return this.prisma.happyHourRule.findMany({
      where: { companyId, activityId, actif: true },
      orderBy: { startTime: "asc" },
    });
  }

  async createOrder(dto: CreateTerraceOrderDto) {
    await this.ensureTerraceActivity(dto.companyId, dto.activityId);
    const rule = await this.resolveHappyHour(dto.companyId, dto.activityId);
    const totalBrut = dto.items.reduce((sum, item) => sum + item.quantite * item.prixUnitaire, 0);
    const reduction = rule ? (totalBrut * Number(rule.reductionPct)) / 100 : 0;
    const totalNet = totalBrut - reduction;
    const reference = `TERR-${Date.now()}`;

    const order = await this.prisma.$transaction(async (tx: any) => {
      const created = await tx.terraceOrder.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          clientId: dto.clientId,
          serverId: dto.serverId,
          terraceTableId: dto.terraceTableId,
          reference,
          statut: TERRACE_ORDER_STATUS.EN_ATTENTE,
          totalBrut,
          reductionMontant: reduction,
          totalNet,
          happyHourLabel: rule?.nom,
          note: dto.note,
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
        include: { items: true, table: true },
      });

      if (dto.terraceTableId) {
        await tx.terraceTable.update({
          where: { id: dto.terraceTableId },
          data: { statut: RESOURCE_STATUS.OCCUPEE },
        });
      }

      return created;
    });

    this.realtimeGateway.broadcastTerraceOrderCreated(order as any);
    if (dto.terraceTableId) {
      this.realtimeGateway.broadcastTerraceTableUpdated({
        id: dto.terraceTableId,
        companyId: dto.companyId,
        activityId: dto.activityId,
        statut: RESOURCE_STATUS.OCCUPEE,
      });
    }
    return order;
  }

  orders(companyId: string, activityId: string) {
    return this.prisma.terraceOrder.findMany({
      where: { companyId, activityId, deletedAt: null },
      include: { items: true, table: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateOrderStatus(id: string, companyId: string, activityId: string, statut: string) {
    const order = await this.prisma.terraceOrder.findFirst({
      where: { id, companyId, activityId, deletedAt: null },
    });
    if (!order) throw new NotFoundException("Commande terrasse introuvable");
    const updated = await this.prisma.terraceOrder.update({ where: { id }, data: { statut: statut as never } });
    this.realtimeGateway.broadcastTerraceOrderStatusUpdated(updated);
    return updated;
  }

  async createPayment(dto: CreateTerracePaymentDto) {
    await this.ensureTerraceActivity(dto.companyId, dto.activityId);
    const order = await this.prisma.terraceOrder.findFirst({
      where: { id: dto.terraceOrderId, companyId: dto.companyId, activityId: dto.activityId, deletedAt: null },
      include: { payments: true },
    });
    if (!order) throw new NotFoundException("Ticket terrasse introuvable");

    const alreadyPaid = order.payments.reduce((sum: number, item: { montant: unknown }) => sum + Number(item.montant), 0);
    const after = alreadyPaid + dto.montant;
    const payment = await this.prisma.$transaction(async (tx: any) => {
      const created = await tx.terracePayment.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          terraceOrderId: dto.terraceOrderId,
          processedByUserId: dto.processedByUserId,
          reference: `TPAY-${Date.now()}`,
          montant: dto.montant,
          modePaiement: dto.modePaiement,
        },
      });

      const statutPaiement = after >= Number(order.totalNet) ? PAYMENT_STATUS.PAYE : PAYMENT_STATUS.PARTIEL;
      await tx.terraceOrder.update({
        where: { id: order.id },
        data: {
          statutPaiement,
          modePaiement: dto.modePaiement,
          statut: statutPaiement === PAYMENT_STATUS.PAYE ? TERRACE_ORDER_STATUS.SERVI : order.statut,
        },
      });

      await tx.financialTransaction.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          userId: dto.processedByUserId,
          reference: `FIN-TPAY-${Date.now()}`,
          typeTransaction: FINANCIAL_TRANSACTION_TYPE.VENTE,
          modePaiement: dto.modePaiement,
          statutPaiement: PAYMENT_STATUS.PAYE,
          montant: dto.montant,
          description: "Encaissement terrasse",
        },
      });

      if (order.terraceTableId && statutPaiement === PAYMENT_STATUS.PAYE) {
        await tx.terraceTable.update({
          where: { id: order.terraceTableId },
          data: { statut: RESOURCE_STATUS.LIBRE },
        });
      }
      return created;
    });

    this.realtimeGateway.broadcastTerracePaymentCreated(payment as any);
    if (order.terraceTableId && after >= Number(order.totalNet)) {
      this.realtimeGateway.broadcastTerraceTableUpdated({
        id: order.terraceTableId,
        companyId: dto.companyId,
        activityId: dto.activityId,
        statut: RESOURCE_STATUS.LIBRE,
      });
    }
    return payment;
  }

  async stats(companyId: string, activityId: string) {
    const orders = await this.prisma.terraceOrder.findMany({
      where: { companyId, activityId, deletedAt: null },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    });

    const byDrink = new Map<string, number>();
    const byHour = new Map<string, number>();
    let happyHourRevenue = 0;

    for (const order of orders) {
      const hour = new Date(order.createdAt).getHours().toString().padStart(2, "0") + "h";
      byHour.set(hour, (byHour.get(hour) ?? 0) + Number(order.totalNet));
      if (order.happyHourLabel) happyHourRevenue += Number(order.totalNet);
      for (const item of order.items) {
        byDrink.set(item.libelle, (byDrink.get(item.libelle) ?? 0) + item.quantite);
      }
    }

    return {
      revenue: orders.reduce((sum: number, order: { totalNet: unknown }) => sum + Number(order.totalNet), 0),
      totalOrders: orders.length,
      impactHappyHour: happyHourRevenue,
      topDrinks: Array.from(byDrink.entries()).map(([label, qty]) => ({ label, qty })).sort((a, b) => b.qty - a.qty).slice(0, 8),
      volumeByHour: Array.from(byHour.entries()).map(([hour, amount]) => ({ hour, amount })),
    };
  }

  private async ensureTerraceActivity(companyId: string, activityId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, companyId, type: ActivityType.TERRASSE, deletedAt: null },
    });
    if (!activity) throw new BadRequestException("Cette activite n'est pas une terrasse valide");
    return activity;
  }

  private async resolveHappyHour(companyId: string, activityId: string) {
    const now = new Date();
    const hhmm = now.toTimeString().slice(0, 5);
    const jsDay = now.getDay();
    return this.prisma.happyHourRule.findFirst({
      where: {
        companyId,
        activityId,
        actif: true,
        startTime: { lte: hhmm },
        endTime: { gte: hhmm },
      },
      orderBy: { reductionPct: "desc" },
    }).then((rule: HappyHourMatch | null) => {
      if (!rule) return null;
      const days = rule.joursSemaine.split(",").map((v: string) => Number(v.trim()));
      return days.includes(jsDay) ? rule : null;
    });
  }
}
