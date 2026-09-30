import { describe, expect, it } from 'vitest';

import { contactPlatform } from './contactPlatform';

describe('contactPlatform', () => {
  it('names the messenger behind the contact link', () => {
    expect(contactPlatform('https://ig.me/m/vladwhite_97')).toBe('Instagram');
    expect(contactPlatform('https://www.instagram.com/vladwhite_97/')).toBe('Instagram');
    expect(contactPlatform('https://t.me/motophd')).toBe('Telegram');
    expect(contactPlatform('https://wa.me/380000000000')).toBe('WhatsApp');
  });

  it('stays generic for other or broken links', () => {
    expect(contactPlatform('https://motophd.com/contact')).toBeNull();
    expect(contactPlatform('not a url')).toBeNull();
    expect(contactPlatform(null)).toBeNull();
  });
});
