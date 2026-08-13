import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { homeContent } from '@/lib/content';
import { LandingBottom } from './LandingBottom';

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

describe('LandingBottom', () => {
  it('renders the community call-to-action when a label is provided', () => {
    render(<LandingBottom content={homeContent.en} labels={{ joinCommunity: 'Join our MotoPhD Community' }} />);

    expect(screen.getByRole('link', { name: 'Join our MotoPhD Community' })).toBeInTheDocument();
  });

  it('renders nothing when the community label is empty', () => {
    render(<LandingBottom content={homeContent.ru} labels={{ joinCommunity: '' }} />);

    expect(screen.queryByRole('link', { name: /community|сообществ/i })).not.toBeInTheDocument();
  });
});
