import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  replace: vi.fn()
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'uk',
  useTranslations: () => (key: string) => key
}));
vi.mock('@/i18n/routing', () => ({
  usePathname: () => '/courses/lean',
  useRouter: () => ({ replace: mocks.replace })
}));

import { LocaleSelect } from './LocaleSelect';

describe('LocaleSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/uk/courses/lean?tier=feedback');
  });

  it('lists every locale with its code and label, current one selected', () => {
    render(<LocaleSelect />);

    const select = screen.getByRole('combobox', { name: 'language' });

    expect(select).toHaveValue('uk');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'EN — English',
      'RU — Русский',
      'UK — Українська'
    ]);
  });

  it('switches the locale for the same path and keeps the query string', async () => {
    render(<LocaleSelect />);

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'language' }), 'ru');

    expect(mocks.replace).toHaveBeenCalledWith('/courses/lean?tier=feedback', { locale: 'ru' });
  });
});
