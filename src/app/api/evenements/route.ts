import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mois = searchParams.get("mois");
  const annee = searchParams.get("annee");

  const where: Record<string, unknown> = {};
  if (mois && annee) {
    const debut = new Date(Number(annee), Number(mois) - 1, 1);
    const fin = new Date(Number(annee), Number(mois), 0, 23, 59, 59);
    where.debut = { gte: debut, lte: fin };
  }

  const evenements = await prisma.evenement.findMany({
    where,
    include: { dossier: true, client: true },
    orderBy: { debut: "asc" },
  });
  return NextResponse.json(evenements);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const evenement = await prisma.evenement.create({
    data: {
      ...body,
      debut: new Date(body.debut),
      fin: body.fin ? new Date(body.fin) : undefined,
    },
    include: { dossier: true, client: true },
  });
  return NextResponse.json(evenement, { status: 201 });
}
