/**
 * ترتيب الحقوق المتعلقة بالتركة قبل القسمة (وفق الفقه ونظام الأحوال الشخصية):
 * 1) تجهيز الميت (الكفن والدفن)  2) سداد الديون  3) تنفيذ الوصية في حدود الثلث
 * ثم يُقسَّم الباقي (الصافي) على الورثة.
 *
 * الوصية تكون في حدود ثلث ما تبقّى بعد التجهيز والديون، ولا تنفذ لوارث إلا بإجازة الورثة.
 */
export interface EstateDeductions {
  gross: number;    // إجمالي التركة
  funeral: number;  // تجهيز الميت
  debts: number;    // الديون
  wasiyya: number;  // الوصية الموصى بها
}

export interface EstateRightsResult {
  gross: number;
  funeral: number;
  debts: number;
  afterDebts: number;       // المتبقّي بعد التجهيز والديون
  wasiyyaMax: number;       // الحد الأقصى للوصية (ثلث ما بعد الديون)
  wasiyyaApplied: number;   // الوصية المنفَّذة فعلاً (مقيّدة بالثلث)
  wasiyyaExceeded: boolean; // هل تجاوزت الوصية الثلث؟
  net: number;              // الصافي الموزَّع على الورثة
  estateConsumed: boolean;  // هل استغرقت الديون التركة؟
}

export function computeEstateRights(d: EstateDeductions): EstateRightsResult {
  const gross = Math.max(0, d.gross || 0);
  const funeral = Math.max(0, d.funeral || 0);
  const debts = Math.max(0, d.debts || 0);
  const wasiyya = Math.max(0, d.wasiyya || 0);

  const afterDebts = Math.max(0, gross - funeral - debts);
  const estateConsumed = gross > 0 && gross - funeral - debts <= 0;

  const wasiyyaMax = afterDebts / 3;
  const wasiyyaApplied = Math.min(wasiyya, wasiyyaMax);
  const wasiyyaExceeded = wasiyya > wasiyyaMax + 1e-9;

  const net = Math.max(0, afterDebts - wasiyyaApplied);

  return { gross, funeral, debts, afterDebts, wasiyyaMax, wasiyyaApplied, wasiyyaExceeded, net, estateConsumed };
}
