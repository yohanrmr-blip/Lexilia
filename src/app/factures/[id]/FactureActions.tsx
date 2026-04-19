"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  factureId: string;
  statut: string;
  dossierId: string;
}

export default function FactureActions({ factureId, statut, dossierId }: Props) {
  const router = useRouter();

  async function updateStatut(newStatut: string) {
    await fetch(`/api/factures/${factureId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: newStatut }),
    });
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Supprimer cette facture ?")) return;
    await fetch(`/api/factures/${factureId}`, { method: "DELETE" });
    router.push("/factures");
  }

  return (
    <div className="flex gap-2">
      {statut === "brouillon" && (
        <button
          onClick={() => updateStatut("envoyee")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          Marquer comme envoyée
        </button>
      )}
      {statut === "envoyee" && (
        <button
          onClick={() => updateStatut("payee")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm"
        >
          Marquer comme payée
        </button>
      )}
      <Link
        href={`/dossiers/${dossierId}`}
        className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium text-sm"
      >
        Voir le dossier
      </Link>
      {statut !== "payee" && (
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700 px-3 py-2 text-sm font-medium"
        >
          Supprimer
        </button>
      )}
    </div>
  );
}
