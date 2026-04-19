import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Clock, FileText } from "lucide-react";
import { formatDate, formatMontant, TYPES_DOSSIER } from "@/lib/utils";
import AddHonoraireForm from "./AddHonoraireForm";
import AddNoteForm from "./AddNoteForm";

export default async function DossierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dossier = await prisma.dossier.findUnique({
    where: { id },
    include: {
      client: true,
      honoraires: { orderBy: { date: "desc" } },
      factures: {
        include: { lignes: true, paiements: true },
        orderBy: { createdAt: "desc" },
      },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!dossier) notFound();

  const typeLabel = TYPES_DOSSIER.find((t) => t.value === dossier.type)?.label || dossier.type;
  const totalHonoraires = dossier.honoraires.reduce((s, h) => s + h.montant, 0);
  const totalFacture = dossier.factures.reduce((s, f) => s + f.montantTTC, 0);
  const totalEncaisse = dossier.factures.reduce(
    (s, f) => s + f.paiements.reduce((sp, p) => sp + p.montant, 0),
    0
  );

  const statutColors: Record<string, string> = {
    ouvert: "bg-blue-100 text-blue-700",
    en_cours: "bg-amber-100 text-amber-700",
    cloture: "bg-green-100 text-green-700",
    archive: "bg-slate-100 text-slate-600",
  };

  const statutLabels: Record<string, string> = {
    ouvert: "Ouvert", en_cours: "En cours", cloture: "Clôturé", archive: "Archivé",
  };

  return (
    <div className="p-8">
      <Link href="/dossiers" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Retour aux dossiers
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm text-slate-500">{dossier.reference}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statutColors[dossier.statut]}`}>
              {statutLabels[dossier.statut]}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{dossier.titre}</h2>
          <Link href={`/clients/${dossier.client.id}`} className="text-blue-600 hover:underline text-sm mt-1 inline-block">
            {dossier.client.nom} {dossier.client.prenom}
          </Link>
          <span className="text-slate-400 text-sm mx-2">·</span>
          <span className="text-sm text-slate-500">{typeLabel}</span>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/factures/nouvelle?dossierId=${dossier.id}`}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </Link>
          <Link
            href={`/dossiers/${dossier.id}/modifier`}
            className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium text-sm"
          >
            Modifier
          </Link>
        </div>
      </div>

      {/* Stats financières */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Honoraires enregistrés", value: formatMontant(totalHonoraires), icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "Total facturé TTC", value: formatMontant(totalFacture), icon: FileText, color: "text-blue-600 bg-blue-50" },
          { label: "Encaissé", value: formatMontant(totalEncaisse), icon: FileText, color: "text-green-600 bg-green-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {dossier.description && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h3 className="font-semibold text-slate-700 mb-2 text-sm">Description</h3>
          <p className="text-slate-600 text-sm whitespace-pre-line">{dossier.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Honoraires */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Suivi du temps</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {dossier.honoraires.map((h) => (
              <div key={h.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{h.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(h.date)} · {h.heures}h × {formatMontant(h.tauxHoraire)}/h
                    </p>
                  </div>
                  <span className="font-semibold text-sm text-slate-900">{formatMontant(h.montant)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100">
            <AddHonoraireForm dossierId={dossier.id} />
          </div>
        </div>

        {/* Factures */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Factures</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {dossier.factures.length === 0 ? (
              <p className="p-4 text-slate-400 text-sm text-center">Aucune facture</p>
            ) : (
              dossier.factures.map((f) => {
                const paye = f.paiements.reduce((s, p) => s + p.montant, 0);
                return (
                  <Link key={f.id} href={`/factures/${f.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{f.numero}</p>
                      <p className="text-xs text-slate-500">{formatDate(f.dateEmission)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatMontant(f.montantTTC)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        f.statut === "payee" ? "bg-green-100 text-green-700"
                        : f.statut === "envoyee" ? "bg-blue-100 text-blue-700"
                        : f.statut === "annulee" ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600"
                      }`}>
                        {f.statut === "payee" ? "Payée" : f.statut === "envoyee" ? `Dû: ${formatMontant(f.montantTTC - paye)}` : f.statut === "annulee" ? "Annulée" : "Brouillon"}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Notes & observations</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
            {dossier.notes.map((note) => (
              <div key={note.id} className="p-4">
                <p className="text-sm text-slate-700 whitespace-pre-line">{note.contenu}</p>
                <p className="text-xs text-slate-400 mt-1">{formatDate(note.createdAt)}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100">
            <AddNoteForm dossierId={dossier.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
