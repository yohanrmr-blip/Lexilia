export function formatMontant(montant: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(montant);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function generateReference(prefix: string, count: number): string {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
}

export const STATUTS_DOSSIER = {
  ouvert: { label: "Ouvert", color: "bg-blue-100 text-blue-800" },
  en_cours: { label: "En cours", color: "bg-yellow-100 text-yellow-800" },
  cloture: { label: "Clôturé", color: "bg-green-100 text-green-800" },
  archive: { label: "Archivé", color: "bg-gray-100 text-gray-800" },
} as const;

export const TYPES_DOSSIER = [
  { value: "civil", label: "Droit civil" },
  { value: "penal", label: "Droit pénal" },
  { value: "commercial", label: "Droit commercial" },
  { value: "famille", label: "Droit de la famille" },
  { value: "immobilier", label: "Droit immobilier" },
  { value: "travail", label: "Droit du travail" },
  { value: "autre", label: "Autre" },
];

export const STATUTS_FACTURE = {
  brouillon: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
  envoyee: { label: "Envoyée", color: "bg-blue-100 text-blue-800" },
  payee: { label: "Payée", color: "bg-green-100 text-green-800" },
  annulee: { label: "Annulée", color: "bg-red-100 text-red-800" },
} as const;

export const MODES_PAIEMENT = [
  { value: "virement", label: "Virement bancaire" },
  { value: "cheque", label: "Chèque" },
  { value: "especes", label: "Espèces" },
  { value: "carte", label: "Carte bancaire" },
];
