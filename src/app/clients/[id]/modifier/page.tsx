"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function ModifierClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [client, setClient] = useState<Record<string, string> | null>(null);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/clients/${id}`)
        .then((r) => r.json())
        .then(setClient);
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    const res = await fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) router.push(`/clients/${id}`);
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce client ? Tous ses dossiers seront également supprimés.")) return;
    setDeleting(true);
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    router.push("/clients");
  }

  if (!client) return <div className="p-8 text-slate-500">Chargement...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <Link href={`/clients/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Retour au client
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Modifier le client</h2>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
          <div className="flex gap-4">
            {["particulier", "entreprise"].map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value={t} defaultChecked={client.type === t} className="text-blue-600" />
                <span className="text-sm">{t === "particulier" ? "Particulier" : "Entreprise"}</span>
              </label>
            ))}
          </div>
        </div>

        {client.type === "entreprise" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Raison sociale</label>
            <input name="societe" defaultValue={client.societe || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
            <input name="nom" required defaultValue={client.nom || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
            <input name="prenom" defaultValue={client.prenom || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input name="email" type="email" defaultValue={client.email || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
          <input name="telephone" defaultValue={client.telephone || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
          <textarea name="adresse" rows={3} defaultValue={client.adresse || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-60">
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
          <Link href={`/clients/${id}`} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
