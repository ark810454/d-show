"use client";

import axios from "axios";
import { ActivityType } from "@dshow/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EventsBoard } from "@/components/nightclub/events-board";
import { InlineFeedback, SectionSkeleton } from "@/components/ui/feedback";
import { useNightclubSocket } from "@/hooks/nightclub/use-nightclub-socket";
import { nightclubService } from "@/services/nightclub-service";
import { useAppStore } from "@/store/app-store";

export default function NightclubEventsPage() {
  const router = useRouter();
  const activeContext = useAppStore((state) => state.activeContext);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const data = await nightclubService.events();
      setEvents(data);
      setError(null);
    } catch {
      setError("Impossible de charger les evenements de la boite de nuit.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeContext.activityType && activeContext.activityType !== ActivityType.BOITE_NUIT) {
      router.replace("/select-activity");
      return;
    }
    void load();
  }, [activeContext.activityType, router]);

  useNightclubSocket({
    "nightclub.event.created": () => void load(),
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617,#111827)] p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        {error ? <div className="mb-4"><InlineFeedback tone="error">{error}</InlineFeedback></div> : null}
        {loading ? <SectionSkeleton cards={3} lines={2} /> : null}
        {!loading ? <EventsBoard
          events={events}
          companyId={activeContext.companyId}
          activityId={activeContext.activityId}
          onCreate={async (payload) => {
            try {
              await nightclubService.createEvent(payload);
              await load();
              setError(null);
            } catch (error) {
              if (axios.isAxiosError(error) && error.response?.data?.message) {
                setError(
                  Array.isArray(error.response.data.message)
                    ? error.response.data.message.join(", ")
                    : String(error.response.data.message),
                );
              } else {
                setError("Impossible de creer cette soiree.");
              }
            }
          }}
        />
        : null}
      </div>
    </main>
  );
}
