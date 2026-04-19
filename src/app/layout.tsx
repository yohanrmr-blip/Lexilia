import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Lexilia — Gestion cabinet d'avocat",
  description: "Application de gestion de dossiers et facturation pour cabinet d'avocat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full flex bg-slate-50 antialiased">
        <Sidebar />
        <main className="flex-1 overflow-auto min-h-0">
          {children}
        </main>
      </body>
    </html>
  );
}
