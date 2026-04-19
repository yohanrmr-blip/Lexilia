"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MODES_PAIEMENT } from "@/lib/utils";
import { Plus } from "lucide-react";

interface Props {
  factureId: string;
  resteAPayer: number;
}

export default function AddPaiementForm({ factureId, resteAPayer }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    await fetch("/api/paiements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, factureId, montant: Number(data.montant) }),
    });
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
        <Plus className="w-4 h-4" />
        Enregistrer un paiement
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-slate-50 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-slate-700">Nouveau paiement</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
          <input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Montant *</label>
          <input name="montant" type="number" step="0.01" min="0.01" required defaultValue={resteAPayer.toFixed(2)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Mode de paiement *</label>
          <select name="mode" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {MODES_PAIEMENT.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Référence</label>
          <input name="reference" placeholder="N° chèque, virement..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60">
          {loading ? "..." : "Enregistrer"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-500 hover:text-slate-700 px-2">
          Annuler
        </button>
      </div>
    </form>
  );
}
