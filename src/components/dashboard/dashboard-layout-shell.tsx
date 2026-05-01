"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import api from "@/lib/axios";
import { getToken, getUserName, setUserName } from "@/lib/auth";
import { normalizeMeResponse } from "@/lib/current-user";
import { logoutFromApp } from "@/lib/logout";
import { toast } from "@/lib/toast";

type DashboardLayoutShellProps = Readonly<{
  children: React.ReactNode;
}>;

export function DashboardLayoutShell({ children }: DashboardLayoutShellProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Garçom");
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fromStorage = getUserName();
    if (fromStorage) {
      setDisplayName(fromStorage);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) return;

    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get<unknown>("api/auth/me");
        const user = normalizeMeResponse(data);
        if (!cancelled && user) {
          setDisplayName(user.name);
          setUserPhotoUrl(user.photoUrl);
          setUserName(user.name);
        }
      } catch {
        // Mantém nome do login / localStorage
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutFromApp();
      toast.success("Voce saiu do sistema.");
      router.replace("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader
        displayName={displayName}
        userPhotoUrl={userPhotoUrl}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
