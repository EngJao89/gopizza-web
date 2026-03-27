"use client";

import { AxiosError } from "axios";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { AuthSplitLayout, authFieldClassName } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import api from "@/lib/axios";
import { toast } from "@/lib/toast";
import { isValidCPF } from "@/lib/validators/cpf";

export type SignUpFormData = {
  email: string;
  name: string;
  phone: string;
  password: string;
  birthday: string;
  cpf: string;
};

type SignUpPayload = {
  email: string;
  name: string;
  phone: string;
  password: string;
  birthday: string;
  cpf: string;
};

function onlyDigits(value: string): string {
  return value.replaceAll(/\D/g, "");
}

function parseIsoDateToLocal(isoDate: string): Date | undefined {
  if (!isoDate) return undefined;
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return undefined;
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(dt.getTime())) return undefined;
  return dt;
}

function formatIsoDateToPtBr(isoDate: string): string {
  const dt = parseIsoDateToLocal(isoDate);
  if (!dt) return "";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(dt);
}

function formatLocalDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>();
  const birthdayValue = useWatch({ control, name: "birthday" });

  const onSubmit = async (data: SignUpFormData) => {
    const payload: SignUpPayload = {
      email: data.email.trim(),
      name: data.name.trim(),
      phone: onlyDigits(data.phone),
      password: data.password,
      birthday: data.birthday,
      cpf: onlyDigits(data.cpf),
    };

    try {
      await api.post("api/users", payload);
      toast.success("Conta criada com sucesso.");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? "Nao foi possivel concluir o cadastro.";

      toast.error(message);
    }
  };

  return (
    <AuthSplitLayout title="Cadastro">
      <Card className="gap-4 bg-white/5 text-white shadow-none ring-1 ring-white/15 border border-white/15 py-0">
        <CardContent className="px-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Nome completo"
                autoComplete="name"
                className={`${authFieldClassName} h-auto`}
                {...register("name", {
                  required: "Informe seu nome",
                  minLength: { value: 2, message: "Nome muito curto" },
                })}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-amber-100">
                  {errors.name.message}
                </p>
              )}
            </div>

        <div>
          <Input
            type="email"
            placeholder="E-mail"
            autoComplete="email"
            className={`${authFieldClassName} h-auto`}
            {...register("email", {
              required: "Informe seu e-mail",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Digite um e-mail valido",
              },
            })}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-amber-100">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Input
            type="tel"
            placeholder="Telefone"
            autoComplete="tel"
            className={`${authFieldClassName} h-auto`}
            {...register("phone", {
              required: "Informe seu telefone",
              validate: (v) =>
                onlyDigits(v).length >= 10 && onlyDigits(v).length <= 11
                  ? true
                  : "Telefone deve ter 10 ou 11 digitos",
            })}
          />
          {errors.phone && (
            <p className="mt-2 text-sm text-amber-100">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="CPF"
            autoComplete="off"
            className={`${authFieldClassName} h-auto`}
            {...register("cpf", {
              required: "Informe seu CPF",
              validate: (v) => (isValidCPF(v) ? true : "CPF invalido"),
            })}
          />
          {errors.cpf && (
            <p className="mt-2 text-sm text-amber-100">{errors.cpf.message}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="signup-birthday"
            className="mb-1.5 block text-sm font-medium text-white/80"
          >
            Data de nascimento
          </Label>
          <input type="hidden" {...register("birthday", { required: "Informe sua data de nascimento" })} />
          <Popover>
            <PopoverTrigger asChild>
              <Input
                id="signup-birthday"
                readOnly
                placeholder="Selecione a data"
                value={birthdayValue ? formatIsoDateToPtBr(birthdayValue) : ""}
                className={`${authFieldClassName} text-white scheme-dark h-auto cursor-pointer`}
                aria-label="Data de nascimento"
              />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={birthdayValue ? parseIsoDateToLocal(birthdayValue) : undefined}
                onSelect={(date) => {
                  if (!date) {
                    setValue("birthday", "", { shouldValidate: true });
                    return;
                  }
                  setValue("birthday", formatLocalDateToIso(date), { shouldValidate: true });
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.birthday && (
            <p className="mt-2 text-sm text-amber-100">{errors.birthday.message}</p>
          )}
        </div>

        <div>
          <Input
            type="password"
            placeholder="Senha"
            autoComplete="new-password"
            className={`${authFieldClassName} h-auto`}
            {...register("password", {
              required: "Informe sua senha",
              minLength: {
                value: 6,
                message: "A senha deve ter no minimo 6 caracteres",
              },
            })}
          />
          {errors.password && (
            <p className="mt-2 text-sm text-amber-100">{errors.password.message}</p>
          )}
        </div>

        <div className="pt-1 text-center">
          <Link
            href="/"
            className="text-base text-white/90 underline-offset-2 transition hover:text-white hover:underline"
          >
            Ja tenho conta
          </Link>
        </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-auto min-h-14 w-full rounded-xl bg-rose-500 px-4 py-4 text-lg font-semibold text-white hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthSplitLayout>
  );
}
