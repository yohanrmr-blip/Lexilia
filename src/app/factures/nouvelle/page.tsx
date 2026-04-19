"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface Dossier {
  id: string;
  titre: string;
  reference: string;
  client: { nom: string; prenom?: string; societe?: string; type: string };
}

interface Ligne {
  description: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

function NouvelleFactureForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [lignes, setLignes] = useState<Ligne[]>([
    { description: "", quantite: 1, prixUnitaire: 0, montant: 0 },
  ]);
  const [tva, setTva] = useState(20);

  useEffect(() => {
    fetch("/api/dossiers").then((r) => r.json()).then(setDossiers);
  }, []);

  const preselectedDossierId = searchParams.get("dossierId") || "";

  function updateLigne(index: number, field: keyof Ligne, value: string | number) {
    setLignes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "quantite" || field === "prixUnitaire") {
        updated[index].montant = updated[index].quantite * updated[index].prixUnitaire;
      }
      return updated;
    });
  }

  const montantHT = lignes.reduce((s, l) => s + l.montant, 0);
  const montantTVA = montantHT * (tva / 100);
  const montantTTC = montantHT + montantTVA;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = {
      dossierId: form.get("dossierId"),
      dateEcheance: form.get("dateEcheance"),
      tva,
      montantHT,
      montantTTC,
      statut: form.get("statut"),
      lignes: lignes.filter((l) => l.description),
    };

    const res = await fetch("/api/factures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const facture = await res.json();
      router.push(`/factures/${facture.id}`);
    }
    setLoading(false);
  }

  const defaultEcheance = new Date();
  defaultEcheance.setDate(defaultEcheance.getDate() + 30);

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/factures" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Retour aux factures
      </Link>

      <h2 className="text-2xl font-bold text-slate-900 mb-6">Nouvelle facture</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dossier *</label>
              <select name="dossierId" required defaultValue={preselectedDossierId} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Sélectionner un dossier...</option>
                {dossiers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.reference} - {d.titre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select name="statut" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="brouillon">Brouillon</option>
                <option value="envoyee">Envoyée</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date d&apos;échéance *</label>
              <input name="dateEcheance" type="date" required defaultValue={defaultEcheance.toISOString().split("T")[0]} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">TVA (%)</label>
              <input type="number" value={tva} onChange={(e) => setTva(Number(e.target.value))} min="0" max="100" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Lignes de facturation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Prestations</h3>
          <div className="space-y-3">
            {lignes.map((ligne, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <input
                    placeholder="Description"
                    value={ligne.description}
                    onChange={(e) => updateLigne(i, "description", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Qté"
                    min="0"
                    step="0.01"
                    value={ligne.quantite}
                    onChange={(e) => updateLigne(i, "quantite", Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Prix €"
                    min="0"
                    step="0.01"
                    value={ligne.prixUnitaire}
                    onChange={(e) => updateLigne(i, "prixUnitaire", Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-medium text-slate-700">
                    {ligne.montant.toFixed(2)} €
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  {lignes.length > 1 && (
                    <button type="button" onClick={() => setLignes((prev) => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLignes((prev) => [...prev, { description: "", quantite: 1, prixUnitaire: 0, montant: 0 }])}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
          >
            <Plus className="w-4 h-4" />
            Ajouter une ligne
          </button>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 max-w-xs ml-auto text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total HT</span>
              <span className="font-medium">{montantHT.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">TVA ({tva}%)</span>
              <span className="font-medium">{montantTVA.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2">
              <span>Total TTC</span>
              <span>{montantTTC.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-60">
            {loading ? "Création..." : "Créer la facture"}
          </button>
          <Link href="/factures" className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NouvelleFacturePage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Chargement...</div>}>
      <NouvelleFactureForm />
    </Suspense>
  );
}
