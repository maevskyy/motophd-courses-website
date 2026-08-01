import { describe, expect, it } from 'vitest';

import { getSafeNextPath } from './redirect';

describe('getSafeNextPath', () => {
  it('keeps an internal path', () => {
    expect(getSafeNextPath('/en/courses/cornering-basics?tab=curriculum', '/en/dashboard')).toBe(
      '/en/courses/cornering-basics?tab=curriculum'
    );
  });

  it.each(['https://example.com', '//example.com', '/%2F%2Fexample.com', '/\\example.com'])(
    'rejects an external path: %s',
    (nextPath) => {
      expect(getSafeNextPath(nextPath, '/en/dashboard')).toBe('/en/dashboard');
    }
  );
});
