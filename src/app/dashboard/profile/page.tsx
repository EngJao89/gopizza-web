"use client";

import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";
import { ProfileAddressForm } from "@/components/dashboard/profile-address-form";
import { ProfileEditForm } from "@/components/dashboard/profile-edit-form";
import api from "@/lib/axios";
import {
  normalizeMeProfile,
  type MeProfile,
} from "@/lib/current-user";
import { toast } from "@/lib/toast";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get<unknown>("api/auth/me");
        const parsed = normalizeMeProfile(data);
        if (!cancelled) {
          if (parsed) {
            setProfile(parsed);
            setStatus("ready");
          } else {
            setStatus("error");
          }
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          toast.error("Nao foi possivel carregar o perfil.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#ecebea] pb-24">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e8e4e2] bg-white text-[#3d2c29] shadow-sm transition hover:bg-[#faf9f9] focus-visible:ring-2 focus-visible:ring-[#c93b44]/30"
            aria-label="Voltar ao cardápio"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2} />
          </Link>
          <h1 className="font-serif text-2xl font-semibold text-[#3d2c29] md:text-3xl">
            Meu perfil
          </h1>
        </div>
        {status === "loading" && (
          <div className="flex justify-center py-16">
            <Loader2
              className="h-10 w-10 animate-spin text-[#c93b44]"
              aria-label="Carregando perfil"
            />
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-[#6b5e5a]">
              Nao foi possivel carregar seus dados. Verifique se voce esta
              autenticado com token valido.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block rounded-xl bg-[#c93b44] px-6 py-3 font-medium text-white"
            >
              Voltar ao cardápio
            </Link>
          </div>
        )}

        {status === "ready" && profile ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <ProfileEditForm
              profile={profile}
              onUpdated={(next) => setProfile(next)}
            />
            <ProfileAddressForm userId={profile.id} />
          </div>
        ) : null}
      </main>

      <DashboardBottomNav active="none" />
    </div>
  );
}
