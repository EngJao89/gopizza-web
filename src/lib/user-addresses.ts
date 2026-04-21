export type UserAddress = {
  id: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  reference: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function asTrimmedString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function firstString(
  source: Record<string, unknown>,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const value = asTrimmedString(source[key]);
    if (value) return value;
  }
  return "";
}

function toAddress(value: unknown): UserAddress | null {
  const record = asRecord(value);
  if (!record) return null;

  const address: UserAddress = {
    id: firstString(record, ["id", "addressId"]),
    zipCode: firstString(record, ["zipCode", "zipcode", "postalCode", "cep"]),
    street: firstString(record, ["street", "logradouro", "address", "rua"]),
    number: firstString(record, ["number", "numero"]),
    complement: firstString(record, ["complement", "complemento"]),
    neighborhood: firstString(record, ["neighborhood", "bairro", "district"]),
    city: firstString(record, ["city", "cidade"]),
    state: firstString(record, ["state", "uf"]),
    reference: firstString(record, ["reference", "referencia"]),
  };

  const hasAnyField = Object.values(address).some((entry) => entry.length > 0);
  return hasAnyField ? address : null;
}

function collectAddressArrays(value: unknown): unknown[][] {
  const root = asRecord(value);
  if (!root) return [];

  const dataRecord = asRecord(root.data);

  const candidates: unknown[] = [
    root,
    root.addresses,
    root.items,
    root.results,
    dataRecord,
    dataRecord?.addresses,
    dataRecord?.items,
    dataRecord?.results,
  ];

  return candidates.filter((item): item is unknown[] => Array.isArray(item));
}

export function normalizeUserAddresses(data: unknown): UserAddress[] {
  const arrays = collectAddressArrays(data);
  const resolvedArray = arrays.find((entry) => entry.length > 0) ?? arrays[0] ?? [];

  return resolvedArray
    .map((entry) => toAddress(entry))
    .filter((entry): entry is UserAddress => entry !== null);
}
