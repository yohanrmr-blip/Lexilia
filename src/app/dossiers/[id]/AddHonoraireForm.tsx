"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function AddHonoraireForm({ dossierId }: { dossierId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    await fetch("/api/honoraires", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, dossierId, heures: Number(data.heures), tauxHoraire: Number(data.tauxHoraire) }),
    });
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
        <Plus className="w-4 h-4" />
        Ajouter du temps
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="description" required placeholder="Description de la prestation" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div className="grid grid-cols-3 gap-2">
        <input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input name="heures" type="number" step="0.25" min="0.25" required placeholder="Heures" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input name="tauxHoraire" type="number" min="0" required placeholder="Taux €/h" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
          {loading ? "..." : "Ajouter"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-500 hover:text-slate-700 px-2">
          Annuler
        </button>
      </div>
    </form>
  );
}
