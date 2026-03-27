import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/providers/app-provider";

export const metadata: Metadata = {
  title: "D_Show Management",
  description: "Plateforme de gestion multi-activites pour complexe commercial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
