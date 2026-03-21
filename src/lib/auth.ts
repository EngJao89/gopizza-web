const TOKEN_KEY = "gopizza_access_token";
/** Fallback quando a API ainda não devolve JWT no formato esperado (sessão do navegador). */
const SESSION_AUTH_KEY = "gopizza_session_auth";

export function getToken(): string | null {
  if (globalThis.window === undefined) return null;
  return globalThis.window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  sessionStorage.removeItem(SESSION_AUTH_KEY);
}

/** Use quando o login retornar 200 mas sem token extraível (ex.: cookie HttpOnly no backend). */
export function markSessionAuthenticated(): void {
  sessionStorage.setItem(SESSION_AUTH_KEY, "1");
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(SESSION_AUTH_KEY);
}

export function isAuthenticated(): boolean {
  if (globalThis.window === undefined) return false;
  return (
    !!getToken() ||
    globalThis.window.sessionStorage.getItem(SESSION_AUTH_KEY) === "1"
  );
}

export function extractTokenFromLoginResponse(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  const direct =
    d.accessToken ?? d.token ?? d.access_token ?? d.jwt ?? d.idToken;
  if (typeof direct === "string" && direct.length > 0) return direct;

  const nested = d.data;
  if (nested && typeof nested === "object") {
    const n = nested as Record<string, unknown>;
    const t = n.accessToken ?? n.token ?? n.access_token ?? n.jwt;
    if (typeof t === "string" && t.length > 0) return t;
  }

  return null;
}
