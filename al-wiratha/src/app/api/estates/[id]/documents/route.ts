import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireEstateMember, requireEstateAdmin } from "@/lib/authz";
import { logActivity } from "@/lib/audit";
import { uploadsDir } from "@/lib/storage";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId } = await params;
  const access = await requireEstateMember(estateId, session.userId);
  if (access instanceof NextResponse) return access;

  const documents = await prisma.document.findMany({
    where: { estateId },
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ documents });
}

/** POST multipart/form-data { file, name } — admin uploads deeds/contracts/receipts. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId } = await params;
  const access = await requireEstateAdmin(estateId, session.userId);
  if (access instanceof NextResponse) return access;

  try {
    const form = await req.formData();
    const file = form.get("file");
    const name = String(form.get("name") ?? "").trim();

    if (!(file instanceof File)) return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 });
    if (!name || name.length < 2) return NextResponse.json({ error: "اسم المستند مطلوب" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "الحد الأقصى لحجم الملف 10MB" }, { status: 400 });
    const ext = ALLOWED_TYPES[file.type];
    if (!ext) return NextResponse.json({ error: "الأنواع المسموحة: PDF أو JPG أو PNG" }, { status: 400 });

    const fileName = `${estateId}-${crypto.randomBytes(16).toString("hex")}${ext}`;
    const dir = uploadsDir();
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));

    const doc = await prisma.document.create({
      data: {
        estateId,
        name,
        fileName,
        mimeType: file.type,
        size: file.size,
        uploadedById: session.userId,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    logActivity(estateId, session.userId, "document_uploaded", name);
    return NextResponse.json({ document: doc }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل رفع الملف" }, { status: 500 });
  }
}
