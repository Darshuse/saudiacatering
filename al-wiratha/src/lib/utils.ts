import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * التاريخ الهجري والميلادي معاً — «١ شعبان ١٤٤٦هـ (31 يناير 2025م)».
 * الهجري لغة المواعيد الشرعية، والميلادي يمنع اللبس في الإدخال والعقود.
 */
export function formatDateDual(date: string | Date): string {
  const d = new Date(date);
  const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
  const gregorian = new Intl.DateTimeFormat("ar-EG-u-ca-gregory-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
  return `${hijri}هـ (${gregorian}م)`;
}

export function estateTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    APARTMENT: "شقة",
    VILLA: "فيلا",
    LAND: "أرض",
    COMMERCIAL: "تجاري",
    FARM: "مزرعة",
    OTHER: "أخرى",
  };
  return labels[type] ?? type;
}

export function estateStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "نشط",
    SOLD: "مُباع",
    DISPUTED: "متنازع عليه",
    ARCHIVED: "مؤرشف",
  };
  return labels[status] ?? status;
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

export function fractionToDecimal(num: number, den: number): number {
  return num / den;
}
