import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { formatDate, formatMontant } from "@/lib/utils";

export default async function FacturesPage() {
  const factures = await prisma.facture.findMany({
    include: {
      dossier: { include: { client: true } },
      paiements: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const total = factures.reduce((s, f) => s + f.montantTTC, 0);
  const encaisse = factures.filter((f) => f.statut === "payee").reduce((s, f) => s + f.montantTTC, 0);
  const enAttente = factures.filter((f) => f.statut === "envoyee").reduce((s, f) => s + f.montantTTC, 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Facturation</h2>
          <p className="text-slate-500 mt-1">{factures.length} facture(s)</p>
        </div>
        <Link
          href="/factures/nouvelle"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </Link>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total facturé", value: formatMontant(total), color: "text-slate-900" },
          { label: "En attente de paiement", value: formatMontant(enAttente), color: "text-amber-600" },
          { label: "Encaissé", value: formatMontant(encaisse), color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {factures.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">Aucune facture</p>
          <p className="text-slate-400 mt-1 mb-6">Créez votre première facture</p>
          <Link
            href="/factures/nouvelle"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Numéro</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Client</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Dossier</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Émission</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Échéance</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Montant TTC</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {factures.map((facture) => {
                const isOverdue =
                  facture.statut === "envoyee" &&
                  new Date(facture.dateEcheance) < new Date();
                return (
                  <tr key={facture.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Link href={`/factures/${facture.id}`} className="text-sm font-mono text-blue-600 hover:underline">
                        {facture.numero}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {facture.dossier.client.nom} {facture.dossier.client.prenom}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dossiers/${facture.dossier.id}`} className="text-sm text-slate-600 hover:text-blue-600 truncate max-w-32 block">
                        {facture.dossier.titre}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(facture.dateEmission)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={isOverdue ? "text-red-600 font-medium" : "text-slate-500"}>
                        {formatDate(facture.dateEcheance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {formatMontant(facture.montantTTC)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        facture.statut === "payee" ? "bg-green-100 text-green-700"
                        : facture.statut === "envoyee" ? "bg-blue-100 text-blue-700"
                        : facture.statut === "annulee" ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600"
                      }`}>
                        {facture.statut === "payee" ? "Payée"
                          : facture.statut === "envoyee" ? "Envoyée"
                          : facture.statut === "annulee" ? "Annulée"
                          : "Brouillon"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
