"use client";

import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthSplitLayout, authFieldClassName } from "@/components/auth/auth-split-layout";
import {
  extractTokenFromLoginResponse,
  extractUserNameFromLoginResponse,
  markSessionAuthenticated,
  setAuthToken,
  setUserName,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/axios";
import { toast } from "@/lib/toast";

type SignInFormData = {
  email: string;
  password: string;
};

export default function Home() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>();

  const onSubmit = async (data: SignInFormData) => {
    try {
      const { data: body } = await api.post("api/auth/login", data);
      const token = extractTokenFromLoginResponse(body);
      const userName = extractUserNameFromLoginResponse(body);
      if (token) {
        setAuthToken(token);
      } else {
        markSessionAuthenticated();
      }
      if (userName) {
        setUserName(userName);
      }
      toast.success("Login realizado com sucesso.");
      router.replace("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? "Nao foi possivel realizar o login.";

      toast.error(message);
    }
  };

  return (
    <AuthSplitLayout title="Login">
      <Card className="gap-4 bg-white/5 text-white shadow-none ring-1 ring-white/15 border border-white/15 py-0">
        <CardContent className="px-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="E-mail"
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
                <p className="mt-2 text-sm text-amber-100">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Senha"
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
                <p className="mt-2 text-sm text-amber-100">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <Link
                href="/signup"
                className="text-base text-white/90 underline-offset-2 transition hover:text-white hover:underline"
              >
                Criar conta
              </Link>
              <Button
                type="button"
                variant="ghost"
                className="text-base text-white/90 hover:bg-white/10 hover:text-white"
              >
                Esqueci minha senha
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 h-auto min-h-14 w-full rounded-xl bg-rose-500 px-4 py-4 text-lg font-semibold text-white hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthSplitLayout>
  );
}
