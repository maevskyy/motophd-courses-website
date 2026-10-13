import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CommunityCard } from './CommunityCard';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key} ${JSON.stringify(values)}` : key
}));

describe('CommunityCard', () => {
  it.each([
    ['ru', 'Telegram', 'https://t.me/+eQkRWmxpVdo0OTM0'],
    ['uk', 'Telegram', 'https://t.me/+eQkRWmxpVdo0OTM0'],
    ['en', 'Facebook', 'https://www.facebook.com/groups/1650061726661261/']
  ] as const)('на %s ведёт в %s, в новой вкладке', (locale, platform, url) => {
    render(<CommunityCard locale={locale} />);

    const link = screen.getByRole('link', {
      name: `communityJoin ${JSON.stringify({ platform })}`
    });

    expect(link).toHaveAttribute('href', url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
