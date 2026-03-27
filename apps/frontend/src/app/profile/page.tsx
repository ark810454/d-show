"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { userService, type UserItem } from "@/services/user-service";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserItem | null>(null);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  useEffect(() => {
    userService.me().then((data) => {
      setProfile(data);
      setNom(data.nom);
      setPrenom(data.prenom);
      setTelephone(data.telephone ?? "");
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const updated = await userService.updateMe({
      nom,
      prenom,
      telephone,
      ...(motDePasse ? { motDePasse } : {}),
    });
    setProfile(updated);
    setMotDePasse("");
  }

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-4xl">
        <form className="surface grid gap-4 p-6" onSubmit={handleSubmit}>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Profil</p>
            <h1 className="mt-2 font-display text-4xl text-ink">
              {profile ? `${profile.prenom} ${profile.nom}` : "Mon profil"}
            </h1>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={nom} onChange={(e) => setNom(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            <input value={prenom} onChange={(e) => setPrenom(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
          </div>
          <input value={profile?.email ?? ""} disabled className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Telephone" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
          <input value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} type="password" placeholder="Nouveau mot de passe" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
          <Button>Mettre a jour mon profil</Button>
        </form>
      </div>
    </main>
  );
}

