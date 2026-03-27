import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { DashboardStatsQueryDto } from "./dto/dashboard-stats-query.dto";

const PAYMENT_STATUS = {
  PAYE: "PAYE",
} as const;

const SHOP_SALE_STATUS = {
  VALIDEE: "VALIDEE",
  PAYEE: "PAYEE",
} as const;

const ORDER_STATUS = {
  BROUILLON: "BROUILLON",
  EN_COURS: "EN_COURS",
  SERVI: "SERVI",
} as const;

const STOCK_MOVEMENT_TYPE = {
  SORTIE: "SORTIE",
} as const;

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(companyId: string, query: DashboardStatsQueryDto) {
    const now = new Date();
    const from = query.from ? new Date(query.from) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const to = query.to ? new Date(query.to) : now;
    const activityId = query.activityId || undefined;
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      activities,
      transactions,
      restaurantOrdersToday,
      shopSalesToday,
      ordersInProgress,
      lowStockProducts,
      recentLogs,
      presenceLogs,
      usersCount,
      clientsCount,
      activeActivitiesCount,
    ] = await Promise.all([
      this.prisma.activity.findMany({
        where: {
          companyId,
          deletedAt: null,
          ...(activityId ? { id: activityId } : {}),
        },
      }),
      this.prisma.financialTransaction.findMany({
        where: {
          companyId,
          deletedAt: null,
          statutPaiement: PAYMENT_STATUS.PAYE,
          dateTransaction: {
            gte: from,
            lte: to,
          },
          ...(activityId ? { activityId } : {}),
        },
        include: {
          activity: true,
          user: true,
        },
        orderBy: { dateTransaction: "asc" },
      }),
      this.prisma.restaurantOrder.count({
        where: {
          companyId,
          createdAt: { gte: todayStart },
          ...(activityId ? { activityId } : {}),
        },
      }),
      this.prisma.shopSale.count({
        where: {
          companyId,
          createdAt: { gte: todayStart },
          statut: { in: [SHOP_SALE_STATUS.VALIDEE, SHOP_SALE_STATUS.PAYEE] },
          ...(activityId ? { activityId } : {}),
        },
      }),
      this.prisma.restaurantOrder.count({
        where: {
          companyId,
          statut: { in: [ORDER_STATUS.BROUILLON, ORDER_STATUS.EN_COURS, ORDER_STATUS.SERVI] },
          ...(activityId ? { activityId } : {}),
        },
      }),
      this.prisma.shopProduct.findMany({
        where: {
          companyId,
          deletedAt: null,
          ...(activityId ? { activityId } : {}),
        },
        include: {
          activity: true,
        },
      }),
      this.prisma.userActivityLog.findMany({
        where: {
          companyId,
          ...(activityId ? { activityId } : {}),
        },
        include: {
          user: true,
          activity: true,
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      this.prisma.userActivityLog.findMany({
        where: {
          companyId,
          module: "TIME_TRACKING",
          createdAt: { gte: todayStart },
          ...(activityId ? { activityId } : {}),
        },
        include: {
          user: true,
          activity: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({
        where: {
          companyId,
          deletedAt: null,
          statut: "ACTIVE",
        },
      }),
      this.prisma.client.count({
        where: {
          companyId,
          deletedAt: null,
        },
      }),
      this.prisma.activity.count({
        where: {
          companyId,
          deletedAt: null,
          statut: "ACTIVE",
        },
      }),
    ]);

    const totalRevenue = transactions.reduce((sum: number, item: { montant: unknown }) => sum + Number(item.montant), 0);
    const revenueByDayMap = new Map<string, { revenue: number; orders: number }>();

    for (let cursor = new Date(from); cursor <= to; cursor.setDate(cursor.getDate() + 1)) {
      const label = cursor.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
      revenueByDayMap.set(label, { revenue: 0, orders: 0 });
    }

    const activityRevenueMap = new Map<
      string,
      { activityName: string; activityType: string; revenue: number; sales: number; status: string }
    >();

    for (const activity of activities) {
      activityRevenueMap.set(activity.id, {
        activityName: activity.nom,
        activityType: String(activity.type),
        revenue: 0,
        sales: 0,
        status: activity.statut,
      });
    }

    for (const transaction of transactions) {
      const label = new Date(transaction.dateTransaction).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      });
      const seriesItem = revenueByDayMap.get(label);
      if (seriesItem) {
        seriesItem.revenue += Number(transaction.montant);
        seriesItem.orders += 1;
      }

      if (transaction.activityId) {
        const aggregate = activityRevenueMap.get(transaction.activityId);
        if (aggregate) {
          aggregate.revenue += Number(transaction.montant);
          aggregate.sales += 1;
        }
      }
    }

    const lowStockAlerts = lowStockProducts
      .filter((product: { stockActuel: number; stockMinimum: number }) => product.stockActuel <= product.stockMinimum)
      .slice(0, 6)
      .map((product: { id: string; nom: string; activity: { nom: string }; stockActuel: number; stockMinimum: number }) => ({
        id: product.id,
        productName: product.nom,
        activityName: product.activity.nom,
        stock: product.stockActuel,
        minimum: product.stockMinimum,
      }));

    const presenceMap = new Map<string, { userName: string; activityName: string; status: "PRESENT" | "ABSENT"; lastActionAt?: string }>();
    for (const log of presenceLogs) {
      if (!log.user) {
        continue;
      }
      if (!presenceMap.has(log.userId)) {
        presenceMap.set(log.userId, {
          userName: `${log.user.prenom} ${log.user.nom}`,
          activityName: log.activity?.nom ?? "Sans activite",
          status: log.action === "CLOCK_IN" ? "PRESENT" : "ABSENT",
          lastActionAt: log.createdAt.toISOString(),
        });
      }
    }

    const salesToday = restaurantOrdersToday + shopSalesToday;

    return {
      kpis: [
        {
          label: "Chiffre d'affaires global",
          value: this.formatCurrency(totalRevenue),
          delta: `${transactions.length} encaissements`,
          tone: "success",
        },
        {
          label: "Ventes du jour",
          value: String(salesToday),
          delta: "Toutes activites",
          tone: "neutral",
        },
        {
          label: "Commandes en cours",
          value: String(ordersInProgress),
          delta: "Modules actifs",
          tone: "warning",
        },
        {
          label: "Alertes stock faible",
          value: String(lowStockAlerts.length),
          delta: "Action recommandee",
          tone: lowStockAlerts.length ? "danger" : "success",
        },
      ],
      revenueSeries: Array.from(revenueByDayMap.entries()).map(([label, values]) => ({
        label,
        revenue: values.revenue,
        orders: values.orders,
      })),
      revenueByActivity: Array.from(activityRevenueMap.entries()).map(([id, values]) => ({
        activityId: id,
        activityName: values.activityName,
        activityType: values.activityType,
        revenue: values.revenue,
        sales: values.sales,
        status: values.status,
      })),
      stockAlerts: lowStockAlerts,
      employeePresence: Array.from(presenceMap.entries()).map(([userId, values]) => ({
        userId,
        userName: values.userName,
        activityName: values.activityName,
        status: values.status,
        lastActionAt: values.lastActionAt,
      })),
      recentActivities: recentLogs.map((item: any) => ({
        id: item.id,
        userName: item.user ? `${item.user.prenom} ${item.user.nom}` : "Utilisateur",
        action: item.action,
        module: item.module,
        description: item.description,
        activityName: item.activity?.nom ?? null,
        createdAt: item.createdAt.toISOString(),
      })),
      shortcuts: [
        {
          label: "Utilisateurs",
          href: "/users",
          description: "Gerer les comptes, roles et activites.",
        },
        {
          label: "Profil",
          href: "/profile",
          description: "Mettre a jour le profil et la session.",
        },
        {
          label: "Activites",
          href: "/select-activity",
          description: "Changer rapidement de module actif.",
        },
        {
          label: "Entreprises",
          href: "/select-company",
          description: "Basculer sur une autre entreprise autorisee.",
        },
      ],
      quickStats: [
        {
          label: "Employes actifs",
          value: String(usersCount),
          helper: "Equipe disponible",
        },
        {
          label: "Clients en base",
          value: String(clientsCount),
          helper: "Portefeuille entreprise",
        },
        {
          label: "Activites actives",
          value: String(activeActivitiesCount),
          helper: "Modules operants",
        },
        {
          label: "Mouvements stock",
          value: String(
            await this.prisma.stockMovement.count({
              where: {
                companyId,
                typeMouvement: STOCK_MOVEMENT_TYPE.SORTIE,
                ...(activityId ? { activityId } : {}),
              },
            }),
          ),
          helper: "Sorties inventaire",
        },
      ],
    };
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(value);
  }
}
