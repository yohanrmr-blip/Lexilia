"use client";
import { useEffect, useState } from "react";
import { Plus, FileSignature, Trash2, Edit2, X, Check } from "lucide-react";

interface Modele {
  id: string;
  nom: string;
  description?: string;
  categorie: string;
  contenu: string;
  createdAt: string;
}

const CATEGORIES = [
  { value: "convention", label: "Convention d'honoraires" },
  { value: "courrier", label: "Courrier" },
  { value: "conclusions", label: "Conclusions" },
  { value: "assignation", label: "Assignation" },
  { value: "contrat", label: "Contrat" },
  { value: "autre", label: "Autre" },
];

function catLabel(v: string) {
  return CATEGORIES.find((c) => c.value === v)?.label || v;
}

export default function ModelesPage() {
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [selected, setSelected] = useState<Modele | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  async function load() {
    const res = await fetch("/api/modeles");
    setModeles(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    const method = editMode && selected ? "PUT" : "POST";
    const url = editMode && selected ? `/api/modeles/${selected.id}` : "/api/modeles";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setShowForm(false);
    setEditMode(false);
    setSelected(null);
    setLoading(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce modèle ?")) return;
    await fetch(`/api/modeles/${id}`, { method: "DELETE" });
    setSelected(null);
    load();
  }

  const filtered = filterCat === "all" ? modeles : modeles.filter((m) => m.categorie === filterCat);

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="w-72 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-semibold text-slate-900">Modèles</h1>
            <button
              onClick={() => { setSelected(null); setEditMode(false); setShowForm(true); }}
              className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600"
          >
            <option value="all">Toutes les catégories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-auto divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="p-6 text-center">
              <FileSignature className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Aucun modèle</p>
            </div>
          ) : filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSelected(m); setShowForm(false); setEditMode(false); }}
              className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${selected?.id === m.id ? "bg-blue-50 border-r-2 border-blue-500" : ""}`}
            >
              <p className="text-sm font-medium text-slate-800 truncate">{m.nom}</p>
              <span className="text-xs text-slate-400">{catLabel(m.categorie)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-auto">
        {showForm ? (
          <form onSubmit={handleSubmit} className="flex-1 p-8 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editMode ? "Modifier le modèle" : "Nouveau modèle"}</h2>
              <button type="button" onClick={() => { setShowForm(false); setEditMode(false); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du modèle *</label>
                <input name="nom" required defaultValue={editMode ? selected?.nom : ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                <select name="categorie" defaultValue={editMode ? selected?.categorie : "autre"} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input name="description" defaultValue={editMode ? selected?.description || "" : ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contenu du modèle *</label>
                <p className="text-xs text-slate-400 mb-1">Utilisez {"{nom_client}"}, {"{reference_dossier}"}, {"{date}"} comme variables</p>
                <textarea name="contenu" required rows={16} defaultValue={editMode ? selected?.contenu : ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  <Check className="w-4 h-4" />
                  {loading ? "..." : editMode ? "Enregistrer" : "Créer le modèle"}
                </button>
              </div>
            </div>
          </form>
        ) : selected ? (
          <div className="flex-1 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {catLabel(selected.categorie)}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-3">{selected.nom}</h2>
                {selected.description && <p className="text-slate-500 text-sm mt-1">{selected.description}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditMode(true); setShowForm(true); }}
                  className="flex items-center gap-2 border border-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm hover:bg-slate-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="flex items-center gap-2 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
              <pre className="text-sm text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">{selected.contenu}</pre>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileSignature className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Sélectionnez un modèle</p>
              <p className="text-slate-300 text-sm mt-1">ou créez-en un nouveau</p>
              <button
                onClick={() => { setSelected(null); setEditMode(false); setShowForm(true); }}
                className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Nouveau modèle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
