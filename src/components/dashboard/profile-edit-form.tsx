"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { setUserName } from "@/lib/auth";
import { normalizeMeProfile, type MeProfile } from "@/lib/current-user";
import {
  onlyDigits,
  profileEditSchema,
  type ProfileEditFormValues,
} from "@/lib/schemas/profile-edit";
import { toast } from "@/lib/toast";

const fieldClass =
  "w-full rounded-lg border border-[#e8e4e2] bg-white px-3 py-2.5 text-[#3d2c29] outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]";

function birthdayToInputValue(iso: string): string {
  if (!iso) return "";
  const part = iso.split("T")[0] ?? iso;
  return /^\d{4}-\d{2}-\d{2}$/.test(part) ? part : "";
}

function formatCpfDisplay(digits: string): string {
  const d = onlyDigits(digits);
  if (d.length !== 11) return digits;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatPhoneDisplay(digits: string): string {
  const d = onlyDigits(digits);
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return digits;
}

function formatDateTimeBr(iso: string): string {
  if (!iso) return "";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(dt);
}

type ProfileEditFormProps = Readonly<{
  profile: MeProfile;
  onUpdated: (next: MeProfile) => void;
}>;

export function ProfileEditForm({ profile, onUpdated }: ProfileEditFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: formatPhoneDisplay(profile.phone),
      cpf: formatCpfDisplay(profile.cpf),
      birthday: birthdayToInputValue(profile.birthday),
    },
  });

  useEffect(() => {
    reset({
      name: profile.name,
      email: profile.email,
      phone: formatPhoneDisplay(profile.phone),
      cpf: formatCpfDisplay(profile.cpf),
      birthday: birthdayToInputValue(profile.birthday),
    });
  }, [profile, reset]);

  const onSubmit = async (data: ProfileEditFormValues) => {
    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: onlyDigits(data.phone),
      cpf: onlyDigits(data.cpf),
      birthday: data.birthday,
    };

    try {
      const { data: body } = await api.patch<unknown>(
        `api/users/${profile.id}`,
        payload,
      );

      const parsed =
        normalizeMeProfile(body) ??
        normalizeMeProfile({ data: body }) ??
        normalizeMeProfile({ user: body });

      if (parsed) {
        setUserName(parsed.name);
        onUpdated(parsed);
        toast.success("Perfil atualizado com sucesso.");
        return;
      }

      setUserName(payload.name);
      onUpdated({
        ...profile,
        ...payload,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Perfil atualizado com sucesso.");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ??
        "Nao foi possivel atualizar o perfil.";
      toast.error(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl bg-white p-5 shadow-sm md:p-6"
    >
      <div>
        <Label
          htmlFor="profile-name"
          className="mb-1 block text-xs font-medium text-[#8a7d79]"
        >
          Nome completo
        </Label>
        <Input
          id="profile-name"
          autoComplete="name"
          className={`${fieldClass} h-auto`}
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name ? (
          <p className="mt-1.5 text-sm text-[#c93b44]">{errors.name.message}</p>
        ) : null}
      </div>

      <div>
        <Label
          htmlFor="profile-email"
          className="mb-1 block text-xs font-medium text-[#8a7d79]"
        >
          E-mail
        </Label>
        <Input
          id="profile-email"
          type="email"
          autoComplete="email"
          className={`${fieldClass} h-auto`}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-1.5 text-sm text-[#c93b44]">{errors.email.message}</p>
        ) : null}
      </div>

      <div>
        <Label
          htmlFor="profile-phone"
          className="mb-1 block text-xs font-medium text-[#8a7d79]"
        >
          Telefone
        </Label>
        <Input
          id="profile-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={`${fieldClass} h-auto`}
          aria-invalid={!!errors.phone}
          {...register("phone")}
        />
        {errors.phone ? (
          <p className="mt-1.5 text-sm text-[#c93b44]">{errors.phone.message}</p>
        ) : null}
      </div>

      <div>
        <Label
          htmlFor="profile-cpf"
          className="mb-1 block text-xs font-medium text-[#8a7d79]"
        >
          CPF
        </Label>
        <Input
          id="profile-cpf"
          inputMode="numeric"
          autoComplete="off"
          className={`${fieldClass} h-auto`}
          aria-invalid={!!errors.cpf}
          {...register("cpf")}
        />
        {errors.cpf ? (
          <p className="mt-1.5 text-sm text-[#c93b44]">{errors.cpf.message}</p>
        ) : null}
      </div>

      <div>
        <Label
          htmlFor="profile-birthday"
          className="mb-1 block text-xs font-medium text-[#8a7d79]"
        >
          Data de nascimento
        </Label>
        <Input
          id="profile-birthday"
          type="date"
          className={`${fieldClass} h-auto scheme-light`}
          aria-invalid={!!errors.birthday}
          {...register("birthday")}
        />
        {errors.birthday ? (
          <p className="mt-1.5 text-sm text-[#c93b44]">
            {errors.birthday.message}
          </p>
        ) : null}
      </div>

      <div>
        <Label
          htmlFor="profile-admin"
          className="mb-1 block text-xs font-medium text-[#8a7d79]"
        >
          Perfil administrativo
        </Label>
        <Input
          id="profile-admin"
          readOnly
          value={profile.admin ? "Sim" : "Não"}
          className="w-full rounded-lg border border-[#e8e4e2] bg-[#faf9f9] px-3 py-2.5 text-[#3d2c29] outline-none read-only:cursor-default h-auto"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-auto min-h-11 w-full rounded-xl bg-[#c93b44] px-4 py-3 text-base font-semibold text-white hover:bg-[#b3343c] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Salvando..." : "Salvar alteracoes"}
      </Button>

      <div className="border-t border-[#ecebea] pt-4 text-xs text-[#8a7d79]">
        <p>
          <span className="font-medium text-[#6b5e5a]">Criado em: </span>
          {formatDateTimeBr(profile.createdAt)}
        </p>
        <p className="mt-1">
          <span className="font-medium text-[#6b5e5a]">Atualizado em: </span>
          {formatDateTimeBr(profile.updatedAt)}
        </p>
      </div>
    </form>
  );
}
