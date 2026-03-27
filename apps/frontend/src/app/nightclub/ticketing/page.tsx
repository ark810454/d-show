"use client";

import { useEffect, useState } from "react";
import { TicketingPanel } from "@/components/nightclub/ticketing-panel";
import { useNightclubSocket } from "@/hooks/nightclub/use-nightclub-socket";
import { nightclubService } from "@/services/nightclub-service";
import { useAppStore } from "@/store/app-store";

export default function NightclubTicketingPage() {
  const activeContext = useAppStore((state) => state.activeContext);
  const [tickets, setTickets] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  async function load() {
    const [ticketData, eventData] = await Promise.all([nightclubService.tickets(), nightclubService.events()]);
    setTickets(ticketData);
    setEvents(eventData);
  }

  useEffect(() => {
    void load();
  }, []);

  useNightclubSocket({
    "nightclub.ticket.created": () => void load(),
    "nightclub.ticket.validated": () => void load(),
    "nightclub.event.created": () => void load(),
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617,#111827)] p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        <TicketingPanel
          tickets={tickets}
          events={events}
          companyId={activeContext.companyId}
          activityId={activeContext.activityId}
          onCreateTicket={async (payload) => {
            await nightclubService.createTicket(payload);
            await load();
          }}
        />
      </div>
    </main>
  );
}
