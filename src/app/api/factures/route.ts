import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/utils";

export async function GET() {
  const factures = await prisma.facture.findMany({
    include: {
      dossier: { include: { client: true } },
      lignes: true,
      paiements: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(factures);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const count = await prisma.facture.count();
  const numero = body.numero || generateReference("FAC", count);
  const { lignes, ...factureData } = body;

  const facture = await prisma.facture.create({
    data: {
      ...factureData,
      numero,
      lignes: lignes ? { create: lignes } : undefined,
    },
    include: { lignes: true, dossier: { include: { client: true } } },
  });
  return NextResponse.json(facture, { status: 201 });
}
