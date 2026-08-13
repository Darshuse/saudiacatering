import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export type EstateAccess = {
  estate: { id: string; adminId: string };
  isAdmin: boolean;
  /** The caller's heir share, if they have one (null for a share-less admin). */
  heirShare: { id: string; sharePercentage: number } | null;
};

/**
 * Allows the estate admin or any heir with a share.
 * Returns a ready 404 NextResponse for non-members (not 403) so estate
 * existence is not leaked to outsiders.
 */
export async function requireEstateMember(
  estateId: string,
  userId: string
): Promise<EstateAccess | NextResponse> {
  const estate = await prisma.estate.findUnique({
    where: { id: estateId },
    select: {
      id: true,
      adminId: true,
      heirShares: { where: { userId }, select: { id: true, sharePercentage: true } },
    },
  });
  if (!estate) {
    return NextResponse.json({ error: "العقار غير موجود" }, { status: 404 });
  }
  const isAdmin = estate.adminId === userId;
  const heirShare = estate.heirShares[0] ?? null;
  if (!isAdmin && !heirShare) {
    return NextResponse.json({ error: "العقار غير موجود" }, { status: 404 });
  }
  return { estate: { id: estate.id, adminId: estate.adminId }, isAdmin, heirShare };
}

/** Allows the estate admin only. Members get 403, outsiders get 404. */
export async function requireEstateAdmin(
  estateId: string,
  userId: string
): Promise<EstateAccess | NextResponse> {
  const access = await requireEstateMember(estateId, userId);
  if (access instanceof NextResponse) return access;
  if (!access.isAdmin) {
    return NextResponse.json(
      { error: "غير مصرح — هذه العملية لمدير العقار فقط" },
      { status: 403 }
    );
  }
  return access;
}
