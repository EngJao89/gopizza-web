import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro | Go Pizza",
  description: "Crie sua conta no Go Pizza",
};

export default function SignupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
