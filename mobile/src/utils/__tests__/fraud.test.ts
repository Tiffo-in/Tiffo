import {
  FRAUD_TYPES,
  MAX_DESCRIPTION,
  isFraudType,
  isPlausibleEmail,
  validateFraudReport,
} from '../fraud';

const valid = {
  name: 'Asha',
  email: 'asha@example.com',
  fraudType: 'food_quality' as const,
  description: 'The meal arrived spoiled.',
};

describe('isFraudType', () => {
  it('accepts every value in the server enum', () => {
    FRAUD_TYPES.forEach((t) => expect(isFraudType(t.value)).toBe(true));
  });

  it('rejects a value the schema would reject', () => {
    expect(isFraudType('spam')).toBe(false);
  });
});

describe('isPlausibleEmail', () => {
  it('accepts ordinary addresses', () => {
    expect(isPlausibleEmail('asha@example.com')).toBe(true);
    expect(isPlausibleEmail('a.b+tag@sub.example.co.in')).toBe(true);
  });

  it('rejects obvious typos', () => {
    expect(isPlausibleEmail('asha')).toBe(false);
    expect(isPlausibleEmail('asha@')).toBe(false);
    expect(isPlausibleEmail('@example.com')).toBe(false);
    expect(isPlausibleEmail('asha@example')).toBe(false);
    expect(isPlausibleEmail('a@b@c.com')).toBe(false);
    expect(isPlausibleEmail('asha @example.com')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(isPlausibleEmail('')).toBe(false);
    expect(isPlausibleEmail('   ')).toBe(false);
  });
});

describe('validateFraudReport', () => {
  it('passes a complete report', () => {
    expect(validateFraudReport(valid).valid).toBe(true);
  });

  it('requires a fraud type first', () => {
    const r = validateFraudReport({ ...valid, fraudType: null });
    expect(r.valid).toBe(false);
    expect(r.field).toBe('fraudType');
  });

  it('requires a description', () => {
    const r = validateFraudReport({ ...valid, description: '   ' });
    expect(r.valid).toBe(false);
    expect(r.field).toBe('description');
  });

  it('enforces the schema maxLength on description', () => {
    const r = validateFraudReport({ ...valid, description: 'x'.repeat(MAX_DESCRIPTION + 1) });
    expect(r.valid).toBe(false);
    expect(r.field).toBe('description');
  });

  it('requires a name', () => {
    expect(validateFraudReport({ ...valid, name: '' }).field).toBe('name');
  });

  it('requires a plausible email', () => {
    expect(validateFraudReport({ ...valid, email: 'nope' }).field).toBe('email');
  });

  it('reports problems in reading order so the first fix is the top field', () => {
    // Everything is wrong; the type selector comes first on screen.
    const r = validateFraudReport({ name: '', email: '', fraudType: null, description: '' });
    expect(r.field).toBe('fraudType');
  });
});
