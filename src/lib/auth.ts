const TOKEN_KEY = "gopizza_access_token";
/** Fallback quando a API ainda não devolve JWT no formato esperado (sessão do navegador). */
const SESSION_AUTH_KEY = "gopizza_session_auth";
const USER_NAME_KEY = "gopizza_user_name";

export function getToken(): string | null {
  if (globalThis.window === undefined) return null;
  return globalThis.window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  sessionStorage.removeItem(SESSION_AUTH_KEY);
}

export function setUserName(name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  localStorage.setItem(USER_NAME_KEY, trimmed);
}

export function getUserName(): string | null {
  if (globalThis.window === undefined) return null;
  return globalThis.window.localStorage.getItem(USER_NAME_KEY);
}

/** Use quando o login retornar 200 mas sem token extraível (ex.: cookie HttpOnly no backend). */
export function markSessionAuthenticated(): void {
  sessionStorage.setItem(SESSION_AUTH_KEY, "1");
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_NAME_KEY);
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

function pickNameFromRecord(record: Record<string, unknown>): string | null {
  const candidate =
    record.name ?? record.userName ?? record.username ?? record.fullName;
  if (typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate.trim();
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

export function extractUserNameFromLoginResponse(data: unknown): string | null {
  const root = asRecord(data);
  if (!root) return null;

  const records = [
    root,
    asRecord(root.user),
    asRecord(root.data),
    asRecord(asRecord(root.data)?.user),
  ];

  for (const record of records) {
    if (!record) continue;
    const found = pickNameFromRecord(record);
    if (found) return found;
  }

  return null;
}
