import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, User, Building2 } from "lucide-react";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: { _count: { select: { dossiers: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clients</h2>
          <p className="text-slate-500 mt-1">{clients.length} client(s) enregistré(s)</p>
        </div>
        <Link
          href="/clients/nouveau"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Nouveau client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">Aucun client</p>
          <p className="text-slate-400 mt-1 mb-6">Commencez par ajouter votre premier client</p>
          <Link
            href="/clients/nouveau"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nouveau client
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Client</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Dossiers</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        {client.type === "entreprise" ? (
                          <Building2 className="w-4 h-4 text-blue-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {client.type === "entreprise" ? client.societe : `${client.nom} ${client.prenom || ""}`}
                        </p>
                        {client.type === "entreprise" && (
                          <p className="text-xs text-slate-500">{client.nom} {client.prenom}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      client.type === "entreprise"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {client.type === "entreprise" ? "Entreprise" : "Particulier"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{client.email || "—"}</p>
                    <p className="text-xs text-slate-400">{client.telephone || ""}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-700">
                      {client._count.dossiers}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
