"use client";

import { ScannerPanel } from "@/components/nightclub/scanner-panel";
import { nightclubService } from "@/services/nightclub-service";
import { useAppStore } from "@/store/app-store";

export default function NightclubScanPage() {
  const user = useAppStore((state) => state.user);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617,#111827)] p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        <ScannerPanel userId={user?.id} onValidate={(payload) => nightclubService.validateTicket(payload)} />
      </div>
    </main>
  );
}
