import { resolveImageUrl } from "@/lib/pizza-flavors";

export type CurrentUser = {
  name: string;
  /** URL absoluta da foto, ou null */
  photoUrl: string | null;
};

/** Perfil completo retornado por GET api/auth/me (contrato plano). */
export type MeProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthday: string;
  createdAt: string;
  updatedAt: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function pickName(record: Record<string, unknown>): string | null {
  const candidate =
    record.name ?? record.userName ?? record.username ?? record.fullName;
  if (typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate.trim();
  }
  return null;
}

function pickPhoto(record: Record<string, unknown>): string | null {
  const keys = [
    "photoUrl",
    "imageUrl",
    "avatarUrl",
    "photo",
    "picture",
    "avatar",
    "profileImage",
    "image",
  ] as const;
  for (const key of keys) {
    const v = record[key];
    if (typeof v === "string" && v.trim().length > 0) {
      return v.trim();
    }
  }
  return null;
}

/**
 * Normaliza GET api/auth/me (objeto direto ou envelope `data` / `user`).
 */
export function normalizeMeResponse(data: unknown): CurrentUser | null {
  const root = asRecord(data);
  if (!root) return null;

  const records: Record<string, unknown>[] = [
    root,
    asRecord(root.data),
    asRecord(root.user),
    asRecord(asRecord(root.data)?.user),
  ].filter((r): r is Record<string, unknown> => r !== null);

  for (const record of records) {
    const name = pickName(record);
    if (!name) continue;
    const raw = pickPhoto(record);
    const photoUrl = raw ? resolveImageUrl(raw) || null : null;
    return { name, photoUrl };
  }

  return null;
}

function asTrimmedString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

/**
 * Normaliza GET api/auth/me para o formulário de perfil (objeto plano).
 */
export function normalizeMeProfile(data: unknown): MeProfile | null {
  const root = asRecord(data);
  if (!root) return null;

  const flat =
    asRecord(root.data) ?? asRecord(root.user) ?? root;

  const id = asTrimmedString(flat.id);
  const name = asTrimmedString(flat.name);
  if (!id || !name) return null;

  return {
    id,
    name,
    email: asTrimmedString(flat.email),
    phone: asTrimmedString(flat.phone),
    cpf: asTrimmedString(flat.cpf),
    birthday: asTrimmedString(flat.birthday),
    createdAt: asTrimmedString(flat.createdAt),
    updatedAt: asTrimmedString(flat.updatedAt),
  };
}
