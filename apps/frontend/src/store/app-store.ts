"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ActiveContext, ActivitySummary, CompanySummary } from "@dshow/shared";

interface SessionUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  companyId?: string | null;
  assignments?: Array<{
    id?: string;
    activityId: string;
    roleId: string;
    role?: { id: string; nom: string };
    activity?: { id: string; nom: string; type: string };
  }>;
}

interface AppState {
  user: SessionUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
  activeContext: ActiveContext;
  companies: CompanySummary[];
  activities: ActivitySummary[];
  setSession: (payload: {
    user: SessionUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  clearSession: () => void;
  setCompanies: (companies: CompanySummary[]) => void;
  setActivities: (activities: ActivitySummary[]) => void;
  setActiveContext: (context: Partial<ActiveContext>) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

const initialContext: ActiveContext = {
  companyId: null,
  activityId: null,
  activityType: null,
  companyName: null,
  activityName: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,
      activeContext: initialContext,
      companies: [],
      activities: [],
      setSession: ({ user, accessToken, refreshToken }) =>
        set({
          user,
          accessToken,
          refreshToken,
          activeContext: initialContext,
          companies: [],
          activities: [],
        }),
      clearSession: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          activeContext: initialContext,
          companies: [],
          activities: [],
        }),
      setCompanies: (companies) => set({ companies }),
      setActivities: (activities) => set({ activities }),
      setActiveContext: (context) =>
        set((state) => ({
          activeContext: {
            ...state.activeContext,
            ...context,
          },
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "dshow-app-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        activeContext: state.activeContext,
      }),
    },
  ),
);
