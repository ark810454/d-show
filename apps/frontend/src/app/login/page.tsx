"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearAllSessionCookies, syncSessionCookies } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth-service";
import { useAppStore } from "@/store/app-store";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAppStore((state) => state.setSession);
  const [email, setEmail] = useState("admin@dshow.app");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });
      clearAllSessionCookies();
      setSession({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      syncSessionCookies({
        accessToken: response.accessToken,
        companyId: null,
        activityId: null,
      });
      router.push("/select-company");
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
        setError("Le serveur met trop de temps a repondre. Verifiez que le backend est bien lance.");
      } else {
        setError("Connexion impossible. Verifiez vos identifiants.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="surface grid w-full max-w-5xl gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
        <section className="rounded-[2rem] bg-ink p-8 text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">D_Show Platform</p>
          <h1 className="mt-5 font-display text-5xl">Gestion multi-entreprise, multi-activites.</h1>
          <p className="mt-4 max-w-xl text-sm text-white/72">
            Connectez-vous, choisissez votre entreprise, puis votre activite active avant d'acceder au dashboard.
          </p>
        </section>
        <section className="p-2">
          <h2 className="font-display text-3xl text-ink">Connexion</h2>
          <p className="mt-2 text-sm text-slate-500">Acces securise a l'administration du complexe.</p>
          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              placeholder="Email"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              placeholder="Mot de passe"
            />
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</Button>
          </form>
        </section>
      </div>
    </main>
  );
}
