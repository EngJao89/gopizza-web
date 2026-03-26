"use client";

import { AxiosError } from "axios";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { AuthSplitLayout, authFieldClassName } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
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

/** Payload enviado à API (normalizado). */
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

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>();

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
      // Ajuste se sua API usar outro path (ex.: api/users ou api/auth/register).
      await api.post("api/auth/signup", payload);
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Nome completo"
            autoComplete="name"
            className={authFieldClassName}
            {...register("name", {
              required: "Informe seu nome",
              minLength: { value: 2, message: "Nome muito curto" },
            })}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-amber-100">{errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="E-mail"
            autoComplete="email"
            className={authFieldClassName}
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
          <input
            type="tel"
            placeholder="Telefone"
            autoComplete="tel"
            className={authFieldClassName}
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
          <input
            type="text"
            inputMode="numeric"
            placeholder="CPF"
            autoComplete="off"
            className={authFieldClassName}
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
          <label
            htmlFor="signup-birthday"
            className="mb-1.5 block text-sm text-white/80"
          >
            Data de nascimento
          </label>
          <input
            id="signup-birthday"
            type="date"
            className={`${authFieldClassName} text-white scheme-dark`}
            {...register("birthday", {
              required: "Informe sua data de nascimento",
            })}
          />
          {errors.birthday && (
            <p className="mt-2 text-sm text-amber-100">{errors.birthday.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Senha"
            autoComplete="new-password"
            className={authFieldClassName}
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
    </AuthSplitLayout>
  );
}
