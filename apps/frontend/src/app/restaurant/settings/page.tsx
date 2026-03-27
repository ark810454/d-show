"use client";

import { KeyRound, LayoutGrid, Soup, WavesLadder } from "lucide-react";
import { ActivitySettingsHub } from "@/components/configuration/activity-settings-hub";

const settingsCards = [
  {
    title: "Configuration des tables",
    description: "Definir le code, le nom, la capacite et l'organisation de la salle.",
    href: "/restaurant/tables",
    icon: LayoutGrid,
  },
  {
    title: "Catalogue & supplements",
    description: "Maintenir categories, disponibilites, prix et options du menu digital.",
    href: "/restaurant/menu",
    icon: Soup,
  },
  {
    title: "Parcours cuisine",
    description: "Verifier les statuts de preparation et la fluidite entre salle, cuisine et caisse.",
    href: "/restaurant/kitchen",
    icon: WavesLadder,
  },
  {
    title: "Matrice d'acces",
    description: "Attribuer les roles et activites a chaque utilisateur de l'entreprise.",
    href: "/configuration/access",
    icon: KeyRound,
  },
];

export default function RestaurantSettingsPage() {
  return (
    <ActivitySettingsHub
      eyebrow="Restaurant"
      title="Configuration"
      description="Regroupez ici les reglages utiles au restaurant actif pour garder un espace clair et sans melange avec les autres activites."
      cards={settingsCards}
    />
  );
}
