"use client";

import { isAuthenticated } from "@/lib/auth";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useSyncExternalStore } from "react";

type Props = Readonly<{
  children: ReactNode;
}>;

function subscribeNoop() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ecebea]">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#c93b44] border-t-transparent"
        aria-label="Carregando"
      />
    </div>
  );
}

export function DashboardAuthGuard({ children }: Props) {
  const router = useRouter();
  const isClient = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!isClient || isAuthenticated()) return;
    router.replace("/");
  }, [isClient, router]);

  if (!isClient) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated()) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
