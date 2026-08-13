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

const labels = { enrollCta: 'Записаться на курс' };

describe('LandingBottom', () => {
  it('renders the final call-to-action label and links to the catalog', () => {
    render(<LandingBottom content={homeContent.ru} labels={labels} />);

    const cta = screen.getByRole('link', { name: 'Записаться на курс' });

    expect(cta).toHaveAttribute('href', '/courses');
  });
});
