import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const montant = body.heures * body.tauxHoraire;
  const honoraire = await prisma.honoraire.create({
    data: { ...body, montant, date: new Date(body.date) },
  });
  return NextResponse.json(honoraire, { status: 201 });
}
