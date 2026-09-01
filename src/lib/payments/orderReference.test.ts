import { describe, expect, it } from 'vitest';

import { createOrderReference, isOrderReference } from './orderReference';

describe('order references', () => {
  it('generates references from the provider-safe alphabet', () => {
    const reference = createOrderReference();

    expect(isOrderReference(reference)).toBe(true);
    expect(reference).not.toContain(';');
  });

  it('rejects unsafe provider delimiters', () => {
    expect(isOrderReference('order;123')).toBe(false);
  });
});
