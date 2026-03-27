import {
  ActivityType,
  type DashboardOverview,
} from "@dshow/shared";
import { apiClient } from "@/lib/api";

export interface DashboardFilters {
  from?: string;
  to?: string;
  activityId?: string;
}

export interface LegacyActivitySummary {
  id: string;
  type: ActivityType;
  name: string;
  status: string;
  team: string;
  revenue: string;
}

export interface LegacyOperationalRow {
  reference: string;
  customer: string;
  activity: string;
  amount: string;
  status: string;
  assignee: string;
}

export const mockDashboardOverview: DashboardOverview = {
  kpis: [
    { label: "Chiffre d'affaires global", value: "4 250 000 XOF", delta: "+12.4%", tone: "success" },
    { label: "Ventes du jour", value: "146", delta: "Toutes activites", tone: "neutral" },
    { label: "Commandes en cours", value: "38", delta: "Priorite moyenne", tone: "warning" },
    { label: "Alertes stock faible", value: "7", delta: "A traiter", tone: "danger" },
  ],
  revenueSeries: [
    { label: "16 mars", revenue: 380000, orders: 24 },
    { label: "17 mars", revenue: 515000, orders: 29 },
    { label: "18 mars", revenue: 470000, orders: 31 },
    { label: "19 mars", revenue: 690000, orders: 40 },
    { label: "20 mars", revenue: 810000, orders: 44 },
    { label: "21 mars", revenue: 640000, orders: 37 },
    { label: "22 mars", revenue: 745000, orders: 41 },
  ],
  revenueByActivity: [
    { activityId: "1", activityName: "Restaurant Signature", activityType: ActivityType.RESTAURANT, revenue: 1640000, sales: 68, status: "ACTIVE" },
    { activityId: "2", activityName: "Terrasse Sunset", activityType: ActivityType.TERRASSE, revenue: 620000, sales: 21, status: "ACTIVE" },
    { activityId: "3", activityName: "Boite de Nuit Pulse", activityType: ActivityType.BOITE_NUIT, revenue: 1330000, sales: 34, status: "ACTIVE" },
    { activityId: "4", activityName: "Boutique Prestige", activityType: ActivityType.SHOP, revenue: 410000, sales: 23, status: "ACTIVE" },
    { activityId: "5", activityName: "Cordonnerie Premium", activityType: ActivityType.CORDONNERIE, revenue: 250000, sales: 9, status: "ACTIVE" },
  ],
  stockAlerts: [
    { id: "1", productName: "Mocassin cuir", activityName: "Boutique Prestige", stock: 2, minimum: 4 },
    { id: "2", productName: "Whisky reserve", activityName: "Boite de Nuit Pulse", stock: 3, minimum: 6 },
    { id: "3", productName: "Cafe premium", activityName: "Restaurant Signature", stock: 5, minimum: 8 },
  ],
  employeePresence: [
    { userId: "1", userName: "Amina B.", activityName: "Restaurant Signature", status: "PRESENT", lastActionAt: new Date().toISOString() },
    { userId: "2", userName: "Kevin M.", activityName: "Terrasse Sunset", status: "PRESENT", lastActionAt: new Date().toISOString() },
    { userId: "3", userName: "Sonia P.", activityName: "Boite de Nuit Pulse", status: "ABSENT", lastActionAt: new Date().toISOString() },
  ],
  recentActivities: [
    { id: "1", userName: "Nadia K.", action: "CREATE_ORDER", module: "RESTAURANT", description: "Commande table 04 enregistree", activityName: "Restaurant Signature", createdAt: new Date().toISOString() },
    { id: "2", userName: "David M.", action: "SALE_CONFIRMED", module: "SHOP", description: "Vente SHP-4421 validee", activityName: "Boutique Prestige", createdAt: new Date().toISOString() },
    { id: "3", userName: "Grace T.", action: "CLOCK_IN", module: "TIME_TRACKING", description: "Prise de service", activityName: "Terrasse Sunset", createdAt: new Date().toISOString() },
  ],
  shortcuts: [
    { label: "Utilisateurs", href: "/users", description: "Piloter les comptes et roles" },
    { label: "Profil", href: "/profile", description: "Mettre a jour la session" },
    { label: "Activites", href: "/select-activity", description: "Changer de module actif" },
    { label: "Entreprises", href: "/select-company", description: "Basculer de contexte" },
  ],
  quickStats: [
    { label: "Employes actifs", value: "32", helper: "Equipe engagee" },
    { label: "Clients en base", value: "1 248", helper: "Portefeuille CRM" },
    { label: "Activites actives", value: "5", helper: "Couverture du complexe" },
    { label: "Mouvements stock", value: "84", helper: "Sur les 7 derniers jours" },
  ],
};

export const mockKpis = mockDashboardOverview.kpis;

export const activitySummary: LegacyActivitySummary[] = mockDashboardOverview.revenueByActivity.map((activity) => ({
  id: activity.activityId,
  type: activity.activityType,
  name: activity.activityName,
  status: activity.status,
  team: `${Math.max(activity.sales, 1)} collaborateurs`,
  revenue: `${activity.revenue.toLocaleString("fr-FR")} FCFA`,
}));

export const operationalRows: LegacyOperationalRow[] = [
  {
    reference: "REST-24031",
    customer: "Table 04",
    activity: "Restaurant Signature",
    amount: "84 000 FCFA",
    status: "EN_COURS",
    assignee: "Nadia K.",
  },
  {
    reference: "TRS-11028",
    customer: "Zone Sunset",
    activity: "Terrasse Sunset",
    amount: "26 500 FCFA",
    status: "PAYE",
    assignee: "Kevin M.",
  },
  {
    reference: "NCL-77814",
    customer: "VIP Lounge",
    activity: "Boite de Nuit Pulse",
    amount: "215 000 FCFA",
    status: "RESERVEE",
    assignee: "Sonia P.",
  },
];

export const dashboardService = {
  async getOverview(filters: DashboardFilters) {
    try {
      const { data } = await apiClient.get<DashboardOverview>("/stats/dashboard", {
        params: filters,
      });
      return data;
    } catch {
      return mockDashboardOverview;
    }
  },
};
