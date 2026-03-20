import Image from "next/image";
import type { ReactNode } from "react";

/** Classes dos campos — reutilizar nas telas de auth (login, cadastro). */
export const authFieldClassName =
  "w-full rounded-xl border border-white/25 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/70 outline-none transition focus:border-white/60 md:py-4";

type AuthSplitLayoutProps = Readonly<{
  title: string;
  children: ReactNode;
}>;

export function AuthSplitLayout({ title, children }: AuthSplitLayoutProps) {
  return (
    <main className="min-h-screen bg-linear-to-b from-rose-600 to-red-700 px-6 py-8 md:px-10 md:py-10">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl backdrop-blur-sm md:grid-cols-2">
        <div className="relative min-h-[280px] border-b border-white/15 md:min-h-full md:border-b-0 md:border-r">
          <Image
            src="/bg-preview%20.png"
            alt="Pizza ingredients and brand preview"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="flex items-center justify-center p-6 md:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <h1 className="mb-6 text-4xl font-semibold text-white md:mb-8">{title}</h1>
            <div className="max-h-[min(70vh,calc(100vh-12rem))] overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/25">
              {children}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
