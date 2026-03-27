"use client";

import { CreditCard, GlassWater, KeyRound, LayoutGrid, TrendingUp } from "lucide-react";
import { ActivitySettingsHub } from "@/components/configuration/activity-settings-hub";

const settingsCards = [
  {
    title: "Zones & tables",
    description: "Definir les zones exterieures, leur capacite et leurs statuts en exploitation.",
    href: "/terrace/tables",
    icon: LayoutGrid,
  },
  {
    title: "POS rapide",
    description: "Maintenir les produits de service rapide et la fluidite de la prise de commande.",
    href: "/terrace/pos",
    icon: GlassWater,
  },
  {
    title: "Encaissement",
    description: "Verifier les modes de paiement et le parcours de ticket simplifie terrasse.",
    href: "/terrace/cashier",
    icon: CreditCard,
  },
  {
    title: "Statistiques",
    description: "Suivre ventes par heure, boissons fortes et impact happy hour.",
    href: "/terrace/stats",
    icon: TrendingUp,
  },
  {
    title: "Matrice d'acces",
    description: "Attribuer roles et activites aux utilisateurs qui travaillent sur la terrasse.",
    href: "/configuration/access",
    icon: KeyRound,
  },
];

export default function TerraceSettingsPage() {
  return (
    <ActivitySettingsHub
      eyebrow="Terrasse"
      title="Configuration"
      description="Centralisez ici les reglages de la terrasse, les acces equipe et les points de controle operationnels."
      cards={settingsCards}
    />
  );
}
