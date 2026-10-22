import { describe, expect, it } from 'vitest';

import { buildHomeStructuredData, serializeJsonLd } from './structuredData';

describe('buildHomeStructuredData', () => {
  it('называет сайт брендом MotoPhD и ведёт на корень домена', () => {
    const data = buildHomeStructuredData('ru', 'https://motophd.com');
    const [website, organization] = data['@graph'];

    expect(website).toMatchObject({
      '@type': 'WebSite',
      inLanguage: 'ru',
      name: 'MotoPhD',
      url: 'https://motophd.com/'
    });
    expect(organization).toMatchObject({
      '@type': 'Organization',
      logo: 'https://motophd.com/logo.png',
      name: 'MotoPhD',
      url: 'https://motophd.com/'
    });
    expect(organization.sameAs).toContain('https://www.instagram.com/motophd/');
    expect(organization.sameAs).not.toContain('https://www.instagram.com/vladwhite_97/');
  });
});

describe('serializeJsonLd', () => {
  it('не даёт строке в данных закрыть тег script', () => {
    const json = serializeJsonLd({ name: '</script><script>alert(1)</script>' });

    expect(json).not.toContain('</script>');
    expect(JSON.parse(json).name).toBe('</script><script>alert(1)</script>');
  });
});
