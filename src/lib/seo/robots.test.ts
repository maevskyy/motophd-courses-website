import { describe, expect, it } from 'vitest';

import { buildRobots } from './robots';

describe('buildRobots', () => {
  const robots = buildRobots('https://motophd.com');
  const rule = Array.isArray(robots.rules) ? robots.rules[0] : robots.rules;

  it('points at the absolute sitemap url', () => {
    expect(robots.sitemap).toBe('https://motophd.com/sitemap.xml');
  });

  it('closes admin, api and every private locale section for all bots', () => {
    expect(rule?.userAgent).toBe('*');
    expect(rule?.disallow).toEqual([
      '/admin',
      '/api',
      '/en/checkout',
      '/en/login',
      '/en/dashboard',
      '/en/feedback',
      '/en/learn',
      '/ru/checkout',
      '/ru/login',
      '/ru/dashboard',
      '/ru/feedback',
      '/ru/learn'
    ]);
  });

  it('keeps public media files reachable so social previews can load course covers', () => {
    expect(rule?.allow).toEqual(['/', '/api/media/file/']);
  });
});
