"use client";

import { useEffect, useState } from "react";
import { ReservationsBoard } from "@/components/nightclub/reservations-board";
import { useNightclubSocket } from "@/hooks/nightclub/use-nightclub-socket";
import { nightclubService } from "@/services/nightclub-service";
import { useAppStore } from "@/store/app-store";

export default function NightclubReservationsPage() {
  const activeContext = useAppStore((state) => state.activeContext);
  const [bookings, setBookings] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);

  async function load() {
    const [bookingData, zoneData] = await Promise.all([nightclubService.bookings(), nightclubService.zones()]);
    setBookings(bookingData);
    setZones(zoneData);
  }

  useEffect(() => {
    void load();
  }, []);

  useNightclubSocket({
    "nightclub.reservation.updated": () => void load(),
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617,#111827)] p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        <ReservationsBoard
          bookings={bookings}
          zones={zones}
          companyId={activeContext.companyId}
          activityId={activeContext.activityId}
          onCreate={async (payload) => {
            await nightclubService.createBooking(payload);
            await load();
          }}
          onStatusChange={async (id, statut) => {
            await nightclubService.updateBookingStatus(id, statut);
            await load();
          }}
        />
      </div>
    </main>
  );
}
