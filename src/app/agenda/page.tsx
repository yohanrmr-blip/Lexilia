"use client";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Clock } from "lucide-react";
import { formatMontant } from "@/lib/utils";

void formatMontant;

interface Evenement {
  id: string;
  titre: string;
  description?: string;
  debut: string;
  fin?: string;
  type: string;
  lieu?: string;
  dossier?: { id: string; titre: string; reference: string };
  client?: { id: string; nom: string; prenom?: string };
}

interface Dossier { id: string; titre: string; reference: string }
interface Client { id: string; nom: string; prenom?: string; societe?: string; type: string }

const TYPES = [
  { value: "rdv", label: "Rendez-vous", color: "bg-blue-500", light: "bg-blue-50 text-blue-700" },
  { value: "audience", label: "Audience", color: "bg-red-500", light: "bg-red-50 text-red-700" },
  { value: "echeance", label: "Échéance", color: "bg-amber-500", light: "bg-amber-50 text-amber-700" },
  { value: "tache", label: "Tâche", color: "bg-purple-500", light: "bg-purple-50 text-purple-700" },
];

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS_NOMS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function getTypeStyle(type: string) {
  return TYPES.find((t) => t.value === type) || TYPES[0];
}

export default function AgendaPage() {
  const today = new Date();
  const [annee, setAnnee] = useState(today.getFullYear());
  const [mois, setMois] = useState(today.getMonth() + 1);
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEv, setSelectedEv] = useState<Evenement | null>(null);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvenements = useCallback(async () => {
    const res = await fetch(`/api/evenements?mois=${mois}&annee=${annee}`);
    setEvenements(await res.json());
  }, [mois, annee]);

  useEffect(() => { loadEvenements(); }, [loadEvenements]);
  useEffect(() => {
    fetch("/api/dossiers").then(r => r.json()).then(setDossiers);
    fetch("/api/clients").then(r => r.json()).then(setClients);
  }, []);

  function prevMois() {
    if (mois === 1) { setMois(12); setAnnee(a => a - 1); }
    else setMois(m => m - 1);
  }
  function nextMois() {
    if (mois === 12) { setMois(1); setAnnee(a => a + 1); }
    else setMois(m => m + 1);
  }

  // Build calendar grid
  const firstDay = new Date(annee, mois - 1, 1);
  const lastDay = new Date(annee, mois, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;
  const cells: (number | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const day = i - startOffset + 1;
    return day >= 1 && day <= lastDay.getDate() ? day : null;
  });

  function eventsForDay(day: number) {
    return evenements.filter(ev => {
      const d = new Date(ev.debut);
      return d.getFullYear() === annee && d.getMonth() + 1 === mois && d.getDate() === day;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    const method = selectedEv ? "PUT" : "POST";
    const url = selectedEv ? `/api/evenements/${selectedEv.id}` : "/api/evenements";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    setSelectedEv(null);
    setLoading(false);
    loadEvenements();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet événement ?")) return;
    await fetch(`/api/evenements/${id}`, { method: "DELETE" });
    setSelectedEv(null);
    loadEvenements();
  }

  const defaultDebut = selectedDate
    ? `${selectedDate}T09:00`
    : `${annee}-${String(mois).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}T09:00`;

  return (
    <div className="flex h-full">
      {/* Calendar main */}
      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900">
              {MOIS_NOMS[mois - 1]} {annee}
            </h1>
            <div className="flex items-center gap-1">
              <button onClick={prevMois} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMois} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => { setAnnee(today.getFullYear()); setMois(today.getMonth() + 1); }}
              className="text-xs text-blue-600 hover:underline"
            >
              Aujourd&apos;hui
            </button>
          </div>
          <button
            onClick={() => { setSelectedEv(null); setSelectedDate(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Grid header */}
        <div className="grid grid-cols-7 mb-1">
          {JOURS.map(j => (
            <div key={j} className="text-center text-xs font-semibold text-slate-400 py-2">{j}</div>
          ))}
        </div>

        {/* Grid cells */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
          {cells.map((day, i) => {
            const isToday = day === today.getDate() && mois === today.getMonth() + 1 && annee === today.getFullYear();
            const events = day ? eventsForDay(day) : [];
            const dateStr = day ? `${annee}-${String(mois).padStart(2,"0")}-${String(day).padStart(2,"0")}` : "";
            return (
              <div
                key={i}
                onClick={() => {
                  if (day) { setSelectedDate(dateStr); setSelectedEv(null); setShowForm(true); }
                }}
                className={`bg-white min-h-[100px] p-2 cursor-pointer hover:bg-blue-50/30 transition-colors ${!day ? "bg-slate-50 cursor-default" : ""}`}
              >
                {day && (
                  <>
                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday ? "bg-blue-600 text-white" : "text-slate-600"
                    }`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {events.slice(0, 3).map(ev => {
                        const t = getTypeStyle(ev.type);
                        return (
                          <div
                            key={ev.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedEv(ev); setShowForm(false); }}
                            className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer ${t.light} font-medium`}
                          >
                            {ev.titre}
                          </div>
                        );
                      })}
                      {events.length > 3 && (
                        <p className="text-xs text-slate-400 pl-1">+{events.length - 3}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel: event detail or form */}
      {(showForm || selectedEv) && (
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              {showForm ? (selectedEv ? "Modifier" : "Nouvel événement") : "Détail"}
            </h2>
            <button onClick={() => { setShowForm(false); setSelectedEv(null); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {showForm ? (
            <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Titre *</label>
                <input name="titre" required defaultValue={selectedEv?.titre} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                <select name="type" defaultValue={selectedEv?.type || "rdv"} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Début *</label>
                <input name="debut" type="datetime-local" required defaultValue={selectedEv ? new Date(selectedEv.debut).toISOString().slice(0,16) : defaultDebut} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fin</label>
                <input name="fin" type="datetime-local" defaultValue={selectedEv?.fin ? new Date(selectedEv.fin).toISOString().slice(0,16) : ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Lieu</label>
                <input name="lieu" defaultValue={selectedEv?.lieu || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Dossier lié</label>
                <select name="dossierId" defaultValue={selectedEv?.dossier?.id || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Aucun</option>
                  {dossiers.map(d => <option key={d.id} value={d.id}>{d.reference} – {d.titre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Client lié</label>
                <select name="clientId" defaultValue={selectedEv?.client?.id || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Aucun</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.type === "entreprise" ? c.societe : `${c.nom} ${c.prenom || ""}`}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea name="description" rows={3} defaultValue={selectedEv?.description || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  {loading ? "..." : selectedEv ? "Enregistrer" : "Créer"}
                </button>
                {selectedEv && (
                  <button type="button" onClick={() => handleDelete(selectedEv.id)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                    Supprimer
                  </button>
                )}
              </div>
            </form>
          ) : selectedEv ? (
            <div className="flex-1 p-5 space-y-4">
              <div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTypeStyle(selectedEv.type).light}`}>
                  {getTypeStyle(selectedEv.type).label}
                </span>
                <h3 className="font-semibold text-slate-900 mt-3 text-base">{selectedEv.titre}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                {new Date(selectedEv.debut).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
                {selectedEv.fin && <span className="text-slate-400">→ {new Date(selectedEv.fin).toLocaleTimeString("fr-FR", { timeStyle: "short" })}</span>}
              </div>
              {selectedEv.lieu && <p className="text-sm text-slate-600">📍 {selectedEv.lieu}</p>}
              {selectedEv.dossier && (
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <p className="text-xs text-slate-400 font-medium mb-1">DOSSIER</p>
                  <p className="text-slate-700 font-medium">{selectedEv.dossier.titre}</p>
                  <p className="text-slate-400 text-xs">{selectedEv.dossier.reference}</p>
                </div>
              )}
              {selectedEv.client && (
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <p className="text-xs text-slate-400 font-medium mb-1">CLIENT</p>
                  <p className="text-slate-700 font-medium">{selectedEv.client.nom} {selectedEv.client.prenom}</p>
                </div>
              )}
              {selectedEv.description && <p className="text-sm text-slate-600">{selectedEv.description}</p>}
              <button
                onClick={() => setShowForm(true)}
                className="w-full border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Modifier
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
