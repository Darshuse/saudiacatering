import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: path.join(process.cwd(), "dev.db") });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 بدء زراعة البيانات التجريبية...");

  // Create users
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@wiratha.com" },
    update: {},
    create: { name: "محمد أحمد العبدالله", email: "admin@wiratha.com", password, phone: "0501234567", nationalId: "1234567890", role: "ADMIN" },
  });

  const heir1 = await prisma.user.upsert({
    where: { email: "fatima@wiratha.com" },
    update: {},
    create: { name: "فاطمة أحمد العبدالله", email: "fatima@wiratha.com", password, phone: "0507654321", role: "HEIR" },
  });

  const heir2 = await prisma.user.upsert({
    where: { email: "abdullah@wiratha.com" },
    update: {},
    create: { name: "عبدالله أحمد العبدالله", email: "abdullah@wiratha.com", password, role: "HEIR" },
  });

  const heir3 = await prisma.user.upsert({
    where: { email: "sara@wiratha.com" },
    update: {},
    create: { name: "سارة أحمد العبدالله", email: "sara@wiratha.com", password, role: "HEIR" },
  });

  // Create estate
  const estate = await prisma.estate.create({
    data: {
      name: "عمارة الوالد — حي النرجس",
      type: "APARTMENT",
      description: "عمارة سكنية تجارية مكونة من 6 طوابق",
      location: "الرياض، حي النرجس، شارع الأمير محمد",
      area: 800,
      value: 4500000,
      adminId: admin.id,
      status: "ACTIVE",
    },
  });

  // Add heir shares (Islamic inheritance — 4 siblings: 2 sons + 2 daughters)
  await prisma.heirShare.createMany({
    data: [
      { estateId: estate.id, userId: admin.id, shareNumerator: 2, shareDenominator: 6, sharePercentage: 33.33, relation: "ابن" },
      { estateId: estate.id, userId: heir1.id, shareNumerator: 1, shareDenominator: 6, sharePercentage: 16.67, relation: "بنت" },
      { estateId: estate.id, userId: heir2.id, shareNumerator: 2, shareDenominator: 6, sharePercentage: 33.33, relation: "ابن" },
      { estateId: estate.id, userId: heir3.id, shareNumerator: 1, shareDenominator: 6, sharePercentage: 16.67, relation: "بنت" },
    ],
  });

  // Add rental incomes — amounts in halalas (30,000 SAR = 3,000,000 halalas)
  // Exact fractions: 2/6 + 1/6 + 2/6 + 1/6 of 3,000,000 sums to the last halala.
  const income1 = await prisma.rentalIncome.create({
    data: {
      estateId: estate.id,
      amount: 3_000_000,
      period: "يناير 2025",
      date: new Date("2025-01-05"),
      description: "إيجار الطوابق السكنية",
      collectedById: admin.id,
      status: "DISTRIBUTED",
    },
  });

  await prisma.distribution.createMany({
    data: [
      { rentalIncomeId: income1.id, userId: admin.id, amount: 1_000_000, sharePercentage: 33.33, status: "PENDING" },
      { rentalIncomeId: income1.id, userId: heir1.id, amount: 500_000, sharePercentage: 16.67, status: "PAID", paidAt: new Date() },
      { rentalIncomeId: income1.id, userId: heir2.id, amount: 1_000_000, sharePercentage: 33.33, status: "PENDING" },
      { rentalIncomeId: income1.id, userId: heir3.id, amount: 500_000, sharePercentage: 16.67, status: "PAID", paidAt: new Date() },
    ],
  });

  // Add proposal
  const proposal = await prisma.proposal.create({
    data: {
      estateId: estate.id,
      title: "تجديد واجهة العمارة",
      description: "مقترح بتجديد واجهة العمارة الخارجية بتكلفة 120,000 ريال لرفع قيمة الإيجار",
      createdById: admin.id,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "OPEN",
    },
  });

  await prisma.vote.createMany({
    data: [
      { proposalId: proposal.id, userId: admin.id, choice: "YES", weight: 33.33, comment: "موافق — سيرفع الإيجار" },
      { proposalId: proposal.id, userId: heir2.id, choice: "YES", weight: 33.33 },
    ],
  });

  console.log("✅ تم زراعة البيانات بنجاح!");
  console.log("📧 بيانات الدخول التجريبية:");
  console.log("   admin@wiratha.com / password123");
  console.log("   fatima@wiratha.com / password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
