import { prisma } from "@/lib/prisma";
import { formatMontant, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Clock, TrendingUp } from "lucide-react";

export default async function TempsPage() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [honoraires, statsMois, statsTotal] = await Promise.all([
    prisma.honoraire.findMany({
      include: { dossier: { include: { client: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.honoraire.aggregate({
      _sum: { heures: true, montant: true },
      where: { date: { gte: startOfMonth } },
    }),
    prisma.honoraire.aggregate({
      _sum: { heures: true, montant: true },
    }),
  ]);

  // Group by dossier
  const byDossier = honoraires.reduce<Record<string, { titre: string; client: string; heures: number; montant: number; id: string }>>((acc, h) => {
    if (!acc[h.dossierId]) {
      acc[h.dossierId] = {
        id: h.dossierId,
        titre: h.dossier.titre,
        client: `${h.dossier.client.nom} ${h.dossier.client.prenom || ""}`,
        heures: 0,
        montant: 0,
      };
    }
    acc[h.dossierId].heures += h.heures;
    acc[h.dossierId].montant += h.montant;
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Suivi du temps</h1>
        <p className="text-slate-500 text-sm mt-1">Honoraires et temps passé par dossier</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Heures ce mois", value: `${(statsMois._sum.heures || 0).toFixed(1)} h`, icon: Clock, color: "text-blue-600 bg-blue-50" },
          { label: "Honoraires ce mois", value: formatMontant(statsMois._sum.montant || 0), icon: TrendingUp, color: "text-green-600 bg-green-50" },
          { label: "Heures totales", value: `${(statsTotal._sum.heures || 0).toFixed(1)} h`, icon: Clock, color: "text-purple-600 bg-purple-50" },
          { label: "Honoraires totaux", value: formatMontant(statsTotal._sum.montant || 0), icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`inline-flex p-2.5 rounded-lg ${s.color} mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Par dossier */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Temps par dossier</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {Object.values(byDossier).sort((a, b) => b.heures - a.heures).map((d) => {
              const pct = statsTotal._sum.heures ? (d.heures / statsTotal._sum.heures) * 100 : 0;
              return (
                <Link key={d.id} href={`/dossiers/${d.id}`} className="block px-6 py-4 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{d.titre}</p>
                      <p className="text-xs text-slate-400">{d.client}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{d.heures.toFixed(1)} h</p>
                      <p className="text-xs text-slate-400">{formatMontant(d.montant)}</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </Link>
              );
            })}
            {Object.keys(byDossier).length === 0 && (
              <p className="px-6 py-8 text-slate-400 text-sm text-center">Aucun temps enregistré</p>
            )}
          </div>
        </div>

        {/* Dernières saisies */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Dernières saisies</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {honoraires.slice(0, 12).map((h) => (
              <div key={h.id} className="px-6 py-3 flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-slate-500">
                  {h.heures}h
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{h.description}</p>
                  <p className="text-xs text-slate-400">
                    {h.dossier.client.nom} · {formatDate(h.date)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900 shrink-0">{formatMontant(h.montant)}</p>
              </div>
            ))}
            {honoraires.length === 0 && (
              <p className="px-6 py-8 text-slate-400 text-sm text-center">Aucune saisie</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
