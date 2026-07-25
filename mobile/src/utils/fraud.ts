// Fraud report helpers.
//
// Mirrors the FraudReport schema in backend/src/models/FraudReport.js:
// reporterName, reporterEmail, fraudType and description are required, the
// fraudType enum is fixed, and description/evidence have maxLength caps.
// Validating here means the reporter gets a specific message instead of a
// generic 400 after typing a long description.

export const FRAUD_TYPES = [
  { value: 'food_quality', label: 'Food quality / hygiene' },
  { value: 'delivery', label: 'Delivery problem' },
  { value: 'payment', label: 'Payment issue' },
  { value: 'fake_partner', label: 'Fake listing' },
  { value: 'identity', label: 'Identity misuse' },
  { value: 'other', label: 'Something else' },
] as const;

export type FraudType = (typeof FRAUD_TYPES)[number]['value'];

/** Schema caps — keep in sync with backend/src/models/FraudReport.js. */
export const MAX_DESCRIPTION = 2000;
export const MAX_EVIDENCE = 1000;

export function isFraudType(value: string): value is FraudType {
  return FRAUD_TYPES.some((t) => t.value === value);
}

/**
 * Minimal email shape check. Deliberately permissive — this only catches
 * obvious typos before submitting; the server remains the authority.
 */
export function isPlausibleEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  const at = trimmed.indexOf('@');
  if (at <= 0 || at !== trimmed.lastIndexOf('@')) return false;
  const domain = trimmed.slice(at + 1);
  return domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
}

export interface FraudDraft {
  name: string;
  email: string;
  fraudType: FraudType | null;
  description: string;
}

export interface FraudValidation {
  valid: boolean;
  message?: string;
  field?: 'name' | 'email' | 'fraudType' | 'description';
}

/** Validate a draft report, returning the first problem in reading order. */
export function validateFraudReport(draft: FraudDraft): FraudValidation {
  if (!draft.fraudType) {
    return { valid: false, field: 'fraudType', message: 'Please choose what happened.' };
  }
  if (!draft.description.trim()) {
    return {
      valid: false,
      field: 'description',
      message: 'Please describe what happened so we can investigate.',
    };
  }
  if (draft.description.length > MAX_DESCRIPTION) {
    return {
      valid: false,
      field: 'description',
      message: `Description must be ${MAX_DESCRIPTION} characters or fewer.`,
    };
  }
  if (!draft.name.trim()) {
    return { valid: false, field: 'name', message: 'Please provide your name.' };
  }
  if (!isPlausibleEmail(draft.email)) {
    return { valid: false, field: 'email', message: 'Please provide a valid email address.' };
  }
  return { valid: true };
}
