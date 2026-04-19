import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const note = await prisma.note.create({
    data: { contenu: body.contenu, dossierId: id },
  });
  return NextResponse.json(note, { status: 201 });
}
