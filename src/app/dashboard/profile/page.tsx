"use client";

import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";
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

const fieldClass =
  "w-full rounded-lg border border-[#e8e4e2] bg-[#faf9f9] px-3 py-2.5 text-[#3d2c29] outline-none read-only:cursor-default";

function formatCpf(digits: string): string {
  const d = digits.replaceAll(/\D/g, "");
  if (d.length !== 11) return digits;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatPhone(digits: string): string {
  const d = digits.replaceAll(/\D/g, "");
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return digits;
}

function formatDateBr(isoDate: string): string {
  if (!isoDate) return "";
  const part = isoDate.split("T")[0] ?? "";
  const [y, m, day] = part.split("-");
  if (!y || !m || !day) return isoDate;
  return `${day}/${m}/${y}`;
}

function formatDateTimeBr(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

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
      <header className="flex w-full items-center gap-3 border-b border-[#e0dcd9] bg-white px-4 py-4 shadow-sm md:px-8">
        <NavigationMenu viewport={false}>
          <NavigationMenuList className="flex-none justify-start gap-0">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/dashboard"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-[#3d2c29] hover:bg-[#f5f3f2]"
                  aria-label="Voltar ao cardápio"
                >
                  <ChevronLeft className="h-6 w-6" strokeWidth={2} />
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <h1 className="font-serif text-xl font-semibold text-[#3d2c29] md:text-2xl">
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

        {status === "ready" && profile && (
          <form
            className="space-y-4 rounded-2xl bg-white p-5 shadow-sm md:p-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <p className="text-xs text-[#8a7d79]">
              Dados exibidos conforme retorno de{" "}
              <code className="rounded bg-[#f0eeed] px-1">api/auth/me</code>{" "}
              (somente leitura).
            </p>

            <div>
              <label htmlFor="profile-name" className="mb-1 block text-xs font-medium text-[#8a7d79]">
                Nome completo
              </label>
              <input
                id="profile-name"
                readOnly
                value={profile.name}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="mb-1 block text-xs font-medium text-[#8a7d79]">
                E-mail
              </label>
              <input
                id="profile-email"
                readOnly
                type="email"
                value={profile.email}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="profile-phone" className="mb-1 block text-xs font-medium text-[#8a7d79]">
                Telefone
              </label>
              <input
                id="profile-phone"
                readOnly
                value={formatPhone(profile.phone)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="profile-cpf" className="mb-1 block text-xs font-medium text-[#8a7d79]">
                CPF
              </label>
              <input
                id="profile-cpf"
                readOnly
                value={formatCpf(profile.cpf)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="profile-birthday" className="mb-1 block text-xs font-medium text-[#8a7d79]">
                Data de nascimento
              </label>
              <input
                id="profile-birthday"
                readOnly
                value={formatDateBr(profile.birthday)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="profile-id" className="mb-1 block text-xs font-medium text-[#8a7d79]">
                ID
              </label>
              <input
                id="profile-id"
                readOnly
                value={profile.id}
                className={`${fieldClass} font-mono text-sm`}
              />
            </div>

            <div className="border-t border-[#ecebea] pt-4 text-xs text-[#8a7d79]">
              <p>
                <span className="font-medium text-[#6b5e5a]">Criado em: </span>
                {formatDateTimeBr(profile.createdAt)}
              </p>
              <p className="mt-1">
                <span className="font-medium text-[#6b5e5a]">
                  Atualizado em:{" "}
                </span>
                {formatDateTimeBr(profile.updatedAt)}
              </p>
            </div>
          </form>
        )}
      </main>

      <DashboardBottomNav active="perfil" />
    </div>
  );
}
