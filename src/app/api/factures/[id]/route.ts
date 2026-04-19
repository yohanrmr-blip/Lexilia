import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const facture = await prisma.facture.findUnique({
    where: { id },
    include: {
      dossier: { include: { client: true } },
      lignes: true,
      paiements: true,
    },
  });
  if (!facture) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(facture);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { lignes, ...factureData } = body;

  if (lignes) {
    await prisma.ligneFacture.deleteMany({ where: { factureId: id } });
  }

  const facture = await prisma.facture.update({
    where: { id },
    data: {
      ...factureData,
      lignes: lignes ? { create: lignes } : undefined,
    },
    include: { lignes: true, dossier: { include: { client: true } }, paiements: true },
  });
  return NextResponse.json(facture);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.facture.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
