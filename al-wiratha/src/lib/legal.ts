/**
 * Operator / legal-entity disclosure. Real values come from env in production;
 * placeholders make the "قيد التحديث" state explicit rather than silently absent.
 * The platform owner MUST set these before any Ministry-facing use.
 */
export const OPERATOR = {
  entity: process.env.NEXT_PUBLIC_OPERATOR_ENTITY ?? "—— (يُحدَّد الكيان القانوني)",
  crNumber: process.env.NEXT_PUBLIC_OPERATOR_CR ?? "—— (رقم السجل التجاري)",
  address: process.env.NEXT_PUBLIC_OPERATOR_ADDRESS ?? "—— (العنوان الوطني)",
  email: process.env.NEXT_PUBLIC_OPERATOR_EMAIL ?? "support@waratha.app",
  dpoEmail: process.env.NEXT_PUBLIC_OPERATOR_DPO ?? "privacy@waratha.app",
};

/** True once the owner has filled the legal entity — used to show a setup banner. */
export const OPERATOR_CONFIGURED = !!process.env.NEXT_PUBLIC_OPERATOR_ENTITY;

export const LAST_UPDATED = "17 أغسطس 2026";
