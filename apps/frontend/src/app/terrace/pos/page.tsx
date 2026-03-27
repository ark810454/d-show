"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActivityType } from "@dshow/shared";
import { Button } from "@/components/ui/button";
import { InlineFeedback, SectionSkeleton } from "@/components/ui/feedback";
import { PromotionBanner } from "@/components/terrace/promotion-banner";
import { TerracePos } from "@/components/terrace/terrace-pos";
import { terraceService } from "@/services/terrace-service";
import { useAppStore } from "@/store/app-store";

export default function TerracePosPage() {
  const router = useRouter();
  const accessToken = useAppStore((state) => state.accessToken);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const activeContext = useAppStore((state) => state.activeContext);
  const user = useAppStore((state) => state.user);
  const [tables, setTables] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const [tableData, menuData, promoData] = await Promise.all([
        terraceService.tables(),
        terraceService.menu(),
        terraceService.happyHours(),
      ]);
      setTables(tableData);
      setMenu(menuData);
      setPromotions(promoData);
      setError(null);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError("Votre session terrasse n'est pas encore prete. Rechargez la page ou reconnectez-vous.");
        return;
      }
      setError("Impossible de charger les donnees de la terrasse.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    if (activeContext.activityType && activeContext.activityType !== ActivityType.TERRASSE) {
      router.replace("/select-activity");
      return;
    }
    if (!activeContext.companyId || !activeContext.activityId) {
      router.replace("/select-activity");
      return;
    }
    void load();
  }, [
    accessToken,
    activeContext.activityId,
    activeContext.activityType,
    activeContext.companyId,
    hasHydrated,
    router,
  ]);

  async function seedDemo() {
    if (!activeContext.companyId || !activeContext.activityId) return;
    setSeedMessage(null);
    setSeedError(null);
    try {
      const existingCategory = menu.find((category) => category.nom?.toLowerCase() === "boissons");
      const category =
        existingCategory ??
        (await terraceService.createCategory({
          companyId: activeContext.companyId,
          activityId: activeContext.activityId,
          nom: "Boissons",
        }));

      await terraceService.createItem({
        companyId: activeContext.companyId,
        activityId: activeContext.activityId,
        categoryId: category.id,
        nom: `Cocktail ${Date.now()}`,
        prix: 6500,
        boissonUniquement: true,
      });
      await terraceService.createHappyHour({
        companyId: activeContext.companyId,
        activityId: activeContext.activityId,
        nom: `Happy Hour Sunset ${Date.now()}`,
        reductionPct: 20,
        startTime: "17:00",
        endTime: "19:00",
        joursSemaine: "0,1,2,3,4,5,6",
      });
      await load();
      setSeedMessage("Menu demo et happy hour ajoutes avec succes.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        const message = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(", ")
          : String(error.response.data.message);
        setSeedError(message);
      } else {
        setSeedError("Impossible de preparer la demonstration terrasse.");
      }
    }
  }

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="surface flex items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Terrasse</p>
            <h1 className="mt-2 font-display text-4xl text-ink">POS rapide</h1>
          </div>
          <Button onClick={seedDemo}>Ajouter demo menu + happy hour</Button>
        </section>
        {error ? <InlineFeedback tone="error">{error}</InlineFeedback> : null}
        {seedMessage ? <InlineFeedback tone="success">{seedMessage}</InlineFeedback> : null}
        {seedError ? <InlineFeedback tone="error">{seedError}</InlineFeedback> : null}
        {loading ? <SectionSkeleton cards={3} lines={2} /> : null}
        <PromotionBanner promotions={promotions} />
        {!loading ? <TerracePos
          menu={menu}
          tables={tables}
          companyId={activeContext.companyId}
          activityId={activeContext.activityId}
          userId={user?.id}
          onSubmit={(payload) => terraceService.createOrder(payload)}
        />
        : null}
      </div>
    </main>
  );
}
