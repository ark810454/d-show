"use client";

import { io, type Socket } from "socket.io-client";

let realtimeSocket: Socket | null = null;

export function getRealtimeSocket() {
  if (!realtimeSocket) {
    const rawStore = typeof window !== "undefined" ? window.localStorage.getItem("dshow-app-store") : null;
    const parsed = rawStore ? JSON.parse(rawStore)?.state : null;
    realtimeSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:4000", {
      auth: {
        token: parsed?.accessToken ?? null,
        companyId: parsed?.activeContext?.companyId ?? null,
        activityId: parsed?.activeContext?.activityId ?? null,
      },
    });
  }

  return realtimeSocket;
}

export function disconnectRealtimeSocket() {
  if (realtimeSocket) {
    realtimeSocket.disconnect();
    realtimeSocket = null;
  }
}
