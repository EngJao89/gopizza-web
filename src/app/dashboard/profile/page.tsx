"use client";

import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";
import { ProfileEditForm } from "@/components/dashboard/profile-edit-form";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
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
      <header className="relative z-10 flex w-full shrink-0 items-center gap-3 bg-[#c93b44] px-4 py-4 shadow-sm md:px-8">
        <NavigationMenu viewport={false}>
          <NavigationMenuList className="flex-none justify-start gap-0">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/dashboard"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label="Voltar ao cardápio"
                >
                  <ChevronLeft className="h-6 w-6" strokeWidth={2} />
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <h1 className="font-serif text-xl font-semibold tracking-tight text-white md:text-2xl">
          Meu perfil
        </h1>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 md:px-8">
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
          <ProfileEditForm
            profile={profile}
            onUpdated={(next) => setProfile(next)}
          />
        ) : null}
      </main>

      <DashboardBottomNav active="none" />
    </div>
  );
}
