"use client";

import { useEffect } from "react";
import { restaurantService } from "@/services/restaurant-service";

export function useRestaurantSocket(
  handlers: Partial<Record<string, (payload: unknown) => void>>,
) {
  useEffect(() => {
    const socket = restaurantService.socket();

    for (const [event, handler] of Object.entries(handlers)) {
      if (handler) {
        socket.on(event, handler);
      }
    }

    return () => {
      for (const [event, handler] of Object.entries(handlers)) {
        if (handler) {
          socket.off(event, handler);
        }
      }
    };
  }, [handlers]);
}

