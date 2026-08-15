import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireEstateMember } from "@/lib/authz";
import { logActivity } from "@/lib/audit";
import { notifyUsers, estateMemberIds } from "@/lib/notify";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  deadline: z.string().refine((s) => {
    const d = Date.parse(s);
    return !isNaN(d) && d > Date.now();
  }, "موعد انتهاء التصويت يجب أن يكون تاريخاً صالحاً في المستقبل"),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId } = await params;
  const access = await requireEstateMember(estateId, session.userId);
  if (access instanceof NextResponse) return access;

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const proposal = await prisma.proposal.create({
      data: {
        estateId,
        title: data.title,
        description: data.description,
        deadline: new Date(data.deadline),
        createdById: session.userId,
        status: "OPEN",
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        votes: true,
      },
    });

    logActivity(estateId, session.userId, "proposal_created", data.title);
    estateMemberIds(estateId).then((ids) =>
      notifyUsers(ids, `🗳️ تصويت جديد: «${data.title}» — أدلِ بصوتك`, `/estates/${estateId}/votes`, session.userId)
    );

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? "خطأ في البيانات" }, { status: 400 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
