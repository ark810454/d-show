"use client";

import { useEffect } from "react";
import { terraceService } from "@/services/terrace-service";

export function useTerraceSocket(handlers: Partial<Record<string, (payload: unknown) => void>>) {
  useEffect(() => {
    const socket = terraceService.socket();
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

