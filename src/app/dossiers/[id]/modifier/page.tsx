"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { TYPES_DOSSIER } from "@/lib/utils";

export default function ModifierDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<Record<string, string> | null>(null);
  const [id, setId] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/dossiers/${id}`).then((r) => r.json()).then(setDossier);
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    const res = await fetch(`/api/dossiers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) router.push(`/dossiers/${id}`);
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce dossier ? Cette action est irréversible.")) return;
    await fetch(`/api/dossiers/${id}`, { method: "DELETE" });
    router.push("/dossiers");
  }

  if (!dossier) return <div className="p-8 text-slate-500">Chargement...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <Link href={`/dossiers/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Retour au dossier
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Modifier le dossier</h2>
        <button onClick={handleDelete} className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium">
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
          <input name="titre" required defaultValue={dossier.titre} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
          <select name="type" required defaultValue={dossier.type} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {TYPES_DOSSIER.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
          <select name="statut" defaultValue={dossier.statut} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="ouvert">Ouvert</option>
            <option value="en_cours">En cours</option>
            <option value="cloture">Clôturé</option>
            <option value="archive">Archivé</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea name="description" rows={4} defaultValue={dossier.description || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-60">
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
          <Link href={`/dossiers/${id}`} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
