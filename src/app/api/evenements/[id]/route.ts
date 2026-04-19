import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const evenement = await prisma.evenement.update({
    where: { id },
    data: {
      ...body,
      debut: body.debut ? new Date(body.debut) : undefined,
      fin: body.fin ? new Date(body.fin) : null,
    },
    include: { dossier: true, client: true },
  });
  return NextResponse.json(evenement);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.evenement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
