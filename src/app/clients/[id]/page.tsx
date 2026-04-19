import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Mail, Phone, MapPin, Building2, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      dossiers: {
        include: { _count: { select: { factures: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) notFound();

  const nomAffiche =
    client.type === "entreprise"
      ? client.societe || `${client.nom} ${client.prenom || ""}`
      : `${client.nom} ${client.prenom || ""}`;

  return (
    <div className="p-8">
      <Link href="/clients" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Retour aux clients
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            {client.type === "entreprise" ? (
              <Building2 className="w-7 h-7 text-blue-600" />
            ) : (
              <User className="w-7 h-7 text-blue-600" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{nomAffiche}</h2>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              client.type === "entreprise" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
            }`}>
              {client.type === "entreprise" ? "Entreprise" : "Particulier"}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dossiers/nouveau?clientId=${client.id}`}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouveau dossier
          </Link>
          <Link
            href={`/clients/${client.id}/modifier`}
            className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium text-sm"
          >
            Modifier
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Informations</h3>
          <div className="space-y-3">
            {client.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">{client.email}</a>
              </div>
            )}
            {client.telephone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">{client.telephone}</span>
              </div>
            )}
            {client.adresse && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <span className="text-slate-700 whitespace-pre-line">{client.adresse}</span>
              </div>
            )}
            {client.siret && (
              <div className="text-sm">
                <span className="text-slate-500">SIRET: </span>
                <span className="text-slate-700">{client.siret}</span>
              </div>
            )}
            <div className="text-sm pt-2 border-t border-slate-100">
              <span className="text-slate-500">Client depuis: </span>
              <span className="text-slate-700">{formatDate(client.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">
              Dossiers ({client.dossiers.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {client.dossiers.length === 0 ? (
              <p className="p-6 text-slate-400 text-sm text-center">Aucun dossier</p>
            ) : (
              client.dossiers.map((dossier) => (
                <Link
                  key={dossier.id}
                  href={`/dossiers/${dossier.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{dossier.titre}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {dossier.reference} · Ouvert le {formatDate(dossier.dateOuverture)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{dossier._count.factures} facture(s)</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      dossier.statut === "ouvert" ? "bg-blue-100 text-blue-700"
                      : dossier.statut === "en_cours" ? "bg-amber-100 text-amber-700"
                      : dossier.statut === "cloture" ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                    }`}>
                      {dossier.statut === "ouvert" ? "Ouvert"
                        : dossier.statut === "en_cours" ? "En cours"
                        : dossier.statut === "cloture" ? "Clôturé"
                        : "Archivé"}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
