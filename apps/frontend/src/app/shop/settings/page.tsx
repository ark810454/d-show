"use client";

import { BarChart3, KeyRound, ReceiptText, Settings2, ShoppingBag } from "lucide-react";
import { ActivitySettingsHub } from "@/components/configuration/activity-settings-hub";

const settingsCards = [
  {
    title: "Catalogue & stock",
    description: "Organiser categories, produits, prix, images et seuils de stock faible.",
    href: "/shop/inventory",
    icon: ShoppingBag,
  },
  {
    title: "POS boutique",
    description: "Superviser la caisse rapide, le panier, les remises et le parcours de vente.",
    href: "/shop/pos",
    icon: ReceiptText,
  },
  {
    title: "Statistiques",
    description: "Analyser ventes journalieres, marges estimees et evolution du stock.",
    href: "/shop/stats",
    icon: BarChart3,
  },
  {
    title: "Matrice d'acces",
    description: "Attribuer les acces vendeurs, managers et comptables par activite boutique.",
    href: "/configuration/access",
    icon: KeyRound,
  },
  {
    title: "Reglages boutique",
    description: "Retrouver rapidement les points de controle fonctionnels de la boutique active.",
    href: "/shop",
    icon: Settings2,
  },
];

export default function ShopSettingsPage() {
  return (
    <ActivitySettingsHub
      eyebrow="Boutique"
      title="Configuration"
      description="Harmonisez ici les reglages de la boutique, les acces de l'equipe et les points de supervision metier."
      cards={settingsCards}
    />
  );
}
