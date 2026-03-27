"use client";

import { Disc3, KeyRound, QrCode, Ticket, Wine } from "lucide-react";
import { ActivitySettingsHub } from "@/components/configuration/activity-settings-hub";

const settingsCards = [
  {
    title: "Billetterie & scan",
    description: "Piloter tickets, validation QR et parcours d'entree de la boite de nuit.",
    href: "/nightclub/ticketing",
    icon: Ticket,
  },
  {
    title: "Evenements",
    description: "Maintenir les soirees, DJ invites, horaires et prix d'entree.",
    href: "/nightclub/events",
    icon: Disc3,
  },
  {
    title: "Bouteilles & VIP",
    description: "Configurer la carte bouteilles, zones VIP et parcours de service premium.",
    href: "/nightclub/bottles",
    icon: Wine,
  },
  {
    title: "Controle d'acces",
    description: "Retrouver le scan en direct et les actions de securite sur les entrees.",
    href: "/nightclub/scan",
    icon: QrCode,
  },
  {
    title: "Matrice d'acces",
    description: "Attribuer les acces manager, caisse et exploitation par activite nightlife.",
    href: "/configuration/access",
    icon: KeyRound,
  },
];

export default function NightclubSettingsPage() {
  return (
    <ActivitySettingsHub
      eyebrow="Boite de nuit"
      title="Configuration"
      description="Conservez un espace de configuration premium et clair pour les acces, les soirees et l'exploitation VIP."
      cards={settingsCards}
    />
  );
}
