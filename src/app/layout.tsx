import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Lexilia - Gestion Cabinet d'Avocat",
  description: "Application de gestion de dossiers et facturation pour cabinet d'avocat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full flex">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>
      </body>
    </html>
  );
}
