"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  Scale,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/dossiers", icon: FolderOpen, label: "Dossiers" },
  { href: "/factures", icon: FileText, label: "Facturation" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-800 text-slate-100 flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Lexilia</h1>
            <p className="text-xs text-slate-400">Cabinet d&apos;Avocat</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        © {new Date().getFullYear()} Lexilia
      </div>
    </aside>
  );
}
