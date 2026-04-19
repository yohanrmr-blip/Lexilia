import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/utils";

export async function GET() {
  const dossiers = await prisma.dossier.findMany({
    include: {
      client: true,
      _count: { select: { factures: true, honoraires: true, notes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(dossiers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const count = await prisma.dossier.count();
  const reference = body.reference || generateReference("DOS", count);
  const dossier = await prisma.dossier.create({
    data: { ...body, reference },
    include: { client: true },
  });
  return NextResponse.json(dossier, { status: 201 });
}
