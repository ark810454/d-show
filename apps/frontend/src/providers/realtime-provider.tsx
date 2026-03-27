"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AlertCircle, BellRing, CheckCircle2, CreditCard, PackageSearch, Receipt, TableProperties, Ticket, UtensilsCrossed } from "lucide-react";
import type { Socket } from "socket.io-client";
import { getRealtimeSocket } from "@/lib/realtime";
import { useAppStore } from "@/store/app-store";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  tone?: "info" | "success" | "error";
};

type RealtimeContextValue = {
  unreadCount: number;
  notifications: NotificationItem[];
  markAllAsRead: () => void;
  pushToast: (payload: {
    title: string;
    description: string;
    tone?: NotificationItem["tone"];
  }) => void;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  unreadCount: 0,
  notifications: [],
  markAllAsRead: () => undefined,
  pushToast: () => undefined,
});

const eventMeta: Record<string, { title: string; icon: typeof BellRing }> = {
  "sync.order.created": { title: "Nouvelle commande", icon: UtensilsCrossed },
  "sync.order.updated": { title: "Commande mise a jour", icon: Receipt },
  "sync.order.ready": { title: "Commande prete", icon: CheckCircle2 },
  "sync.payment.validated": { title: "Paiement valide", icon: CreditCard },
  "sync.stock.updated": { title: "Stock modifie", icon: PackageSearch },
  "sync.ticket.validated": { title: "Ticket valide", icon: Ticket },
  "sync.table.updated": { title: "Table mise a jour", icon: TableProperties },
  "sync.reservation.updated": { title: "Reservation mise a jour", icon: BellRing },
};

function ToastStack({ items }: { items: NotificationItem[] }) {
  const toneMap = {
    info: {
      wrap: "border-slate-200 bg-white/95",
      icon: BellRing,
      iconClass: "text-slate-500",
    },
    success: {
      wrap: "border-emerald-200 bg-emerald-50/95",
      icon: CheckCircle2,
      iconClass: "text-emerald-600",
    },
    error: {
      wrap: "border-rose-200 bg-rose-50/95",
      icon: AlertCircle,
      iconClass: "text-rose-600",
    },
  } as const;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 grid w-full max-w-sm gap-3">
      {items.map((item) => {
        const tone = toneMap[item.tone ?? "info"];
        const Icon = tone.icon;

        return (
          <div key={item.id} className={`rounded-3xl border p-4 shadow-2xl backdrop-blur ${tone.wrap}`}>
            <div className="flex items-start gap-3">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone.iconClass}`} />
              <div>
                <p className="font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAppStore((state) => state.accessToken);
  const activeContext = useAppStore((state) => state.activeContext);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<NotificationItem[]>([]);

  function queueToast(next: NotificationItem) {
    setToasts((current) => [next, ...current].slice(0, 4));
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== next.id));
    }, 4000);
  }

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = getRealtimeSocket();
    const previousScope = (socket as Socket & { __scope?: { companyId?: string | null; activityId?: string | null } }).__scope;

    if (previousScope?.companyId) {
      socket.emit("scope.leave", previousScope);
    }

    if (activeContext.companyId) {
      socket.emit("scope.join", {
        companyId: activeContext.companyId,
        activityId: activeContext.activityId,
      });
      (socket as Socket & { __scope?: { companyId?: string | null; activityId?: string | null } }).__scope = {
        companyId: activeContext.companyId,
        activityId: activeContext.activityId,
      };
    }

    const handlers = Object.keys(eventMeta).map((event) => {
      const handler = (payload: any) => {
        const meta = eventMeta[event];
        const next: NotificationItem = {
          id: `${event}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: meta.title,
          description:
            payload?.reference ??
            payload?.nom ??
            payload?.description ??
            payload?.statut ??
            "Mise a jour en temps reel",
          createdAt: new Date().toISOString(),
          tone: event === "sync.order.ready" || event === "sync.payment.validated" ? "success" : "info",
        };
        setNotifications((current) => [next, ...current].slice(0, 20));
        queueToast(next);
      };
      socket.on(event, handler);
      return { event, handler };
    });

    return () => {
      for (const { event, handler } of handlers) {
        socket.off(event, handler);
      }
    };
  }, [accessToken, activeContext.activityId, activeContext.companyId]);

  const value = useMemo(
    () => ({
      unreadCount: notifications.length,
      notifications,
      markAllAsRead: () => setNotifications([]),
      pushToast: ({
        title,
        description,
        tone = "info",
      }: {
        title: string;
        description: string;
        tone?: NotificationItem["tone"];
      }) =>
        queueToast({
          id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title,
          description,
          createdAt: new Date().toISOString(),
          tone,
        }),
    }),
    [notifications],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
      <ToastStack items={toasts} />
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
