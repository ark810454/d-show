import { ActivityType } from "@dshow/shared";
import {
  Building2,
  ClipboardList,
  Disc3,
  LayoutDashboard,
  Martini,
  ReceiptText,
  Settings2,
  ShoppingBag,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";
import {
  canAccessPath,
  type SessionUserWithAssignments,
} from "@/lib/permissions";

export interface ActivityNavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const globalNavigation: ActivityNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Entreprises", href: "/select-company", icon: Building2 },
  { label: "Activites", href: "/select-activity", icon: ClipboardList },
];

const restaurantNavigation: ActivityNavItem[] = [
  { label: "Dashboard", href: "/restaurant", icon: LayoutDashboard },
  { label: "Salle & tables", href: "/restaurant/tables", icon: UtensilsCrossed },
  { label: "Menu digital", href: "/restaurant/menu", icon: ClipboardList },
  { label: "Commandes", href: "/restaurant/orders", icon: ReceiptText },
  { label: "Cuisine", href: "/restaurant/kitchen", icon: UtensilsCrossed },
  { label: "Encaissement", href: "/restaurant/cashier", icon: WalletCards },
  { label: "Statistiques", href: "/restaurant/stats", icon: LayoutDashboard },
  { label: "Finance", href: "/finance", icon: WalletCards },
  { label: "Configuration", href: "/restaurant/settings", icon: Settings2 },
];

const terraceNavigation: ActivityNavItem[] = [
  { label: "Dashboard", href: "/terrace", icon: LayoutDashboard },
  { label: "Zones & tables", href: "/terrace/tables", icon: Martini },
  { label: "POS rapide", href: "/terrace/pos", icon: ReceiptText },
  { label: "Encaissement", href: "/terrace/cashier", icon: WalletCards },
  { label: "Statistiques", href: "/terrace/stats", icon: LayoutDashboard },
  { label: "Finance", href: "/finance", icon: WalletCards },
  { label: "Configuration", href: "/terrace/settings", icon: Settings2 },
];

const nightclubNavigation: ActivityNavItem[] = [
  { label: "Dashboard", href: "/nightclub", icon: LayoutDashboard },
  { label: "Billetterie", href: "/nightclub/ticketing", icon: ReceiptText },
  { label: "Reservations", href: "/nightclub/reservations", icon: ClipboardList },
  { label: "Evenements", href: "/nightclub/events", icon: Disc3 },
  { label: "VIP", href: "/nightclub/vip", icon: Disc3 },
  { label: "Bouteilles", href: "/nightclub/bottles", icon: Disc3 },
  { label: "Statistiques", href: "/nightclub/stats", icon: LayoutDashboard },
  { label: "Finance", href: "/finance", icon: WalletCards },
  { label: "Configuration", href: "/nightclub/settings", icon: Settings2 },
];

const shopNavigation: ActivityNavItem[] = [
  { label: "Dashboard", href: "/shop", icon: LayoutDashboard },
  { label: "POS boutique", href: "/shop/pos", icon: ReceiptText },
  { label: "Produits & stock", href: "/shop/inventory", icon: ShoppingBag },
  { label: "Statistiques", href: "/shop/stats", icon: LayoutDashboard },
  { label: "Finance", href: "/finance", icon: WalletCards },
  { label: "Configuration", href: "/shop/settings", icon: Settings2 },
];

export function getActivityHomePath(activityType?: ActivityType | null) {
  switch (activityType) {
    case ActivityType.RESTAURANT:
      return "/restaurant";
    case ActivityType.TERRASSE:
      return "/terrace";
    case ActivityType.BOITE_NUIT:
      return "/nightclub";
    case ActivityType.SHOP:
      return "/shop";
    case ActivityType.CORDONNERIE:
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

export function getNavigationForActivity(
  activityType?: ActivityType | null,
  user?: SessionUserWithAssignments | null,
  activityId?: string | null,
) {
  const filterByAccess = (items: ActivityNavItem[]) =>
    items.filter((item) =>
      canAccessPath({
        pathname: item.href,
        user,
        activityId,
        activityType,
      }),
    );

  switch (activityType) {
    case ActivityType.RESTAURANT:
      return filterByAccess(restaurantNavigation);
    case ActivityType.TERRASSE:
      return filterByAccess(terraceNavigation);
    case ActivityType.BOITE_NUIT:
      return filterByAccess(nightclubNavigation);
    case ActivityType.SHOP:
      return filterByAccess(shopNavigation);
    default:
      return globalNavigation;
  }
}
