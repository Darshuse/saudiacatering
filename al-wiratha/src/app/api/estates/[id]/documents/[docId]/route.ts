import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireEstateMember, requireEstateAdmin } from "@/lib/authz";
import { logActivity } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { uploadsDir } from "@/lib/storage";
import path from "path";
import fs from "fs/promises";

/** GET — stream the file to any estate member. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId, docId } = await params;
  const access = await requireEstateMember(estateId, session.userId);
  if (access instanceof NextResponse) return access;

  const doc = await prisma.document.findUnique({ where: { id: docId } });
  if (!doc || doc.estateId !== estateId) {
    return NextResponse.json({ error: "المستند غير موجود" }, { status: 404 });
  }

  try {
    const buf = await fs.readFile(path.join(uploadsDir(), doc.fileName));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(doc.name)}`,
        "Cache-Control": "private, max-age=0",
      },
    });
  } catch {
    return NextResponse.json({ error: "تعذر قراءة الملف" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId, docId } = await params;
  const access = await requireEstateAdmin(estateId, session.userId);
  if (access instanceof NextResponse) return access;

  const doc = await prisma.document.findUnique({ where: { id: docId } });
  if (!doc || doc.estateId !== estateId) {
    return NextResponse.json({ error: "المستند غير موجود" }, { status: 404 });
  }

  await prisma.document.delete({ where: { id: docId } });
  await fs.unlink(path.join(uploadsDir(), doc.fileName)).catch(() => {});
  logActivity(estateId, session.userId, "document_deleted", doc.name);
  return NextResponse.json({ success: true });
}
