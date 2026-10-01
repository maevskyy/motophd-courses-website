import { describe, expect, it } from 'vitest';

import { stampPaidAt } from './Purchases';

const run = (data: Record<string, unknown>, originalDoc?: Record<string, unknown>) =>
  stampPaidAt({ data, originalDoc } as never) as Record<string, unknown>;

describe('stampPaidAt', () => {
  it('dates a purchase the admin marks paid', () => {
    expect(run({ status: 'paid' }).paidAt).toEqual(expect.any(String));
    expect(run({ status: 'paid' }, { status: 'pending' }).paidAt).toEqual(expect.any(String));
  });

  it('keeps the date the payment flow wrote and leaves other statuses alone', () => {
    expect(run({ paidAt: '2026-09-30T10:00:00.000Z', status: 'paid' }).paidAt).toBe(
      '2026-09-30T10:00:00.000Z'
    );
    expect(run({ status: 'paid' }, { status: 'paid' }).paidAt).toBeUndefined();
    expect(run({ status: 'refunded' }).paidAt).toBeUndefined();
  });
});
