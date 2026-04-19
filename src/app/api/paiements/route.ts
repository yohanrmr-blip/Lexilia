import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const paiement = await prisma.paiement.create({
    data: { ...body, date: new Date(body.date) },
  });

  const facture = await prisma.facture.findUnique({
    where: { id: body.factureId },
    include: { paiements: true },
  });

  if (facture) {
    const totalPaye = facture.paiements.reduce((s, p) => s + p.montant, 0);
    if (totalPaye >= facture.montantTTC) {
      await prisma.facture.update({
        where: { id: body.factureId },
        data: { statut: "payee" },
      });
    }
  }

  return NextResponse.json(paiement, { status: 201 });
}
