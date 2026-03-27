"use client";

const cookieOptions = "path=/; SameSite=Lax";

export function setSessionCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions}`;
}

export function clearSessionCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
}

export function syncSessionCookies(payload: {
  accessToken?: string | null;
  companyId?: string | null;
  activityId?: string | null;
}) {
  if (payload.accessToken) {
    setSessionCookie("dshow_access_token", payload.accessToken);
  }
  if (payload.companyId) {
    setSessionCookie("dshow_company_id", payload.companyId);
  } else if (payload.companyId === null) {
    clearSessionCookie("dshow_company_id");
  }
  if (payload.activityId) {
    setSessionCookie("dshow_activity_id", payload.activityId);
  } else if (payload.activityId === null) {
    clearSessionCookie("dshow_activity_id");
  }
}

export function clearAllSessionCookies() {
  clearSessionCookie("dshow_access_token");
  clearSessionCookie("dshow_company_id");
  clearSessionCookie("dshow_activity_id");
}
