/**
 * حاسبة المواريث الشرعية وفق المذاهب الأربعة
 * Islamic Inheritance Calculator — Hanafi, Maliki, Shafi'i, Hanbali
 *
 * مبني على علم الفرائض القرآنية والسنة النبوية
 */

export type Madhab = "HANAFI" | "MALIKI" | "SHAFII" | "HANBALI";
/** وضع الحساب: النظام السعودي (الافتراضي) أو أحد المذاهب الأربعة للمقارنة التعليمية */
export type CalcMode = "SAUDI" | Madhab;

export const MADHABS: { value: Madhab; label: string; description: string }[] = [
  {
    value: "HANAFI",
    label: "الحنفي",
    description: "مذهب الإمام أبي حنيفة النعمان — الأكثر انتشاراً في تركيا وآسيا الوسطى وباكستان",
  },
  {
    value: "MALIKI",
    label: "المالكي",
    description: "مذهب الإمام مالك بن أنس — الأكثر انتشاراً في شمال أفريقيا والخليج",
  },
  {
    value: "SHAFII",
    label: "الشافعي",
    description: "مذهب الإمام محمد بن إدريس الشافعي — الأكثر انتشاراً في مصر وجنوب شرق آسيا",
  },
  {
    value: "HANBALI",
    label: "الحنبلي",
    description: "مذهب الإمام أحمد بن حنبل — المعتمد في المملكة العربية السعودية",
  },
];

export interface HeirInput {
  husbands: number;     // زوج (0 أو 1)
  wives: number;        // زوجات (0-4)
  sons: number;         // أبناء
  daughters: number;    // بنات
  father: boolean;      // الأب
  mother: boolean;      // الأم
  grandfatherPaternal: boolean;  // الجد من الأب (أب الأب)
  grandmotherPaternal: boolean;  // الجدة من جهة الأب
  grandmotherMaternal: boolean;  // الجدة من جهة الأم
  fullBrothers: number; // الإخوة الأشقاء
  fullSisters: number;  // الأخوات الشقيقات
  halfBrothersPaternal: number;  // الإخوة لأب
  halfSistersPaternal: number;   // الأخوات لأب
  halfBrothersMaternal: number;  // الإخوة لأم
  halfSistersMaternal: number;   // الأخوات لأم
  sonsOfSon: number;    // أبناء الابن
  daughtersOfSon: number; // بنات الابن
}

export interface HeirResult {
  name: string;
  nameAr: string;
  count: number;
  fraction: string;     // النصيب كسراً
  percentage: number;   // النصيب نسبة مئوية
  amountPerPerson?: number;
  totalAmount?: number;
  basis: string;        // الأساس الشرعي
  notes?: string;
}

export interface InheritanceResult {
  madhab: Madhab;
  mode: CalcMode;       // الوضع المختار: النظام السعودي أو مذهب معيّن
  madhabLabel: string;
  heirs: HeirResult[];
  awl: boolean;         // العول — هل وقع عول؟
  radd: boolean;        // الرد — هل وقع رد؟
  awlDetails?: string;
  raddDetails?: string;
  blockedHeirs: { name: string; blockedBy: string }[];
  totalPercentage: number;
  estateValue?: number;
  notes: string[];
}

function simplifyFraction(num: number, den: number): string {
  if (num === 0) return "0";
  const g = gcd(Math.abs(num), Math.abs(den));
  const n = num / g;
  const d = den / g;
  return d === 1 ? `${n}` : `${n}/${d}`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

type ShareEntry = {
  key: string;
  nameAr: string;
  count: number;
  numerator: number;
  denominator: number;
  basis: string;
  notes?: string;
  isAsaba?: boolean; // عصبة
};

export function calculateInheritance(
  input: HeirInput,
  mode: CalcMode,
  estateValue?: number
): InheritanceResult {
  const blocked: { name: string; blockedBy: string }[] = [];
  const notes: string[] = [];
  const shares: ShareEntry[] = [];

  // النظام السعودي: يعتمد المرجعية الحنبلية في العموم، ويحسم مسألة الجد مع الإخوة
  // بقول أبي حنيفة واختيار ابن تيمية (الجد يحجب الإخوة) وفق المادة 212 من نظام الأحوال الشخصية.
  const isSaudi = mode === "SAUDI";
  const madhab: Madhab = isSaudi ? "HANBALI" : mode;
  // الجد يحجب الإخوة: في الحنفي، وفي النظام السعودي.
  const grandfatherBlocksSiblings = madhab === "HANAFI" || isSaudi;
  if (isSaudi) {
    notes.push("وضع النظام السعودي: الحساب وفق نظام الأحوال الشخصية السعودي — يعتمد المرجعية الحنبلية، ويحجب الجدُّ الإخوةَ (المادة 212، على قول أبي حنيفة واختيار ابن تيمية).");
  }

  const hasChildren = input.sons > 0 || input.daughters > 0 ||
    input.sonsOfSon > 0 || input.daughtersOfSon > 0;
  const hasMaleDescendants = input.sons > 0 || input.sonsOfSon > 0;
  const hasSiblings = input.fullBrothers > 0 || input.fullSisters > 0 ||
    input.halfBrothersPaternal > 0 || input.halfSistersPaternal > 0;

  // --- الأكدرية (قول زيد بن ثابت والجمهور: المالكي/الشافعي/الحنبلي) ---
  // جد + أخت واحدة (شقيقة أو لأب) + صاحب فرض، بلا فرع ولا أب ولا إخوة آخرين:
  // تُفرَض للأخت النصف وللجد السدس، ثم يُعال، ثم يُجمع نصيبا الجد والأخت ويقتسمانه للذكر مثل حظ الأنثيين.
  // في النظام السعودي والحنفي: الجد يحجب الأخت فلا أكدرية.
  const loneSisterFull = input.fullSisters === 1 && input.fullBrothers === 0 &&
    input.halfBrothersPaternal === 0 && input.halfSistersPaternal === 0;
  const loneSisterPaternal = input.fullSisters === 0 && input.fullBrothers === 0 &&
    input.halfSistersPaternal === 1 && input.halfBrothersPaternal === 0;
  const hasFard = input.husbands > 0 || input.wives > 0 || input.mother ||
    input.grandmotherPaternal || input.grandmotherMaternal;
  const isAkdariyya = !grandfatherBlocksSiblings && input.grandfatherPaternal && !input.father &&
    !hasChildren && input.halfBrothersMaternal === 0 && input.halfSistersMaternal === 0 &&
    (loneSisterFull || loneSisterPaternal) && hasFard;

  if (isAkdariyya) {
    return computeAkdariyya(input, mode, madhab, loneSisterFull, estateValue);
  }

  // --- حجب الجد بالأب ---
  const grandfatherBlocked = input.grandfatherPaternal && input.father;
  if (grandfatherBlocked) {
    blocked.push({ name: "الجد لأب", blockedBy: "الأب" });
  }

  // --- الزوج ---
  if (input.husbands > 0) {
    if (hasChildren) {
      shares.push({ key: "husband", nameAr: "الزوج", count: 1, numerator: 1, denominator: 4, basis: "﴿وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ﴾ — الربع مع وجود الولد", isAsaba: false });
    } else {
      shares.push({ key: "husband", nameAr: "الزوج", count: 1, numerator: 1, denominator: 2, basis: "﴿وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ﴾ — النصف بدون ولد", isAsaba: false });
    }
  }

  // --- الزوجات ---
  if (input.wives > 0) {
    if (hasChildren) {
      shares.push({ key: "wife", nameAr: "الزوجة/الزوجات", count: input.wives, numerator: 1, denominator: 8, basis: "﴿فَإِن كَانَ لَكُمْ وَلَدٌ فَلَهُنَّ الثُّمُنُ﴾ — الثمن مع وجود الولد", notes: input.wives > 1 ? `يُقسَّم الثمن على ${input.wives} زوجات` : undefined });
    } else {
      shares.push({ key: "wife", nameAr: "الزوجة/الزوجات", count: input.wives, numerator: 1, denominator: 4, basis: "﴿وَلَهُنَّ الرُّبُعُ مِمَّا تَرَكْتُمْ﴾ — الربع بدون ولد", notes: input.wives > 1 ? `يُقسَّم الربع على ${input.wives} زوجات` : undefined });
    }
  }

  // --- الأم ---
  if (input.mother) {
    const hasMultipleSiblings = (input.fullBrothers + input.fullSisters + input.halfBrothersPaternal + input.halfSistersPaternal + input.halfBrothersMaternal + input.halfSistersMaternal) >= 2;
    if (hasChildren || hasMultipleSiblings) {
      shares.push({ key: "mother", nameAr: "الأم", count: 1, numerator: 1, denominator: 6, basis: "﴿وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ﴾ — السدس مع وجود الولد أو أكثر من أخ" });
    } else {
      // تفقد المذاهب في مسألة العمريتين
      if (input.father && (input.husbands > 0 || input.wives > 0)) {
        // مسألة العُمريّتين (الغرّاوين): للأم ثلث الباقي بعد فرض الزوج/الزوجة — باتفاق الأئمة الأربعة (قضاء عمر رضي الله عنه)
        if (input.husbands > 0) {
          // زوج (النصف) → الباقي = 1/2 → ثلث الباقي = 1/6 من أصل التركة، والباقي (1/3) للأب تعصيباً
          shares.push({ key: "mother", nameAr: "الأم", count: 1, numerator: 1, denominator: 6, basis: "مسألة العُمريّتين: للأم ثلث الباقي بعد فرض الزوج (النصف) = سدس التركة", notes: "مسألة العُمريّتين (الغرّاوين): للأم ثلث الباقي بعد نصيب الزوج — باتفاق المذاهب الأربعة، ويأخذ الأب الباقي تعصيباً" });
        } else {
          // زوجة (الربع) → الباقي = 3/4 → ثلث الباقي = 1/4 من أصل التركة، والباقي (1/2) للأب تعصيباً
          shares.push({ key: "mother", nameAr: "الأم", count: 1, numerator: 1, denominator: 4, basis: "مسألة العُمريّتين: للأم ثلث الباقي بعد فرض الزوجة (الربع) = ربع التركة", notes: "مسألة العُمريّتين (الغرّاوين): للأم ثلث الباقي بعد نصيب الزوجة — باتفاق المذاهب الأربعة، ويأخذ الأب الباقي تعصيباً" });
        }
      } else {
        shares.push({ key: "mother", nameAr: "الأم", count: 1, numerator: 1, denominator: 3, basis: "﴿فَإِن لَّمْ يَكُن لَّهُ وَلَدٌ﴾ — الثلث بدون ولد أو إخوة" });
      }
    }
  }

  // --- الأب ---
  if (input.father) {
    if (hasChildren) {
      if (hasMaleDescendants) {
        // يأخذ السدس فرضاً فقط
        shares.push({ key: "father", nameAr: "الأب", count: 1, numerator: 1, denominator: 6, basis: "﴿وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ﴾ — السدس مع وجود ابن أو ابن ابن" });
      } else {
        // يأخذ السدس + الباقي تعصيباً
        shares.push({ key: "father", nameAr: "الأب", count: 1, numerator: 1, denominator: 6, basis: "السدس فرضاً والباقي تعصيباً مع وجود بنات فقط", isAsaba: true, notes: "يأخذ السدس فرضاً ثم الباقي عصبةً" });
      }
    } else {
      // الأب يرث بالتعصيب (الباقي كله أو بعده)
      shares.push({ key: "father", nameAr: "الأب", count: 1, numerator: 1, denominator: 1, basis: "الأب عصبة يرث الباقي بعد أصحاب الفروض", isAsaba: true });
    }
    // الأب يحجب الإخوة والأجداد
    if (!grandfatherBlocked && input.grandfatherPaternal) {
      blocked.push({ name: "الجد لأب", blockedBy: "الأب" });
    }
    if (hasSiblings) {
      if (input.fullBrothers > 0) blocked.push({ name: "الإخوة الأشقاء", blockedBy: "الأب" });
      if (input.fullSisters > 0) blocked.push({ name: "الأخوات الشقيقات", blockedBy: "الأب" });
      if (input.halfBrothersPaternal > 0) blocked.push({ name: "الإخوة لأب", blockedBy: "الأب" });
      if (input.halfSistersPaternal > 0) blocked.push({ name: "الأخوات لأب", blockedBy: "الأب" });
    }
  }

  // --- الجد من جهة الأب (عند عدم وجود الأب) ---
  if (input.grandfatherPaternal && !input.father) {
    if (grandfatherBlocksSiblings) {
      // الحنفية والنظام السعودي: الجد كالأب تماماً — يحجب الإخوة
      const src = isSaudi ? "النظام السعودي (م212): الجد يحجب الإخوة كالأب" : "الحنفية: الجد يحجب الإخوة تماماً";
      const by = isSaudi ? "الجد (النظام السعودي)" : "الجد (حنفي)";
      shares.push({ key: "grandfather", nameAr: "الجد لأب", count: 1, numerator: 1, denominator: 1, basis: `الجد كالأب — يرث ما يرثه الأب ويحجب الإخوة (${isSaudi ? "النظام السعودي، م212" : "مذهب الحنفية"})`, isAsaba: true, notes: src });
      if (hasSiblings) {
        if (input.fullBrothers > 0) blocked.push({ name: "الإخوة الأشقاء", blockedBy: by });
        if (input.fullSisters > 0) blocked.push({ name: "الأخوات الشقيقات", blockedBy: by });
        if (input.halfBrothersPaternal > 0) blocked.push({ name: "الإخوة لأب", blockedBy: by });
        if (input.halfSistersPaternal > 0) blocked.push({ name: "الأخوات لأب", blockedBy: by });
      }
    } else {
      // المالكية والشافعية والحنابلة: الجد يشارك الإخوة (المقاسمة)
      shares.push({ key: "grandfather", nameAr: "الجد لأب", count: 1, numerator: 1, denominator: 1, basis: "الجد يشارك الإخوة بالمقاسمة في المذاهب الثلاثة", isAsaba: true, notes: `${madhab === "MALIKI" ? "المالكية" : madhab === "SHAFII" ? "الشافعية" : "الحنابلة"}: الجد يقاسم الإخوة ويأخذ الأحظ من: المقاسمة أو السدس` });
      notes.push("مسألة الجد مع الإخوة: الجد يأخذ الأحظ من: المقاسمة كأخ، أو السدس، مع مراعاة ألا يأخذ أكثر من الثلث أحياناً");
    }
  }

  // --- الجدة (أم الأب أو أم الأم) ---
  if (input.grandmotherPaternal && !input.mother && !input.father) {
    shares.push({ key: "grandmotherP", nameAr: "الجدة لأب", count: 1, numerator: 1, denominator: 6, basis: "السدس للجدة عند عدم وجود الأم والأب" });
  }
  if (input.grandmotherMaternal && !input.mother) {
    shares.push({ key: "grandmotherM", nameAr: "الجدة لأم", count: 1, numerator: 1, denominator: 6, basis: "السدس للجدة من جهة الأم عند عدم وجود الأم" });
  }

  // --- الأبناء والبنات ---
  const fatherBlocksSiblings = input.father || (grandfatherBlocksSiblings && input.grandfatherPaternal);
  if (input.sons > 0 || input.daughters > 0) {
    if (input.sons > 0 && input.daughters > 0) {
      // للذكر مثل حظ الأنثيين — يرثون بالتعصيب
      const totalParts = input.sons * 2 + input.daughters;
      notes.push(`الأبناء والبنات: للذكر مثل حظ الأنثيين — إجمالي الأجزاء: ${totalParts}`);
      shares.push({ key: "sons", nameAr: "الأبناء", count: input.sons, numerator: input.sons * 2, denominator: totalParts, basis: "﴿لِلذَّكَرِ مِثْلُ حَظِّ الأُنثَيَيْنِ﴾", isAsaba: true });
      shares.push({ key: "daughters", nameAr: "البنات", count: input.daughters, numerator: input.daughters, denominator: totalParts, basis: "﴿لِلذَّكَرِ مِثْلُ حَظِّ الأُنثَيَيْنِ﴾", isAsaba: true });
    } else if (input.sons > 0) {
      shares.push({ key: "sons", nameAr: "الأبناء", count: input.sons, numerator: 1, denominator: 1, basis: "الابن عصبة يرث الباقي بعد أصحاب الفروض", isAsaba: true });
    } else {
      // بنات فقط
      if (input.daughters === 1) {
        shares.push({ key: "daughters", nameAr: "البنت", count: 1, numerator: 1, denominator: 2, basis: "﴿وَإِن كَانَت وَاحِدَةً فَلَهَا النِّصْفُ﴾" });
      } else {
        shares.push({ key: "daughters", nameAr: "البنات", count: input.daughters, numerator: 2, denominator: 3, basis: "﴿فَإِن كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ﴾" });
      }
    }
  } else if (input.sonsOfSon > 0 || input.daughtersOfSon > 0) {
    // أبناء الابن — ينزلون منزلة الأبناء
    if (input.sonsOfSon > 0 && input.daughtersOfSon > 0) {
      const totalParts = input.sonsOfSon * 2 + input.daughtersOfSon;
      shares.push({ key: "sonsOfSon", nameAr: "أبناء الابن", count: input.sonsOfSon, numerator: input.sonsOfSon * 2, denominator: totalParts, basis: "أبناء الابن ينزلون منزلة الابن", isAsaba: true });
      shares.push({ key: "daughtersOfSon", nameAr: "بنات الابن", count: input.daughtersOfSon, numerator: input.daughtersOfSon, denominator: totalParts, basis: "بنات الابن ينزلن منزلة البنت", isAsaba: true });
    } else if (input.sonsOfSon > 0) {
      shares.push({ key: "sonsOfSon", nameAr: "أبناء الابن", count: input.sonsOfSon, numerator: 1, denominator: 1, basis: "ابن الابن عصبة ينزل منزلة الابن", isAsaba: true });
    } else {
      if (input.daughtersOfSon === 1) {
        shares.push({ key: "daughtersOfSon", nameAr: "بنت الابن", count: 1, numerator: 1, denominator: 2, basis: "بنت الابن تأخذ النصف عند انفرادها وعدم وجود بنات" });
      } else {
        shares.push({ key: "daughtersOfSon", nameAr: "بنات الابن", count: input.daughtersOfSon, numerator: 2, denominator: 3, basis: "بنات الابن يأخذن الثلثين عند تعددهن" });
      }
    }
  }

  // --- حجب الإخوة لأم (بالفرع الوارث أو الأب أو الجد) — يُدرجون في قائمة المحجوبين للشفافية ---
  // يُنفَّذ خارج شرط قسم الإخوة لأن الأب يحجب القسم كله فلا يصل الإخوة لأم إليه
  {
    const uterine = input.halfBrothersMaternal + input.halfSistersMaternal;
    if (uterine > 0 && (hasChildren || input.father || input.grandfatherPaternal)) {
      const blocker = hasChildren ? "الفرع الوارث (ابن/بنت)" : input.father ? "الأب" : "الجد";
      if (input.halfBrothersMaternal > 0) blocked.push({ name: "الإخوة لأم", blockedBy: blocker });
      if (input.halfSistersMaternal > 0) blocked.push({ name: "الأخوات لأم", blockedBy: blocker });
    }
  }

  // --- الإخوة والأخوات (عند عدم حجبهم) ---
  if (!input.father && !(grandfatherBlocksSiblings && input.grandfatherPaternal)) {
    // الإخوة لأم
    const uterineSiblings = input.halfBrothersMaternal + input.halfSistersMaternal;
    if (uterineSiblings > 0 && !hasChildren && !input.father && !input.grandfatherPaternal) {
      if (uterineSiblings === 1) {
        shares.push({ key: "uterineS", nameAr: "الأخ/الأخت لأم", count: 1, numerator: 1, denominator: 6, basis: "﴿وَإِن كَانَ رَجُلٌ يُورَثُ كَلَالَةً أَو امْرَأَةٌ وَلَهُ أَخٌ أَوْ أُخْتٌ فَلِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ﴾" });
      } else {
        // المسألة المشتركة — فرق المذاهب
        if (madhab === "SHAFII" && input.husbands > 0 && input.fullBrothers > 0 && input.mother) {
          notes.push("مسألة المشتركة (الحمارية): الشافعية يشرّكون بين الأشقاء والإخوة لأم في الثلث");
          shares.push({ key: "uterineS", nameAr: "الإخوة لأم", count: uterineSiblings, numerator: 1, denominator: 3, basis: "الثلث يُشارَك مع الأشقاء في المسألة المشتركة (الشافعي)", notes: "الشافعية: يشترك الإخوة لأم والأشقاء في الثلث" });
        } else {
          shares.push({ key: "uterineS", nameAr: "الإخوة لأم", count: uterineSiblings, numerator: 1, denominator: 3, basis: "﴿فَهُمْ شُرَكَاءُ فِي الثُّلُثِ﴾" });
        }
      }
    }

    // الإخوة والأخوات الأشقاء
    const femaleDescendantsOnly = hasChildren && !hasMaleDescendants; // بنات و/أو بنات ابن دون ذكور من الفروع
    if (input.fullBrothers > 0 || input.fullSisters > 0) {
      if (hasMaleDescendants) {
        // الابن أو ابن الابن يحجب الإخوة الأشقاء حجب حرمان
        if (input.fullBrothers > 0) blocked.push({ name: "الإخوة الأشقاء", blockedBy: "الابن/ابن الابن" });
        if (input.fullSisters > 0) blocked.push({ name: "الأخوات الشقيقات", blockedBy: "الابن/ابن الابن" });
      } else if (femaleDescendantsOnly) {
        // العصبة مع الغير: الأخوات الشقيقات مع البنات/بنات الابن يصرن عصبة يرثن الباقي بعد أصحاب الفروض
        if (input.fullBrothers > 0 && input.fullSisters > 0) {
          const totalParts = input.fullBrothers * 2 + input.fullSisters;
          shares.push({ key: "fullBrothers", nameAr: "الإخوة الأشقاء", count: input.fullBrothers, numerator: input.fullBrothers * 2, denominator: totalParts, basis: "الإخوة الأشقاء عصبة يرثون الباقي بعد فرض البنات — للذكر مثل حظ الأنثيين", isAsaba: true });
          shares.push({ key: "fullSisters", nameAr: "الأخوات الشقيقات", count: input.fullSisters, numerator: input.fullSisters, denominator: totalParts, basis: "الأخوات الشقيقات عصبة مع إخوتهن — للذكر مثل حظ الأنثيين", isAsaba: true });
        } else if (input.fullBrothers > 0) {
          shares.push({ key: "fullBrothers", nameAr: "الإخوة الأشقاء", count: input.fullBrothers, numerator: 1, denominator: 1, basis: "الإخوة الأشقاء عصبة يرثون الباقي بعد فرض البنات", isAsaba: true });
        } else {
          shares.push({ key: "fullSisters", nameAr: input.fullSisters === 1 ? "الأخت الشقيقة" : "الأخوات الشقيقات", count: input.fullSisters, numerator: 1, denominator: 1, basis: "العصبة مع الغير: الأخت الشقيقة (فأكثر) تصير عصبة مع البنات/بنات الابن فتأخذ الباقي — لقوله ﷺ: «اجعلوا الأخوات مع البنات عصبة» (رواه البخاري)", isAsaba: true, notes: "عصبة مع الغير: الأخوات الشقيقات مع البنات يأخذن ما بقي بعد أصحاب الفروض" });
        }
        // الأشقاء بوصفهم عصبة مع البنات يحجبون الإخوة والأخوات لأب
        if (input.halfBrothersPaternal > 0) blocked.push({ name: "الإخوة لأب", blockedBy: "الأشقاء (عصبة مع البنات)" });
        if (input.halfSistersPaternal > 0) blocked.push({ name: "الأخوات لأب", blockedBy: "الأشقاء (عصبة مع البنات)" });
      } else {
        // كلالة: لا فرع وارث
        if (input.fullBrothers > 0 && input.fullSisters > 0) {
          const totalParts = input.fullBrothers * 2 + input.fullSisters;
          shares.push({ key: "fullBrothers", nameAr: "الإخوة الأشقاء", count: input.fullBrothers, numerator: input.fullBrothers * 2, denominator: totalParts, basis: "للذكر مثل حظ الأنثيين", isAsaba: true });
          shares.push({ key: "fullSisters", nameAr: "الأخوات الشقيقات", count: input.fullSisters, numerator: input.fullSisters, denominator: totalParts, basis: "للذكر مثل حظ الأنثيين", isAsaba: true });
        } else if (input.fullBrothers > 0) {
          shares.push({ key: "fullBrothers", nameAr: "الإخوة الأشقاء", count: input.fullBrothers, numerator: 1, denominator: 1, basis: "الإخوة الأشقاء عصبة يرثون الباقي", isAsaba: true });
          if (input.halfBrothersPaternal > 0) blocked.push({ name: "الإخوة لأب", blockedBy: "الإخوة الأشقاء" });
          if (input.halfSistersPaternal > 0) blocked.push({ name: "الأخوات لأب", blockedBy: "الإخوة الأشقاء" });
        } else {
          if (input.fullSisters === 1) {
            shares.push({ key: "fullSisters", nameAr: "الأخت الشقيقة", count: 1, numerator: 1, denominator: 2, basis: "الأخت الشقيقة تأخذ النصف عند الانفراد" });
          } else {
            shares.push({ key: "fullSisters", nameAr: "الأخوات الشقيقات", count: input.fullSisters, numerator: 2, denominator: 3, basis: "الأخوات الشقيقات يأخذن الثلثين" });
          }
        }
      }
    }

    // الإخوة والأخوات لأب (يُحجبون بالأشقاء، ولا يرثون إلا عند عدم وجود الأشقاء)
    const hasFullSiblings = input.fullBrothers > 0 || input.fullSisters > 0;
    if (!hasFullSiblings && (input.halfBrothersPaternal > 0 || input.halfSistersPaternal > 0)) {
      if (hasMaleDescendants) {
        if (input.halfBrothersPaternal > 0) blocked.push({ name: "الإخوة لأب", blockedBy: "الابن/ابن الابن" });
        if (input.halfSistersPaternal > 0) blocked.push({ name: "الأخوات لأب", blockedBy: "الابن/ابن الابن" });
      } else if (femaleDescendantsOnly) {
        // العصبة مع الغير للإخوة/الأخوات لأب عند عدم وجود الأشقاء
        if (input.halfBrothersPaternal > 0 && input.halfSistersPaternal > 0) {
          const totalParts = input.halfBrothersPaternal * 2 + input.halfSistersPaternal;
          shares.push({ key: "halfBrothersP", nameAr: "الإخوة لأب", count: input.halfBrothersPaternal, numerator: input.halfBrothersPaternal * 2, denominator: totalParts, basis: "الإخوة لأب عصبة يرثون الباقي بعد فرض البنات — للذكر مثل حظ الأنثيين", isAsaba: true });
          shares.push({ key: "halfSistersP", nameAr: "الأخوات لأب", count: input.halfSistersPaternal, numerator: input.halfSistersPaternal, denominator: totalParts, basis: "الأخوات لأب عصبة مع إخوتهن — للذكر مثل حظ الأنثيين", isAsaba: true });
        } else if (input.halfBrothersPaternal > 0) {
          shares.push({ key: "halfBrothersP", nameAr: "الإخوة لأب", count: input.halfBrothersPaternal, numerator: 1, denominator: 1, basis: "الإخوة لأب عصبة يرثون الباقي بعد فرض البنات", isAsaba: true });
        } else {
          shares.push({ key: "halfSistersP", nameAr: input.halfSistersPaternal === 1 ? "الأخت لأب" : "الأخوات لأب", count: input.halfSistersPaternal, numerator: 1, denominator: 1, basis: "العصبة مع الغير: الأخوات لأب مع البنات (عند عدم وجود الأشقاء) يأخذن الباقي بعد أصحاب الفروض", isAsaba: true, notes: "عصبة مع الغير: الأخوات لأب مع البنات يأخذن ما بقي بعد أصحاب الفروض" });
        }
      } else {
        // كلالة
        if (input.halfBrothersPaternal > 0 && input.halfSistersPaternal > 0) {
          const totalParts = input.halfBrothersPaternal * 2 + input.halfSistersPaternal;
          shares.push({ key: "halfBrothersP", nameAr: "الإخوة لأب", count: input.halfBrothersPaternal, numerator: input.halfBrothersPaternal * 2, denominator: totalParts, basis: "للذكر مثل حظ الأنثيين", isAsaba: true });
          shares.push({ key: "halfSistersP", nameAr: "الأخوات لأب", count: input.halfSistersPaternal, numerator: input.halfSistersPaternal, denominator: totalParts, basis: "للذكر مثل حظ الأنثيين", isAsaba: true });
        } else if (input.halfBrothersPaternal > 0) {
          shares.push({ key: "halfBrothersP", nameAr: "الإخوة لأب", count: input.halfBrothersPaternal, numerator: 1, denominator: 1, basis: "الإخوة لأب عصبة يرثون الباقي", isAsaba: true });
        } else {
          if (input.halfSistersPaternal === 1) {
            shares.push({ key: "halfSistersP", nameAr: "الأخت لأب", count: 1, numerator: 1, denominator: 2, basis: "الأخت لأب تأخذ النصف" });
          } else {
            shares.push({ key: "halfSistersP", nameAr: "الأخوات لأب", count: input.halfSistersPaternal, numerator: 2, denominator: 3, basis: "الأخوات لأب يأخذن الثلثين" });
          }
        }
      }
    }
  }

  // --- حساب العول والرد ---
  const result = computeResult(shares, madhab, blocked, notes, estateValue);
  const madhabLabel = isSaudi ? "النظام السعودي" : MADHABS.find((m) => m.value === madhab)!.label;
  return { ...result, madhab, mode, madhabLabel };
}

/** الأكدرية: يُبنى الحل على الفروض مع عول، ثم يُجمع نصيبا الجد والأخت ويقتسمانه للذكر مثل حظ الأنثيين. */
function computeAkdariyya(
  input: HeirInput,
  mode: CalcMode,
  madhab: Madhab,
  loneSisterFull: boolean,
  estateValue?: number
): InheritanceResult {
  const shares: ShareEntry[] = [];
  const notes: string[] = ["المسألة الأكدرية (قول زيد بن ثابت والجمهور): تُفرَض للأخت النصف وللجد السدس ثم تعول المسألة، ثم يُجمع نصيبا الجد والأخت ويقتسمانه للذكر مثل حظ الأنثيين (للجد الثلثان وللأخت الثلث)."];

  // الزوج/الزوجة
  if (input.husbands > 0) {
    shares.push({ key: "husband", nameAr: "الزوج", count: 1, numerator: 1, denominator: 2, basis: "النصف للزوج مع عدم وجود الفرع الوارث" });
  } else if (input.wives > 0) {
    shares.push({ key: "wife", nameAr: "الزوجة/الزوجات", count: input.wives, numerator: 1, denominator: 4, basis: "الربع للزوجة مع عدم وجود الفرع الوارث" });
  }
  // الأم (الثلث مع الجد وأخت واحدة)
  if (input.mother) {
    shares.push({ key: "mother", nameAr: "الأم", count: 1, numerator: 1, denominator: 3, basis: "الثلث للأم مع الجد وعدم وجود فرع وارث أو عدد من الإخوة" });
  } else if (input.grandmotherMaternal || input.grandmotherPaternal) {
    shares.push({ key: "grandmother", nameAr: "الجدة", count: 1, numerator: 1, denominator: 6, basis: "السدس للجدة عند عدم وجود الأم" });
  }
  // الأخت: النصف فرضاً (خصيصة الأكدرية)
  const sisterKey = loneSisterFull ? "fullSisters" : "halfSistersP";
  const sisterName = loneSisterFull ? "الأخت الشقيقة" : "الأخت لأب";
  shares.push({ key: sisterKey, nameAr: sisterName, count: 1, numerator: 1, denominator: 2, basis: "يُفرَض للأخت النصف في الأكدرية (خلافاً للأصل من أنها عصبة مع الجد)" });
  // الجد: السدس فرضاً
  shares.push({ key: "grandfather", nameAr: "الجد لأب", count: 1, numerator: 1, denominator: 6, basis: "يُفرَض للجد السدس في الأكدرية" });

  const base = computeResult(shares, madhab, [], notes, estateValue);

  // دمج نصيبي الجد والأخت واقتسامهما 2:1 (للذكر مثل حظ الأنثيين)
  const gd = base.heirs.find((h) => h.name === "grandfather");
  const sis = base.heirs.find((h) => h.name === sisterKey);
  if (gd && sis) {
    const combined = gd.percentage + sis.percentage;
    gd.percentage = (combined * 2) / 3;
    sis.percentage = combined / 3;
    gd.fraction = "الثلثان من مجموع نصيب الجد والأخت";
    sis.fraction = "الثلث من مجموع نصيب الجد والأخت";
    if (estateValue) {
      gd.totalAmount = (gd.percentage / 100) * estateValue;
      gd.amountPerPerson = gd.totalAmount;
      sis.totalAmount = (sis.percentage / 100) * estateValue;
      sis.amountPerPerson = sis.totalAmount;
    }
  }

  const madhabLabel = mode === "SAUDI" ? "النظام السعودي" : MADHABS.find((m) => m.value === madhab)!.label;
  return { ...base, madhab, mode, madhabLabel, awl: true };
}

function computeResult(
  shares: ShareEntry[],
  madhab: Madhab,
  blocked: { name: string; blockedBy: string }[],
  notes: string[],
  estateValue?: number
): Omit<InheritanceResult, "madhab" | "mode" | "madhabLabel"> {
  // تجميع المقامات وإيجاد المضاعف المشترك
  const furudShares = shares.filter((s) => !s.isAsaba);
  const asabaShares = shares.filter((s) => s.isAsaba);

  if (furudShares.length === 0 && asabaShares.length === 0) {
    return { heirs: [], awl: false, radd: false, blockedHeirs: blocked, totalPercentage: 0, notes };
  }

  // حساب مجموع الفروض
  let furudSum = 0;
  for (const s of furudShares) {
    furudSum += s.numerator / s.denominator;
  }

  const remaining = 1 - furudSum;
  let awl = false;
  let radd = false;
  let awlDetails: string | undefined;
  let raddDetails: string | undefined;

  // العول: إذا تجاوزت الفروض الواحد
  if (furudSum > 1.0001) {
    awl = true;
    awlDetails = `مجموع الفروض = ${furudSum.toFixed(4)} > 1 → العول: تُنقص كل الأنصبة بنسبة متساوية`;
    notes.push("وقع العول في هذه المسألة — تُردّ جميع الأنصبة بنسبة متساوية");
  }

  const heirs: HeirResult[] = [];

  if (awl) {
    // في العول: كل وارث يأخذ نسبة فرضه من مجموع الفروض
    for (const s of furudShares) {
      const pct = (s.numerator / s.denominator / furudSum) * 100;
      heirs.push({
        name: s.key,
        nameAr: s.nameAr,
        count: s.count,
        fraction: simplifyFraction(s.numerator, s.denominator) + " (معال)",
        percentage: pct,
        amountPerPerson: estateValue ? (pct / 100 / s.count) * estateValue : undefined,
        totalAmount: estateValue ? (pct / 100) * estateValue : undefined,
        basis: s.basis,
        notes: s.notes,
      });
    }
  } else {
    // توزيع الفروض
    for (const s of furudShares) {
      const pct = (s.numerator / s.denominator) * 100;
      heirs.push({
        name: s.key,
        nameAr: s.nameAr,
        count: s.count,
        fraction: simplifyFraction(s.numerator, s.denominator),
        percentage: pct,
        amountPerPerson: estateValue ? (pct / 100 / s.count) * estateValue : undefined,
        totalAmount: estateValue ? (pct / 100) * estateValue : undefined,
        basis: s.basis,
        notes: s.notes,
      });
    }

    // توزيع الباقي على العصبة
    if (asabaShares.length > 0 && remaining > 0.001) {
      // مقاسمة الجد مع الإخوة (جمهور المالكية والشافعية والحنابلة): الجد يأخذ الأحظّ
      const grandfatherEntry = asabaShares.find((s) => s.key === "grandfather");
      const siblingKeys = ["fullBrothers", "fullSisters", "halfBrothersP", "halfSistersP"];
      const siblingEntries = asabaShares.filter((s) => siblingKeys.includes(s.key));
      const descendantKeys = ["sons", "daughters", "sonsOfSon", "daughtersOfSon"];
      const hasDescendantEntry = shares.some((s) => descendantKeys.includes(s.key));

      if (grandfatherEntry && siblingEntries.length > 0 && !hasDescendantEntry && madhab !== "HANAFI") {
        // عدد الإخوة والأخوات المقاسِمين — الأخت نصف أخ في المقاسمة
        let brothers = 0;
        let sisters = 0;
        for (const s of siblingEntries) {
          if (s.key === "fullBrothers" || s.key === "halfBrothersP") brothers += s.count;
          else sisters += s.count;
        }
        const hasFurud = furudShares.length > 0;
        const muqasamaShare = remaining * (1 / (1 + brothers + 0.5 * sisters)); // المقاسمة كأخ
        const thirdShare = remaining / 3; // ثلث الباقي عند وجود فروض = ثلث التركة عند عدمها
        const sixthOfEstate = hasFurud ? 1 / 6 : 0; // سدس التركة أرضيةٌ للجد عند وجود أصحاب الفروض
        const bestRaw = Math.max(muqasamaShare, thirdShare, sixthOfEstate);
        const grandfatherShare = Math.min(bestRaw, remaining); // لا يتجاوز الباقي
        const whichBest =
          bestRaw === muqasamaShare ? "المقاسمة كأخ" :
          bestRaw === thirdShare ? (hasFurud ? "ثلث الباقي" : "ثلث التركة") :
          "سدس التركة";

        heirs.push({
          name: grandfatherEntry.key,
          nameAr: grandfatherEntry.nameAr,
          count: grandfatherEntry.count,
          fraction: `الأحظّ للجد: ${whichBest}`,
          percentage: grandfatherShare * 100,
          amountPerPerson: estateValue ? (grandfatherShare / grandfatherEntry.count) * estateValue : undefined,
          totalAmount: estateValue ? grandfatherShare * estateValue : undefined,
          basis: grandfatherEntry.basis,
          notes: `أُعطي الجد الأحظّ له: ${whichBest}`,
        });

        // باقي العصبة (الإخوة والأخوات) للذكر مثل حظ الأنثيين
        const siblingsPortion = remaining - grandfatherShare;
        const totalUnits = brothers * 2 + sisters; // الأخ سهمان والأخت سهم
        for (const s of siblingEntries) {
          const isBrotherEntry = s.key === "fullBrothers" || s.key === "halfBrothersP";
          const entryUnits = isBrotherEntry ? s.count * 2 : s.count;
          const entryPct = totalUnits > 0 ? (entryUnits / totalUnits) * siblingsPortion * 100 : 0;
          heirs.push({
            name: s.key,
            nameAr: s.nameAr,
            count: s.count,
            fraction: `${simplifyFraction(entryUnits, totalUnits)} من الباقي بعد الجد`,
            percentage: entryPct,
            amountPerPerson: estateValue ? (entryPct / 100 / s.count) * estateValue : undefined,
            totalAmount: estateValue ? (entryPct / 100) * estateValue : undefined,
            basis: s.basis,
            notes: s.notes,
          });
        }
        notes.push("مقاسمة الجد مع الإخوة: أُعطي الجد الأحظّ من (المقاسمة كأخ، أو ثلث الباقي/ثلث التركة، أو سدس التركة عند وجود أصحاب الفروض)، والباقي للإخوة للذكر مثل حظ الأنثيين");
      } else {
        // التوزيع الاعتيادي للعصبة بحسب أنصبتهم
        const totalAsabaParts = asabaShares.reduce((sum, s) => sum + s.numerator / s.denominator, 0);
        for (const s of asabaShares) {
          const asabaPct = (s.numerator / s.denominator / totalAsabaParts) * remaining * 100;
          heirs.push({
            name: s.key,
            nameAr: s.nameAr,
            count: s.count,
            fraction: `${simplifyFraction(s.numerator, s.denominator)} من الباقي`,
            percentage: asabaPct,
            amountPerPerson: estateValue ? (asabaPct / 100 / s.count) * estateValue : undefined,
            totalAmount: estateValue ? (asabaPct / 100) * estateValue : undefined,
            basis: s.basis,
            notes: s.notes,
          });
        }
      }
    } else if (asabaShares.length === 0 && remaining > 0.001 && furudShares.length > 0) {
      // الرد
      if (madhab === "SHAFII") {
        // الشافعية: الباقي لبيت المال
        raddDetails = "الشافعية: الباقي يذهب لبيت المال — لا رد على أصحاب الفروض";
        notes.push("الشافعية: الزائد بعد أصحاب الفروض يذهب لبيت المال ولا يُرد على الورثة");
      } else {
        // الحنفية والمالكية والحنابلة: الرد على أصحاب الفروض (عدا الزوج والزوجة)
        radd = true;
        raddDetails = "الرد: يُوزَّع الباقي على أصحاب الفروض (عدا الزوج/الزوجة) بنسبة أنصبتهم";
        notes.push("وقع الرد في هذه المسألة — يُرد الباقي على أصحاب الفروض");
        const raddHeirs = heirs.filter((h) => h.name !== "husband" && h.name !== "wife");
        if (raddHeirs.length > 0) {
          const raddSum = raddHeirs.reduce((s, h) => s + h.percentage, 0);
          for (const h of raddHeirs) {
            const extra = (h.percentage / raddSum) * remaining * 100;
            h.percentage += extra;
            if (estateValue) {
              h.totalAmount = (h.percentage / 100) * estateValue;
              h.amountPerPerson = h.totalAmount / h.count;
            }
          }
        }
      }
    }
  }

  const totalPercentage = heirs.reduce((s, h) => s + h.percentage, 0);

  return { heirs, awl, radd, awlDetails, raddDetails, blockedHeirs: blocked, totalPercentage, notes };
}

export function getMadhabDifferences(): { topic: string; hanafi: string; maliki: string; shafii: string; hanbali: string }[] {
  return [
    {
      topic: "الجد مع الإخوة",
      hanafi: "الجد يحجب الإخوة كالأب تماماً",
      maliki: "الجد يقاسم الإخوة بالمقاسمة",
      shafii: "الجد يقاسم الإخوة بالمقاسمة",
      hanbali: "الجد يقاسم الإخوة بالمقاسمة",
    },
    {
      topic: "الرد على أصحاب الفروض",
      hanafi: "يُرد على أصحاب الفروض ما عدا الزوجين",
      maliki: "يُرد على أصحاب الفروض ما عدا الزوجين",
      shafii: "لا رد — الباقي لبيت المال",
      hanbali: "يُرد على أصحاب الفروض ما عدا الزوجين",
    },
    {
      topic: "ذوو الأرحام",
      hanafi: "يرثون عند عدم وجود عصبة أو أصحاب فروض",
      maliki: "يرثون عند عدم وجود عصبة",
      shafii: "لا يرثون — التركة لبيت المال",
      hanbali: "يرثون عند عدم وجود عصبة أو أصحاب فروض",
    },
    {
      topic: "المسألة المشتركة (الحمارية)",
      hanafi: "لا توريث للأشقاء مع الأم والزوج",
      maliki: "لا توريث للأشقاء مع الأم والزوج",
      shafii: "الأشقاء يشتركون مع الإخوة لأم في الثلث",
      hanbali: "لا توريث للأشقاء مع الأم والزوج",
    },
    {
      topic: "ميراث الحمل",
      hanafi: "يُوقف للحمل نصيب ابنين",
      maliki: "يُوقف للحمل نصيب ابنين",
      shafii: "يُوقف للحمل نصيب ابنين",
      hanbali: "يُوقف للحمل نصيب ابنين",
    },
  ];
}
