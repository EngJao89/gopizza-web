"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { toast } from "@/lib/toast";
import {
  normalizeUserAddresses,
  type UserAddress,
} from "@/lib/user-addresses";

const fieldClass =
  "w-full rounded-lg border border-[#e8e4e2] bg-white px-3 py-2.5 text-[#3d2c29] outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]";

type ProfileAddressFormProps = Readonly<{
  userId: string;
}>;

const emptyAddress: UserAddress = {
  id: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  reference: "",
};

function formatZipCode(cep: string): string {
  const digits = cep.replaceAll(/\D/g, "");
  if (digits.length !== 8) return cep;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function ProfileAddressForm({ userId }: ProfileAddressFormProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [address, setAddress] = useState<UserAddress>(emptyAddress);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus("loading");
      try {
        const { data } = await api.get<unknown>(`api/users/${userId}/addresses`);
        const parsed = normalizeUserAddresses(data);

        if (!cancelled) {
          setAddress(parsed[0] ?? emptyAddress);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setAddress(emptyAddress);
          toast.error("Nao foi possivel carregar os enderecos.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const formattedZipCode = useMemo(
    () => formatZipCode(address.zipCode),
    [address.zipCode],
  );

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-lg font-semibold text-[#3d2c29]">Endereco</h2>
      <p className="mt-1 text-sm text-[#8a7d79]">Dados carregados da sua conta.</p>

      {status === "loading" ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#c93b44]" />
        </div>
      ) : null}

      {status === "error" ? (
        <p className="mt-6 rounded-lg border border-[#f5d3d6] bg-[#fff7f8] p-3 text-sm text-[#a7404a]">
          Nao foi possivel carregar o endereco no momento.
        </p>
      ) : null}

      {status === "ready" ? (
        <form className="mt-5 space-y-4">
          <div>
            <Label
              htmlFor="address-zip-code"
              className="mb-1 block text-xs font-medium text-[#8a7d79]"
            >
              CEP
            </Label>
            <Input
              id="address-zip-code"
              value={formattedZipCode}
              readOnly
              className={`${fieldClass} h-auto read-only:cursor-default`}
            />
          </div>

          <div>
            <Label
              htmlFor="address-street"
              className="mb-1 block text-xs font-medium text-[#8a7d79]"
            >
              Rua
            </Label>
            <Input
              id="address-street"
              value={address.street}
              readOnly
              className={`${fieldClass} h-auto read-only:cursor-default`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="address-number"
                className="mb-1 block text-xs font-medium text-[#8a7d79]"
              >
                Numero
              </Label>
              <Input
                id="address-number"
                value={address.number}
                readOnly
                className={`${fieldClass} h-auto read-only:cursor-default`}
              />
            </div>

            <div>
              <Label
                htmlFor="address-complement"
                className="mb-1 block text-xs font-medium text-[#8a7d79]"
              >
                Complemento
              </Label>
              <Input
                id="address-complement"
                value={address.complement}
                readOnly
                className={`${fieldClass} h-auto read-only:cursor-default`}
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="address-neighborhood"
              className="mb-1 block text-xs font-medium text-[#8a7d79]"
            >
              Bairro
            </Label>
            <Input
              id="address-neighborhood"
              value={address.neighborhood}
              readOnly
              className={`${fieldClass} h-auto read-only:cursor-default`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
            <div>
              <Label
                htmlFor="address-city"
                className="mb-1 block text-xs font-medium text-[#8a7d79]"
              >
                Cidade
              </Label>
              <Input
                id="address-city"
                value={address.city}
                readOnly
                className={`${fieldClass} h-auto read-only:cursor-default`}
              />
            </div>
            <div>
              <Label
                htmlFor="address-state"
                className="mb-1 block text-xs font-medium text-[#8a7d79]"
              >
                UF
              </Label>
              <Input
                id="address-state"
                value={address.state}
                readOnly
                className={`${fieldClass} h-auto read-only:cursor-default`}
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="address-reference"
              className="mb-1 block text-xs font-medium text-[#8a7d79]"
            >
              Referencia
            </Label>
            <Input
              id="address-reference"
              value={address.reference}
              readOnly
              className={`${fieldClass} h-auto read-only:cursor-default`}
            />
          </div>
        </form>
      ) : null}
    </section>
  );
}
