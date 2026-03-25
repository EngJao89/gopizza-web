import { resolveImageUrl } from "@/lib/pizza-flavors";

export type CurrentUser = {
  name: string;
  /** URL absoluta da foto, ou null */
  photoUrl: string | null;
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
