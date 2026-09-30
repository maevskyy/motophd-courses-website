import { describe, expect, it } from 'vitest';

import { parseTraceCountry } from './visitorCountryClient';

describe('parseTraceCountry', () => {
  it('reads the country Cloudflare reports in /cdn-cgi/trace', () => {
    expect(parseTraceCountry('fl=29f1\nh=motophd.com\nip=1.2.3.4\nloc=GE\ncolo=TBS\n')).toBe('GE');
  });

  it('gives no country for unknown, Tor or a missing line', () => {
    expect(parseTraceCountry('loc=XX\n')).toBeNull();
    expect(parseTraceCountry('loc=T1\n')).toBeNull();
    expect(parseTraceCountry('')).toBeNull();
  });
});
