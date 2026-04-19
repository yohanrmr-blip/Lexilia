import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDate, formatMontant, MODES_PAIEMENT } from "@/lib/utils";
import FactureActions from "./FactureActions";
import AddPaiementForm from "./AddPaiementForm";

export default async function FactureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const facture = await prisma.facture.findUnique({
    where: { id },
    include: {
      dossier: { include: { client: true } },
      lignes: true,
      paiements: true,
    },
  });

  if (!facture) notFound();

  const totalPaye = facture.paiements.reduce((s, p) => s + p.montant, 0);
  const resteAPayer = facture.montantTTC - totalPaye;
  const isOverdue = facture.statut === "envoyee" && new Date(facture.dateEcheance) < new Date();

  const client = facture.dossier.client;
  const clientNom = client.type === "entreprise"
    ? client.societe || `${client.nom} ${client.prenom || ""}`
    : `${client.nom} ${client.prenom || ""}`;

  const modePaiementLabel = Object.fromEntries(MODES_PAIEMENT.map((m) => [m.value, m.label]));

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/factures" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Retour aux factures
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-mono">{facture.numero}</h2>
          <div className="flex items-center gap-2 mt-2">
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
            {isOverdue && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                En retard
              </span>
            )}
          </div>
        </div>
        <FactureActions factureId={facture.id} statut={facture.statut} dossierId={facture.dossierId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Infos facture */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 text-sm mb-3">Informations</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Client: </span>
              <Link href={`/clients/${client.id}`} className="text-blue-600 hover:underline font-medium">{clientNom}</Link>
            </div>
            <div>
              <span className="text-slate-500">Dossier: </span>
              <Link href={`/dossiers/${facture.dossier.id}`} className="text-blue-600 hover:underline">{facture.dossier.reference}</Link>
            </div>
            <div>
              <span className="text-slate-500">Émission: </span>
              <span>{formatDate(facture.dateEmission)}</span>
            </div>
            <div>
              <span className="text-slate-500">Échéance: </span>
              <span className={isOverdue ? "text-red-600 font-medium" : ""}>{formatDate(facture.dateEcheance)}</span>
            </div>
          </div>
        </div>

        {/* Montants */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 text-sm mb-3">Récapitulatif financier</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Montant HT</span>
              <span>{formatMontant(facture.montantHT)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">TVA ({facture.tva}%)</span>
              <span>{formatMontant(facture.montantTTC - facture.montantHT)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-slate-100 pt-2">
              <span>Total TTC</span>
              <span>{formatMontant(facture.montantTTC)}</span>
            </div>
            <div className="flex justify-between text-green-600 font-medium">
              <span>Payé</span>
              <span>{formatMontant(totalPaye)}</span>
            </div>
            {resteAPayer > 0.01 && (
              <div className={`flex justify-between font-bold ${isOverdue ? "text-red-600" : "text-amber-600"}`}>
                <span>Reste à payer</span>
                <span>{formatMontant(resteAPayer)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lignes de prestation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h3 className="font-semibold text-slate-700 text-sm mb-4">Détail des prestations</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 text-slate-500 font-medium">Description</th>
              <th className="text-right py-2 text-slate-500 font-medium">Qté</th>
              <th className="text-right py-2 text-slate-500 font-medium">Prix unitaire</th>
              <th className="text-right py-2 text-slate-500 font-medium">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {facture.lignes.map((ligne) => (
              <tr key={ligne.id}>
                <td className="py-3 text-slate-800">{ligne.description}</td>
                <td className="py-3 text-right text-slate-600">{ligne.quantite}</td>
                <td className="py-3 text-right text-slate-600">{formatMontant(ligne.prixUnitaire)}</td>
                <td className="py-3 text-right font-medium text-slate-900">{formatMontant(ligne.montant)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paiements */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-700 text-sm mb-4">Paiements reçus</h3>
        {facture.paiements.length === 0 ? (
          <p className="text-slate-400 text-sm mb-4">Aucun paiement enregistré</p>
        ) : (
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 text-slate-500 font-medium">Date</th>
                <th className="text-left py-2 text-slate-500 font-medium">Mode</th>
                <th className="text-left py-2 text-slate-500 font-medium">Référence</th>
                <th className="text-right py-2 text-slate-500 font-medium">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {facture.paiements.map((p) => (
                <tr key={p.id}>
                  <td className="py-2">{formatDate(p.date)}</td>
                  <td className="py-2">{modePaiementLabel[p.mode] || p.mode}</td>
                  <td className="py-2 text-slate-500">{p.reference || "—"}</td>
                  <td className="py-2 text-right font-medium text-green-600">{formatMontant(p.montant)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {facture.statut !== "payee" && facture.statut !== "annulee" && (
          <AddPaiementForm factureId={facture.id} resteAPayer={resteAPayer} />
        )}
      </div>
    </div>
  );
}
