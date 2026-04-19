"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NouveauClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("particulier");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const client = await res.json();
      router.push(`/clients/${client.id}`);
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/clients" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Retour aux clients
      </Link>

      <h2 className="text-2xl font-bold text-slate-900 mb-6">Nouveau client</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Type de client</label>
          <div className="flex gap-4">
            {["particulier", "entreprise"].map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={type === t}
                  onChange={() => setType(t)}
                  className="text-blue-600"
                />
                <span className="text-sm capitalize">{t === "particulier" ? "Particulier" : "Entreprise"}</span>
              </label>
            ))}
          </div>
        </div>

        {type === "entreprise" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Raison sociale *</label>
            <input name="societe" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
            <input name="nom" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
            <input name="prenom" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input name="email" type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
          <input name="telephone" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
          <textarea name="adresse" rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {type === "entreprise" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SIRET</label>
            <input name="siret" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-60"
          >
            {loading ? "Enregistrement..." : "Créer le client"}
          </button>
          <Link href="/clients" className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
