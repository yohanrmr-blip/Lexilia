import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dossier = await prisma.dossier.findUnique({
    where: { id },
    include: {
      client: true,
      honoraires: { orderBy: { date: "desc" } },
      factures: {
        include: { lignes: true, paiements: true },
        orderBy: { createdAt: "desc" },
      },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!dossier) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(dossier);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const dossier = await prisma.dossier.update({
    where: { id },
    data: body,
    include: { client: true },
  });
  return NextResponse.json(dossier);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.dossier.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
