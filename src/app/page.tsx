import { prisma } from "@/lib/prisma";
import { formatMontant, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Users, FolderOpen, FileText, TrendingUp,
  Clock, AlertCircle, ChevronRight, Calendar,
  ArrowUpRight,
} from "lucide-react";

async function getData() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalClients,
    dossiersByStatut,
    caTotal,
    caMois,
    honorairesMois,
    recentDossiers,
    facturesEnAttente,
    prochainEvenements,
    facturesEnRetard,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.dossier.groupBy({ by: ["statut"], _count: true }),
    prisma.facture.aggregate({ _sum: { montantTTC: true }, where: { statut: "payee" } }),
    prisma.facture.aggregate({ _sum: { montantTTC: true }, where: { statut: "payee", createdAt: { gte: startOfMonth } } }),
    prisma.honoraire.aggregate({ _sum: { montant: true }, where: { date: { gte: startOfMonth } } }),
    prisma.dossier.findMany({ take: 5, include: { client: true }, orderBy: { updatedAt: "desc" } }),
    prisma.facture.findMany({
      where: { statut: "envoyee" },
      include: { dossier: { include: { client: true } } },
      orderBy: { dateEcheance: "asc" },
      take: 6,
    }),
    prisma.evenement.findMany({
      where: { debut: { gte: today } },
      include: { dossier: true, client: true },
      orderBy: { debut: "asc" },
      take: 4,
    }),
    prisma.facture.count({
      where: { statut: "envoyee", dateEcheance: { lt: today } },
    }),
  ]);

  return {
    totalClients,
    dossiersByStatut,
    caTotal: caTotal._sum.montantTTC || 0,
    caMois: caMois._sum.montantTTC || 0,
    honorairesMois: honorairesMois._sum.montant || 0,
    recentDossiers,
    facturesEnAttente,
    prochainEvenements,
    facturesEnRetard,
  };
}

const STATUT_STYLE: Record<string, { label: string; cls: string }> = {
  ouvert:   { label: "Ouvert",   cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  en_cours: { label: "En cours", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  cloture:  { label: "Clôturé",  cls: "bg-green-50 text-green-700 ring-1 ring-green-200" },
  archive:  { label: "Archivé",  cls: "bg-slate-100 text-slate-500 ring-1 ring-slate-200" },
};

const TYPE_EVENT: Record<string, { label: string; color: string }> = {
  rdv:       { label: "RDV", color: "bg-blue-500" },
  audience:  { label: "Audience", color: "bg-red-500" },
  echeance:  { label: "Échéance", color: "bg-amber-500" },
  tache:     { label: "Tâche", color: "bg-purple-500" },
};

export default async function DashboardPage() {
  const d = await getData();
  const statuts = Object.fromEntries(d.dossiersByStatut.map((s) => [s.statut, s._count]));
  const dossiersActifs = (statuts["ouvert"] || 0) + (statuts["en_cours"] || 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 text-sm mt-1">{formatDate(new Date())}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Clients",
            value: d.totalClients,
            sub: "au total",
            icon: Users,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            href: "/clients",
          },
          {
            label: "Dossiers actifs",
            value: dossiersActifs,
            sub: `${statuts["cloture"] || 0} clôturé(s)`,
            icon: FolderOpen,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
            href: "/dossiers",
          },
          {
            label: "CA du mois",
            value: formatMontant(d.caMois),
            sub: `${formatMontant(d.caTotal)} total`,
            icon: TrendingUp,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
            href: "/factures",
          },
          {
            label: "Temps ce mois",
            value: formatMontant(d.honorairesMois),
            sub: d.facturesEnRetard > 0 ? `${d.facturesEnRetard} facture(s) en retard` : "Aucun retard",
            icon: Clock,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
            href: "/temps",
            alert: d.facturesEnRetard > 0,
          },
        ].map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${kpi.iconBg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{kpi.label}</p>
              <p className={`text-xs mt-1 ${kpi.alert ? "text-red-500 font-medium" : "text-slate-400"}`}>{kpi.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dossiers récents */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Dossiers récents</h2>
            <Link href="/dossiers" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Voir tout <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {d.recentDossiers.length === 0 ? (
              <p className="px-6 py-8 text-slate-400 text-sm text-center">Aucun dossier</p>
            ) : d.recentDossiers.map((dos) => {
              const s = STATUT_STYLE[dos.statut] || STATUT_STYLE["ouvert"];
              return (
                <Link key={dos.id} href={`/dossiers/${dos.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate group-hover:text-blue-600">{dos.titre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{dos.client.nom} {dos.client.prenom} · {dos.reference}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${s.cls}`}>{s.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Panel droit */}
        <div className="space-y-6">
          {/* Prochains événements */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                À venir
              </h2>
              <Link href="/agenda" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Agenda <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {d.prochainEvenements.length === 0 ? (
                <p className="px-5 py-6 text-slate-400 text-xs text-center">Aucun événement à venir</p>
              ) : d.prochainEvenements.map((ev) => {
                const t = TYPE_EVENT[ev.type] || TYPE_EVENT["rdv"];
                return (
                  <div key={ev.id} className="px-5 py-3 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${t.color} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{ev.titre}</p>
                      <p className="text-xs text-slate-400">{formatDate(ev.debut)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Factures en attente */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Impayées
              </h2>
              <Link href="/factures" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Tout voir <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {d.facturesEnAttente.length === 0 ? (
                <p className="px-5 py-6 text-slate-400 text-xs text-center">Aucune facture impayée</p>
              ) : d.facturesEnAttente.slice(0, 4).map((f) => {
                const overdue = new Date(f.dateEcheance) < new Date();
                return (
                  <Link key={f.id} href={`/factures/${f.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{f.dossier.client.nom}</p>
                      <p className={`text-xs ${overdue ? "text-red-500 font-medium" : "text-slate-400"}`}>
                        Échéance {formatDate(f.dateEcheance)}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 ml-2 shrink-0">{formatMontant(f.montantTTC)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
