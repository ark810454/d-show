export enum ActivityType {
  RESTAURANT = "RESTAURANT",
  TERRASSE = "TERRASSE",
  BOITE_NUIT = "BOITE_NUIT",
  SHOP = "SHOP",
  CORDONNERIE = "CORDONNERIE",
}

export enum EntityStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  ARCHIVED = "ARCHIVED",
}

export interface ActiveContext {
  companyId: string | null;
  activityId: string | null;
  activityType?: ActivityType | null;
  companyName?: string | null;
  activityName?: string | null;
}

export interface DashboardKpi {
  label: string;
  value: string;
  delta: string;
  tone: "success" | "warning" | "danger" | "neutral";
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface ActivityRevenueItem {
  activityId: string;
  activityName: string;
  activityType: ActivityType;
  revenue: number;
  sales: number;
  status: string;
}

export interface StockAlertItem {
  id: string;
  productName: string;
  activityName: string;
  stock: number;
  minimum: number;
}

export interface PresenceItem {
  userId: string;
  userName: string;
  activityName: string;
  status: "PRESENT" | "ABSENT";
  lastActionAt?: string | null;
}

export interface RecentActivityItem {
  id: string;
  userName: string;
  action: string;
  module: string;
  description?: string | null;
  activityName?: string | null;
  createdAt: string;
}

export interface ShortcutItem {
  label: string;
  href: string;
  description: string;
}

export interface DashboardOverview {
  kpis: DashboardKpi[];
  revenueSeries: RevenuePoint[];
  revenueByActivity: ActivityRevenueItem[];
  stockAlerts: StockAlertItem[];
  employeePresence: PresenceItem[];
  recentActivities: RecentActivityItem[];
  shortcuts: ShortcutItem[];
  quickStats: Array<{
    label: string;
    value: string;
    helper: string;
  }>;
}

export interface CompanySummary {
  id: string;
  nom: string;
  raisonSociale?: string | null;
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  logo?: string | null;
  statut: EntityStatus | string;
}

export interface ActivitySummary {
  id: string;
  companyId: string;
  nom: string;
  code: string;
  type: ActivityType;
  description?: string | null;
  statut: EntityStatus | string;
}
