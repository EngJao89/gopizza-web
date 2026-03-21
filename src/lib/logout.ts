import api from "@/lib/axios";
import { clearAuth } from "@/lib/auth";

export async function logoutFromApp(): Promise<void> {
  try {
    await api.post("api/auth/logout");
  } catch {
    // Mesmo com falha de rede ou 401, seguimos com saída local
  } finally {
    clearAuth();
  }
}
