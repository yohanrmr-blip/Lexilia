"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TYPES_DOSSIER } from "@/lib/utils";
import { Suspense } from "react";

interface Client {
  id: string;
  nom: string;
  prenom?: string;
  societe?: string;
  type: string;
}

function NouveauDossierForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
  }, []);

  const preselectedClientId = searchParams.get("clientId") || "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    const res = await fetch("/api/dossiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const dossier = await res.json();
      router.push(`/dossiers/${dossier.id}`);
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/dossiers" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Retour aux dossiers
      </Link>

      <h2 className="text-2xl font-bold text-slate-900 mb-6">Nouveau dossier</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
          <select
            name="clientId"
            required
            defaultValue={preselectedClientId}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Sélectionner un client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.type === "entreprise" ? c.societe : `${c.nom} ${c.prenom || ""}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Titre du dossier *</label>
          <input name="titre" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Litige commercial Dupont vs Martin" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Type de dossier *</label>
          <select name="type" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Sélectionner...</option>
            {TYPES_DOSSIER.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
          <select name="statut" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="ouvert">Ouvert</option>
            <option value="en_cours">En cours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea name="description" rows={4} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Description du dossier..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-60">
            {loading ? "Création..." : "Créer le dossier"}
          </button>
          <Link href="/dossiers" className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NouveauDossierPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Chargement...</div>}>
      <NouveauDossierForm />
    </Suspense>
  );
}
