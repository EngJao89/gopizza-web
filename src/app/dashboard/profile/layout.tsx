import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil | Go Pizza",
  description: "Dados do usuário",
};

export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
