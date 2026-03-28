import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { CreateExpenseCategoryDto } from "./dto/create-expense-category.dto";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { FinanceReportQueryDto } from "./dto/finance-report-query.dto";

const ACTIVITY_TYPE = {
  RESTAURANT: "RESTAURANT",
  TERRASSE: "TERRASSE",
  BOITE_NUIT: "BOITE_NUIT",
  SHOP: "SHOP",
} as const;

const FINANCIAL_TRANSACTION_TYPE = {
  DEPENSE: "DEPENSE",
  VENTE: "VENTE",
} as const;

const PAYMENT_STATUS = {
  PAYE: "PAYE",
} as const;

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultExpenseCategories = [
    { code: "SALAIRES", nom: "Salaires", description: "Charges salariales et primes" },
    { code: "APPRO", nom: "Approvisionnement", description: "Achats de stock et marchandises" },
    { code: "MAINT", nom: "Maintenance", description: "Entretien, reparation et maintenance" },
    { code: "TRANSPORT", nom: "Transport", description: "Carburant, livraison et deplacements" },
    { code: "MARKETING", nom: "Marketing", description: "Communication, publicite et promotion" },
    { code: "DIVERS", nom: "Divers", description: "Depenses generales diverses" },
  ] as const;

  async createExpenseCategory(dto: CreateExpenseCategoryDto) {
    const exists = await this.prisma.financeAccount.findFirst({
      where: {
        companyId: dto.companyId,
        OR: [{ code: dto.code }, { nom: dto.nom }],
        deletedAt: null,
      },
    });
    if (exists) {
      throw new ConflictException("Cette categorie de depense existe deja pour cette entreprise");
    }

    return this.prisma.financeAccount.create({
      data: {
        companyId: dto.companyId,
        code: dto.code,
        nom: dto.nom,
        description: dto.description,
        actif: true,
      },
    });
  }

  async expenseCategories(companyId: string) {
    await this.ensureDefaultExpenseCategories(companyId);
    return this.prisma.financeAccount.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { nom: "asc" },
    });
  }

  async createExpense(dto: CreateExpenseDto) {
    const account = await this.prisma.financeAccount.findFirst({
      where: { id: dto.financeAccountId, companyId: dto.companyId, deletedAt: null },
    });
    if (!account) throw new NotFoundException("Categorie de depense introuvable");

    return this.prisma.financialTransaction.create({
      data: {
        companyId: dto.companyId,
        activityId: dto.activityId,
        financeAccountId: dto.financeAccountId,
        userId: dto.userId,
        reference: `DEP-${Date.now()}`,
        typeTransaction: FINANCIAL_TRANSACTION_TYPE.DEPENSE,
        statutPaiement: PAYMENT_STATUS.PAYE,
        montant: dto.montant,
        description: dto.description,
        justificatif: dto.justificatif,
        dateTransaction: new Date(dto.dateTransaction),
      },
      include: {
        activity: true,
        financeAccount: true,
        user: true,
      },
    });
  }

  expenses(companyId: string, activityId?: string, from?: Date, to?: Date) {
    return this.prisma.financialTransaction.findMany({
      where: {
        companyId,
        typeTransaction: FINANCIAL_TRANSACTION_TYPE.DEPENSE,
        deletedAt: null,
        ...(activityId ? { activityId } : {}),
        ...(from || to
          ? {
              dateTransaction: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      include: {
        activity: true,
        financeAccount: true,
        user: true,
      },
      orderBy: { dateTransaction: "desc" },
    });
  }

  async dashboard(companyId: string, query: FinanceReportQueryDto) {
    const { from, to, activityId } = this.resolveRange(query);

    const [
      expenseTransactions,
      activities,
      restaurantPayments,
      terracePayments,
      nightclubTickets,
      nightclubBookings,
      nightclubBottlePayments,
      shopSales,
      extraRevenueTransactions,
    ] = await Promise.all([
      this.prisma.financialTransaction.findMany({
        where: {
          companyId,
          deletedAt: null,
          typeTransaction: FINANCIAL_TRANSACTION_TYPE.DEPENSE,
          dateTransaction: { gte: from, lte: to },
          ...(activityId ? { activityId } : {}),
        },
        include: { activity: true, user: true, financeAccount: true },
        orderBy: { dateTransaction: "desc" },
      }),
      this.prisma.activity.findMany({
        where: { companyId, deletedAt: null, ...(activityId ? { id: activityId } : {}) },
        orderBy: { nom: "asc" },
      }),
      this.prisma.payment.findMany({
        where: {
          companyId,
          createdAt: { gte: from, lte: to },
          statut: PAYMENT_STATUS.PAYE,
          ...(activityId ? { activityId } : {}),
        },
        select: { id: true, activityId: true, montant: true, createdAt: true, processedByUserId: true },
      }),
      this.prisma.terracePayment.findMany({
        where: {
          companyId,
          createdAt: { gte: from, lte: to },
          statut: PAYMENT_STATUS.PAYE,
          ...(activityId ? { activityId } : {}),
        },
        select: { id: true, activityId: true, montant: true, createdAt: true, processedByUserId: true },
      }),
      this.prisma.nightclubEntryTicket.findMany({
        where: {
          companyId,
          createdAt: { gte: from, lte: to },
          ...(activityId ? { activityId } : {}),
        },
        select: { id: true, activityId: true, montant: true, createdAt: true },
      }),
      this.prisma.nightclubBooking.findMany({
        where: {
          companyId,
          deletedAt: null,
          createdAt: { gte: from, lte: to },
          montantPaye: { gt: 0 },
          ...(activityId ? { activityId } : {}),
        },
        select: { id: true, activityId: true, montantPaye: true, createdAt: true, assigneeUserId: true },
      }),
      this.prisma.nightclubBottlePayment.findMany({
        where: {
          companyId,
          createdAt: { gte: from, lte: to },
          statut: PAYMENT_STATUS.PAYE,
          ...(activityId ? { activityId } : {}),
        },
        select: { id: true, activityId: true, montant: true, createdAt: true, processedByUserId: true },
      }),
      this.prisma.shopSale.findMany({
        where: {
          companyId,
          deletedAt: null,
          createdAt: { gte: from, lte: to },
          statutPaiement: PAYMENT_STATUS.PAYE,
          ...(activityId ? { activityId } : {}),
        },
        select: { id: true, activityId: true, totalTtc: true, createdAt: true, sellerId: true },
      }),
      this.prisma.financialTransaction.findMany({
        where: {
          companyId,
          deletedAt: null,
          typeTransaction: FINANCIAL_TRANSACTION_TYPE.VENTE,
          dateTransaction: { gte: from, lte: to },
          ...(activityId ? { activityId } : {}),
          restaurantOrderId: null,
          shopSaleId: null,
          nightclubBookingId: null,
        },
        include: { activity: true },
      }),
    ]);

    const coveredTypes = new Set<string>([
      ACTIVITY_TYPE.RESTAURANT,
      ACTIVITY_TYPE.TERRASSE,
      ACTIVITY_TYPE.BOITE_NUIT,
      ACTIVITY_TYPE.SHOP,
    ]);

    const coveredActivityIds = new Set(
      activities
        .filter((item) => coveredTypes.has(item.type))
        .map((item) => item.id),
    );

    const revenueOperations: Array<{
      source: string;
      activityId: string | null;
      amount: number;
      date: Date;
      userId?: string | null;
    }> = [
      ...restaurantPayments.map((item) => ({
        source: "restaurant",
        activityId: item.activityId,
        amount: Number(item.montant),
        date: item.createdAt,
        userId: item.processedByUserId,
      })),
      ...terracePayments.map((item) => ({
        source: "terrace",
        activityId: item.activityId,
        amount: Number(item.montant),
        date: item.createdAt,
        userId: item.processedByUserId,
      })),
      ...nightclubTickets.map((item) => ({
        source: "nightclub_ticket",
        activityId: item.activityId,
        amount: Number(item.montant),
        date: item.createdAt,
        userId: null,
      })),
      ...nightclubBookings.map((item) => ({
        source: "nightclub_booking",
        activityId: item.activityId,
        amount: Number(item.montantPaye),
        date: item.createdAt,
        userId: item.assigneeUserId,
      })),
      ...nightclubBottlePayments.map((item) => ({
        source: "nightclub_bottle",
        activityId: item.activityId,
        amount: Number(item.montant),
        date: item.createdAt,
        userId: item.processedByUserId,
      })),
      ...shopSales.map((item) => ({
        source: "shop",
        activityId: item.activityId,
        amount: Number(item.totalTtc),
        date: item.createdAt,
        userId: item.sellerId,
      })),
      ...extraRevenueTransactions
        .filter((item) => !item.activityId || !coveredActivityIds.has(item.activityId))
        .map((item) => ({
          source: "finance_manual",
          activityId: item.activityId,
          amount: Number(item.montant),
          date: item.dateTransaction,
          userId: item.userId,
        })),
    ];

    const revenue = revenueOperations.reduce((sum, item) => sum + item.amount, 0);
    const expenses = expenseTransactions.reduce((sum, item) => sum + Number(item.montant), 0);
    const profit = revenue - expenses;

    const byActivity = new Map<string, { activityId: string; activityName: string; revenue: number; expenses: number; profit: number }>();
    for (const activity of activities) {
      byActivity.set(activity.id, {
        activityId: activity.id,
        activityName: activity.nom,
        revenue: 0,
        expenses: 0,
        profit: 0,
      });
    }

    for (const operation of revenueOperations) {
      if (!operation.activityId) continue;
      const current = byActivity.get(operation.activityId);
      if (!current) continue;
      current.revenue += operation.amount;
      current.profit = current.revenue - current.expenses;
    }

    for (const transaction of expenseTransactions) {
      if (!transaction.activityId) continue;
      const current = byActivity.get(transaction.activityId);
      if (!current) continue;
      current.expenses += Number(transaction.montant);
      current.profit = current.revenue - current.expenses;
    }

    const byPeriod = new Map<string, { revenue: number; expenses: number; profit: number }>();
    for (const operation of revenueOperations) {
      const label = this.formatPeriodLabel(operation.date, query.granularity);
      const current = byPeriod.get(label) ?? { revenue: 0, expenses: 0, profit: 0 };
      current.revenue += operation.amount;
      current.profit = current.revenue - current.expenses;
      byPeriod.set(label, current);
    }
    for (const transaction of expenseTransactions) {
      const label = this.formatPeriodLabel(transaction.dateTransaction, query.granularity);
      const current = byPeriod.get(label) ?? { revenue: 0, expenses: 0, profit: 0 };
      current.expenses += Number(transaction.montant);
      current.profit = current.revenue - current.expenses;
      byPeriod.set(label, current);
    }

    const averageSale = revenueOperations.length ? revenue / revenueOperations.length : 0;
    const basketAverage = averageSale;

    const employeeStats = new Map<string, { revenue: number; operations: number }>();
    for (const operation of revenueOperations) {
      if (!operation.userId) continue;
      const current = employeeStats.get(operation.userId) ?? { revenue: 0, operations: 0 };
      current.revenue += operation.amount;
      current.operations += 1;
      employeeStats.set(operation.userId, current);
    }

    const employees = employeeStats.size
      ? await this.prisma.user.findMany({
          where: { id: { in: Array.from(employeeStats.keys()) } },
          select: { id: true, nom: true, prenom: true },
        })
      : [];
    const employeesById = new Map(employees.map((employee) => [employee.id, employee]));

    let topEmployee: { userId: string | null; revenue: number; operations: number; userName: string } | null = null;
    for (const [userId, stats] of employeeStats.entries()) {
      const user = employeesById.get(userId);
      const candidate = {
        userId,
        revenue: stats.revenue,
        operations: stats.operations,
        userName: user ? `${user.prenom} ${user.nom}` : "Utilisateur",
      };
      if (!topEmployee || candidate.revenue > topEmployee.revenue) {
        topEmployee = candidate;
      }
    }

    const mostProfitableActivity = Array.from(byActivity.values())
      .sort((a, b) => b.profit - a.profit)[0] ?? null;

    return {
      kpis: {
        revenue,
        expenses,
        profit,
        averageSale,
        basketAverage,
      },
      byActivity: Array.from(byActivity.values()),
      timeline: Array.from(byPeriod.entries()).map(([label, values]) => ({ label, ...values })),
      indicators: {
        mostProfitableActivity,
        topEmployee,
      },
      expenses: expenseTransactions.slice(0, 10),
      revenueSources: {
        restaurant: restaurantPayments.reduce((sum, item) => sum + Number(item.montant), 0),
        terrace: terracePayments.reduce((sum, item) => sum + Number(item.montant), 0),
        nightclub: nightclubTickets.reduce((sum, item) => sum + Number(item.montant), 0)
          + nightclubBookings.reduce((sum, item) => sum + Number(item.montantPaye), 0)
          + nightclubBottlePayments.reduce((sum, item) => sum + Number(item.montant), 0),
        shop: shopSales.reduce((sum, item) => sum + Number(item.totalTtc), 0),
        manual: extraRevenueTransactions
          .filter((item) => !item.activityId || !coveredActivityIds.has(item.activityId))
          .reduce((sum, item) => sum + Number(item.montant), 0),
      },
      reports: {
        from: from.toISOString(),
        to: to.toISOString(),
        granularity: query.granularity ?? "daily",
      },
    };
  }

  async report(companyId: string, query: FinanceReportQueryDto) {
    const dashboard = await this.dashboard(companyId, query);
    return {
      summary: dashboard.kpis,
      indicators: dashboard.indicators,
      byActivity: dashboard.byActivity,
      timeline: dashboard.timeline,
      expenses: await this.expenses(
        companyId,
        query.activityId,
        query.from ? new Date(query.from) : undefined,
        query.to ? new Date(query.to) : undefined,
      ),
      printable: {
        title: "Rapport financier",
        generatedAt: new Date().toISOString(),
      },
    };
  }

  private resolveRange(query: FinanceReportQueryDto) {
    const now = new Date();
    const from = query.from ? new Date(query.from) : new Date(now.getFullYear(), now.getMonth(), 1);
    const to = query.to ? new Date(query.to) : now;
    return { from, to, activityId: query.activityId };
  }

  private formatPeriodLabel(date: Date, granularity?: string) {
    if (granularity === "monthly") {
      return date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
    }
    if (granularity === "weekly") {
      const d = new Date(date);
      const first = new Date(d.setDate(d.getDate() - d.getDay() + 1));
      return `Semaine du ${first.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}`;
    }
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  }

  private async ensureDefaultExpenseCategories(companyId: string) {
    for (const category of this.defaultExpenseCategories) {
      await this.prisma.financeAccount.upsert({
        where: {
          companyId_code: {
            companyId,
            code: category.code,
          },
        },
        update: {
          nom: category.nom,
          description: category.description,
          actif: true,
          deletedAt: null,
        },
        create: {
          companyId,
          code: category.code,
          nom: category.nom,
          description: category.description,
          actif: true,
        },
      });
    }
  }
}
