"use client";

import { useDashboardHeaderToolbar } from "@/components/dashboard/dashboard-header-toolbar-context";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { ClipboardList, ChevronLeft, LogOut, MoreVertical, Smile } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type DashboardHeaderProps = Readonly<{
  displayName: string;
  userPhotoUrl: string | null;
  isLoggingOut: boolean;
  onLogout: () => void | Promise<void>;
}>;

export function DashboardHeader({
  displayName,
  userPhotoUrl,
  isLoggingOut,
  onLogout,
}: DashboardHeaderProps) {
  const { config: toolbar } = useDashboardHeaderToolbar();

  return (
    <header className="relative z-10 grid w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-x-2 bg-[#c93b44] px-4 pb-14 pt-4 md:gap-x-4 md:px-8 md:pb-16">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5d547] shadow-sm">
          {userPhotoUrl ? (
            <Image
              src={userPhotoUrl}
              alt=""
              fill
              className="object-cover"
              sizes="44px"
              unoptimized
            />
          ) : (
            <Smile
              className="h-7 w-7 text-[#8b6914]"
              strokeWidth={2}
              aria-hidden
            />
          )}
        </span>
        <h1 className="min-w-0 truncate font-serif text-lg font-semibold tracking-tight text-white md:text-xl lg:text-2xl">
          Olá, {displayName || "Garçom"}
        </h1>
      </div>

      <div className="flex max-w-[min(100vw-10rem,28rem)] items-center justify-center gap-2 md:gap-3">
        {toolbar ? (
          <>
            <Link
              href="/dashboard"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="Voltar"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.5} />
            </Link>
            <h2 className="min-w-0 flex-1 truncate text-center font-serif text-base font-semibold leading-tight text-white md:text-lg lg:text-xl">
              {toolbar.title}
            </h2>
            <Button
              type="button"
              variant="ghost"
              onClick={toolbar.onClear}
              className="h-11 shrink-0 rounded-lg border-0 bg-white/15 px-3 text-sm font-medium text-white shadow-none hover:bg-white/25 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 md:px-4"
            >
              Limpar
            </Button>
          </>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Link
          href="/dashboard/pedidos"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-white/15 px-3 text-sm font-medium text-white transition hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <ClipboardList className="h-4 w-4" aria-hidden />
          Pedidos
        </Link>
        <Menubar className="h-auto shrink-0 border-0 bg-transparent p-0 shadow-none">
          <MenubarMenu>
            <MenubarTrigger
              disabled={isLoggingOut}
              className="flex h-11 w-11 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 data-[state=open]:bg-white/10"
              aria-label="Menu da conta"
            >
              <MoreVertical className="h-[22px] w-[22px]" aria-hidden />
            </MenubarTrigger>
            <MenubarContent align="end" sideOffset={8} className="min-w-44">
              <MenubarItem asChild>
                <Link href="/dashboard/profile">Meu perfil</Link>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                variant="destructive"
                disabled={isLoggingOut}
                onSelect={() => {
                  void onLogout();
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sair
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </header>
  );
}
