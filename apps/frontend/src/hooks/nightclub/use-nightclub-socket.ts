"use client";

import { useEffect } from "react";
import { nightclubService } from "@/services/nightclub-service";

export function useNightclubSocket(handlers: Partial<Record<string, (payload: unknown) => void>>) {
  useEffect(() => {
    const socket = nightclubService.socket();
    for (const [event, handler] of Object.entries(handlers)) {
      if (handler) socket.on(event, handler);
    }
    return () => {
      for (const [event, handler] of Object.entries(handlers)) {
        if (handler) socket.off(event, handler);
      }
    };
  }, [handlers]);
}
