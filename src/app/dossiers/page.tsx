import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, FolderOpen } from "lucide-react";
import { formatDate, TYPES_DOSSIER } from "@/lib/utils";

export default async function DossiersPage() {
  const dossiers = await prisma.dossier.findMany({
    include: {
      client: true,
      _count: { select: { factures: true, honoraires: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const typeLabel = Object.fromEntries(TYPES_DOSSIER.map((t) => [t.value, t.label]));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dossiers</h2>
          <p className="text-slate-500 mt-1">{dossiers.length} dossier(s)</p>
        </div>
        <Link
          href="/dossiers/nouveau"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Nouveau dossier
        </Link>
      </div>

      {dossiers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">Aucun dossier</p>
          <p className="text-slate-400 mt-1 mb-6">Créez votre premier dossier</p>
          <Link
            href="/dossiers/nouveau"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nouveau dossier
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Référence</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Dossier</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Client</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Ouverture</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dossiers.map((dossier) => (
                <tr key={dossier.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link href={`/dossiers/${dossier.id}`} className="text-sm font-mono text-blue-600 hover:underline">
                      {dossier.reference}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dossiers/${dossier.id}`} className="font-medium text-slate-900 text-sm hover:text-blue-600">
                      {dossier.titre}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/clients/${dossier.client.id}`} className="text-sm text-slate-600 hover:text-blue-600">
                      {dossier.client.nom} {dossier.client.prenom}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500">{typeLabel[dossier.type] || dossier.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">{formatDate(dossier.dateOuverture)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      dossier.statut === "ouvert" ? "bg-blue-100 text-blue-700"
                      : dossier.statut === "en_cours" ? "bg-amber-100 text-amber-700"
                      : dossier.statut === "cloture" ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                    }`}>
                      {dossier.statut === "ouvert" ? "Ouvert"
                        : dossier.statut === "en_cours" ? "En cours"
                        : dossier.statut === "cloture" ? "Clôturé"
                        : "Archivé"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
