"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  Scale,
  Calendar,
  FileSignature,
  Clock,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/agenda", icon: Calendar, label: "Agenda" },
  { href: "/dossiers", icon: FolderOpen, label: "Dossiers" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/temps", icon: Clock, label: "Temps" },
  { href: "/factures", icon: FileText, label: "Facturation" },
  { href: "/modeles", icon: FileSignature, label: "Modèles" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-[#0f1729] text-slate-300 flex flex-col min-h-screen shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">Lexilia</span>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">Cabinet d&apos;avocat</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-blue-500/15 text-blue-400 font-medium"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-[10px] text-slate-600">© {new Date().getFullYear()} Lexilia</p>
      </div>
    </aside>
  );
}
