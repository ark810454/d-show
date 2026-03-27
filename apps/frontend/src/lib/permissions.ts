"use client";

import { ActivityType } from "@dshow/shared";

export type AppRoleName =
  | "super_admin"
  | "admin_entreprise"
  | "manager"
  | "serveur"
  | "caissier"
  | "vendeur"
  | "comptable"
  | "dj"
  | "cordonnier";

export interface SessionAssignment {
  activityId: string;
  roleId: string;
  role?: { id: string; nom: string };
  activity?: { id: string; nom: string; type?: ActivityType | string };
}

export interface SessionUserWithAssignments {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  companyId?: string | null;
  assignments?: SessionAssignment[];
}

export interface PermissionContext {
  pathname: string;
  activityId?: string | null;
  activityType?: ActivityType | null;
  user?: SessionUserWithAssignments | null;
}

export const SUPERUSER_ONLY_ROLE_NAMES: AppRoleName[] = ["super_admin", "admin_entreprise"];

const PUBLIC_OR_BASE_PATHS = [
  "/login",
  "/profile",
  "/select-company",
  "/select-activity",
  "/dashboard",
];

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "") || "/";
}

function getRoleNames(user: SessionUserWithAssignments | null | undefined, activityId?: string | null) {
  if (!user?.assignments?.length) {
    return [];
  }

  return user.assignments
    .filter((assignment) => (activityId ? assignment.activityId === activityId : true))
    .map((assignment) => assignment.role?.nom ?? "")
    .filter(Boolean) as AppRoleName[];
}

export function hasGlobalAdminAccess(user: SessionUserWithAssignments | null | undefined) {
  return Boolean(
    user?.assignments?.some((assignment) =>
      ["super_admin", "admin_entreprise"].includes(assignment.role?.nom ?? ""),
    ),
  );
}

export function isSuperAdmin(user: SessionUserWithAssignments | null | undefined) {
  return Boolean(
    user?.assignments?.some((assignment) => assignment.role?.nom === "super_admin"),
  );
}

export function hasActivityAssignment(
  user: SessionUserWithAssignments | null | undefined,
  activityId?: string | null,
) {
  if (!activityId) {
    return false;
  }

  if (hasGlobalAdminAccess(user)) {
    return true;
  }

  return Boolean(user?.assignments?.some((assignment) => assignment.activityId === activityId));
}

export function hasAnyScopedRole(
  user: SessionUserWithAssignments | null | undefined,
  activityId: string | null | undefined,
  roles: AppRoleName[],
) {
  if (hasGlobalAdminAccess(user)) {
    return true;
  }

  const scopedRoles = getRoleNames(user, activityId);
  return roles.some((role) => scopedRoles.includes(role));
}

export function canManageUsers(user: SessionUserWithAssignments | null | undefined, activityId?: string | null) {
  return hasAnyScopedRole(user, activityId, ["manager"]);
}

export function canDeleteUsers(user: SessionUserWithAssignments | null | undefined) {
  return hasGlobalAdminAccess(user);
}

export function canAccessFinance(user: SessionUserWithAssignments | null | undefined, activityId?: string | null) {
  return hasAnyScopedRole(user, activityId, ["manager", "comptable"]);
}

export function canAccessConfiguration(user: SessionUserWithAssignments | null | undefined, activityId?: string | null) {
  return hasAnyScopedRole(user, activityId, ["manager"]);
}

export function canAccessUsersPage(user: SessionUserWithAssignments | null | undefined, activityId?: string | null) {
  return canManageUsers(user, activityId);
}

export function canAccessActivityPage(
  user: SessionUserWithAssignments | null | undefined,
  activityId: string | null | undefined,
) {
  if (!activityId) {
    return hasGlobalAdminAccess(user);
  }

  return hasActivityAssignment(user, activityId);
}

function isAllowedForRestaurant(pathname: string, user: SessionUserWithAssignments | null | undefined, activityId?: string | null) {
  if (!hasActivityAssignment(user, activityId)) {
    return false;
  }

  if (pathname === "/restaurant" || pathname === "/restaurant/") {
    return hasAnyScopedRole(user, activityId, ["manager", "serveur", "caissier", "comptable"]);
  }
  if (pathname.startsWith("/restaurant/settings")) {
    return canAccessConfiguration(user, activityId);
  }
  if (pathname.startsWith("/restaurant/stats")) {
    return hasAnyScopedRole(user, activityId, ["manager", "comptable"]);
  }
  if (pathname.startsWith("/restaurant/cashier")) {
    return hasAnyScopedRole(user, activityId, ["manager", "caissier"]);
  }
  if (pathname.startsWith("/restaurant/kitchen")) {
    return hasAnyScopedRole(user, activityId, ["manager"]);
  }
  if (pathname.startsWith("/restaurant/orders")) {
    return hasAnyScopedRole(user, activityId, ["manager", "serveur"]);
  }
  if (pathname.startsWith("/restaurant/menu")) {
    return hasAnyScopedRole(user, activityId, ["manager", "serveur"]);
  }
  if (pathname.startsWith("/restaurant/tables")) {
    return hasAnyScopedRole(user, activityId, ["manager", "serveur"]);
  }

  return false;
}

function isAllowedForTerrace(pathname: string, user: SessionUserWithAssignments | null | undefined, activityId?: string | null) {
  if (!hasActivityAssignment(user, activityId)) {
    return false;
  }

  if (pathname === "/terrace" || pathname === "/terrace/") {
    return hasAnyScopedRole(user, activityId, ["manager", "serveur", "caissier", "comptable"]);
  }
  if (pathname.startsWith("/terrace/stats")) {
    return hasAnyScopedRole(user, activityId, ["manager", "comptable"]);
  }
  if (pathname.startsWith("/terrace/settings")) {
    return canAccessConfiguration(user, activityId);
  }
  if (pathname.startsWith("/terrace/cashier")) {
    return hasAnyScopedRole(user, activityId, ["manager", "caissier"]);
  }
  if (pathname.startsWith("/terrace/pos")) {
    return hasAnyScopedRole(user, activityId, ["manager", "serveur", "caissier"]);
  }
  if (pathname.startsWith("/terrace/tables")) {
    return hasAnyScopedRole(user, activityId, ["manager", "serveur"]);
  }

  return false;
}

function isAllowedForShop(pathname: string, user: SessionUserWithAssignments | null | undefined, activityId?: string | null) {
  if (!hasActivityAssignment(user, activityId)) {
    return false;
  }

  if (pathname === "/shop" || pathname === "/shop/") {
    return hasAnyScopedRole(user, activityId, ["manager", "vendeur", "caissier", "comptable"]);
  }
  if (pathname.startsWith("/shop/stats")) {
    return hasAnyScopedRole(user, activityId, ["manager", "comptable"]);
  }
  if (pathname.startsWith("/shop/settings")) {
    return canAccessConfiguration(user, activityId);
  }
  if (pathname.startsWith("/shop/pos")) {
    return hasAnyScopedRole(user, activityId, ["manager", "vendeur", "caissier"]);
  }
  if (pathname.startsWith("/shop/inventory")) {
    return hasAnyScopedRole(user, activityId, ["manager", "vendeur"]);
  }

  return false;
}

function isAllowedForNightclub(pathname: string, user: SessionUserWithAssignments | null | undefined, activityId?: string | null) {
  if (!hasActivityAssignment(user, activityId)) {
    return false;
  }

  if (pathname === "/nightclub" || pathname === "/nightclub/") {
    return hasAnyScopedRole(user, activityId, ["manager", "caissier", "comptable", "dj"]);
  }
  if (pathname.startsWith("/nightclub/stats")) {
    return hasAnyScopedRole(user, activityId, ["manager", "comptable"]);
  }
  if (pathname.startsWith("/nightclub/settings")) {
    return canAccessConfiguration(user, activityId);
  }
  if (pathname.startsWith("/nightclub/ticketing") || pathname.startsWith("/nightclub/scan")) {
    return hasAnyScopedRole(user, activityId, ["manager", "caissier"]);
  }
  if (
    pathname.startsWith("/nightclub/events") ||
    pathname.startsWith("/nightclub/reservations") ||
    pathname.startsWith("/nightclub/vip") ||
    pathname.startsWith("/nightclub/bottles")
  ) {
    return hasAnyScopedRole(user, activityId, ["manager"]);
  }

  return false;
}

export function canAccessPath({ pathname, activityId, activityType, user }: PermissionContext) {
  const normalizedPath = normalizePath(pathname);

  if (PUBLIC_OR_BASE_PATHS.some((path) => normalizedPath === path || normalizedPath.startsWith(`${path}/`))) {
    return true;
  }

  if (normalizedPath.startsWith("/users")) {
    return canAccessUsersPage(user, activityId);
  }

  if (normalizedPath.startsWith("/finance")) {
    return canAccessFinance(user, activityId);
  }

  if (normalizedPath.startsWith("/configuration")) {
    return canAccessConfiguration(user, activityId);
  }

  if (!activityId || !activityType) {
    return hasGlobalAdminAccess(user);
  }

  switch (activityType) {
    case ActivityType.RESTAURANT:
      return isAllowedForRestaurant(normalizedPath, user, activityId);
    case ActivityType.TERRASSE:
      return isAllowedForTerrace(normalizedPath, user, activityId);
    case ActivityType.SHOP:
      return isAllowedForShop(normalizedPath, user, activityId);
    case ActivityType.BOITE_NUIT:
      return isAllowedForNightclub(normalizedPath, user, activityId);
    default:
      return hasActivityAssignment(user, activityId);
  }
}

export function getActivityFallbackPath(activityType?: ActivityType | null) {
  switch (activityType) {
    case ActivityType.RESTAURANT:
      return "/restaurant";
    case ActivityType.TERRASSE:
      return "/terrace";
    case ActivityType.SHOP:
      return "/shop";
    case ActivityType.BOITE_NUIT:
      return "/nightclub";
    default:
      return "/dashboard";
  }
}

export function getAuthorizedFallbackPath({
  user,
  activityId,
  activityType,
}: Omit<PermissionContext, "pathname">) {
  if (!user) {
    return "/login";
  }

  if (activityId && activityType && hasActivityAssignment(user, activityId)) {
    return getActivityFallbackPath(activityType);
  }

  return "/select-activity";
}

export function getScopedRoleLabels(
  user: SessionUserWithAssignments | null | undefined,
  activityId?: string | null,
) {
  return getRoleNames(user, activityId);
}
