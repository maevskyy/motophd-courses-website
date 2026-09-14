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

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

describe('LandingBottom', () => {
  it('закрывает страницу единственным главным действием', () => {
    render(<LandingBottom content={homeContent.en} labels={{ startLearning: 'Start Learning' }} />);

    const cta = screen.getByRole('link', { name: 'Start Learning' });

    expect(cta).toHaveAttribute('href', '/courses');
    // Один primary на экран: в закрывающем блоке ровно одна ссылка-действие.
    expect(screen.getAllByRole('link', { name: 'Start Learning' })).toHaveLength(1);
  });

  it('описывает шаги обучения как результат, а не как покупку', () => {
    render(<LandingBottom content={homeContent.ru} labels={{ startLearning: 'Начать обучение' }} />);

    expect(screen.queryByText(/оплат|доступ к курсу/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Ты читаешь мотоцикл/)).toBeInTheDocument();
  });
});
