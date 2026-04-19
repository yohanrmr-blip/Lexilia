import { prisma } from "@/lib/prisma";
import { formatMontant } from "@/lib/utils";
import Link from "next/link";
import { Users, FolderOpen, FileText, TrendingUp, AlertCircle } from "lucide-react";

async function getDashboardData() {
  const [
    totalClients,
    dossiersByStatut,
    factureStats,
    recentDossiers,
    facturesEnAttente,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.dossier.groupBy({ by: ["statut"], _count: true }),
    prisma.facture.aggregate({
      _sum: { montantTTC: true },
      where: { statut: "payee" },
    }),
    prisma.dossier.findMany({
      take: 5,
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.facture.findMany({
      where: { statut: "envoyee" },
      include: { dossier: { include: { client: true } } },
      orderBy: { dateEcheance: "asc" },
      take: 5,
    }),
  ]);

  return {
    totalClients,
    dossiersByStatut,
    totalEncaisse: factureStats._sum.montantTTC || 0,
    recentDossiers,
    facturesEnAttente,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const statsDossiers = Object.fromEntries(
    data.dossiersByStatut.map((d) => [d.statut, d._count])
  );

  const stats = [
    {
      label: "Clients",
      value: data.totalClients,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      href: "/clients",
    },
    {
      label: "Dossiers actifs",
      value: (statsDossiers["ouvert"] || 0) + (statsDossiers["en_cours"] || 0),
      icon: FolderOpen,
      color: "bg-amber-50 text-amber-600",
      href: "/dossiers",
    },
    {
      label: "Factures en attente",
      value: data.facturesEnAttente.length,
      icon: FileText,
      color: "bg-purple-50 text-purple-600",
      href: "/factures",
    },
    {
      label: "CA encaissé",
      value: formatMontant(data.totalEncaisse),
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
      href: "/factures",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Tableau de bord</h2>
        <p className="text-slate-500 mt-1">Vue d&apos;ensemble de votre activité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`inline-flex p-3 rounded-lg ${stat.color} mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Dossiers récents</h3>
            <Link href="/dossiers" className="text-sm text-blue-600 hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentDossiers.length === 0 ? (
              <p className="p-6 text-slate-400 text-sm text-center">Aucun dossier</p>
            ) : (
              data.recentDossiers.map((dossier) => (
                <Link
                  key={dossier.id}
                  href={`/dossiers/${dossier.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{dossier.titre}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {dossier.client.nom} {dossier.client.prenom} · {dossier.reference}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      dossier.statut === "ouvert"
                        ? "bg-blue-100 text-blue-700"
                        : dossier.statut === "en_cours"
                        ? "bg-amber-100 text-amber-700"
                        : dossier.statut === "cloture"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {dossier.statut === "ouvert"
                      ? "Ouvert"
                      : dossier.statut === "en_cours"
                      ? "En cours"
                      : dossier.statut === "cloture"
                      ? "Clôturé"
                      : "Archivé"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Factures en attente
            </h3>
            <Link href="/factures" className="text-sm text-blue-600 hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.facturesEnAttente.length === 0 ? (
              <p className="p-6 text-slate-400 text-sm text-center">Aucune facture en attente</p>
            ) : (
              data.facturesEnAttente.map((facture) => {
                const isOverdue = new Date(facture.dateEcheance) < new Date();
                return (
                  <Link
                    key={facture.id}
                    href={`/factures/${facture.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{facture.numero}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {facture.dossier.client.nom} · Échéance:{" "}
                        <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                          {new Date(facture.dateEcheance).toLocaleDateString("fr-FR")}
                        </span>
                      </p>
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">
                      {formatMontant(facture.montantTTC)}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
