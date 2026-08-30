import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConsentClient } from './ConsentClient';
import { CONSENT_CHANGE_EVENT, CONSENT_COOKIE_NAME, type TrackingConfig } from './consentConfig';

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

const messages = {
  consent: {
    acceptAll: 'Accept all',
    change: 'Cookie settings',
    description: 'Optional analytics and advertising cookies.',
    necessaryOnly: 'Necessary only',
    privacyLink: 'Privacy Policy',
    title: 'Your privacy matters'
  }
};

const trackingConfig: TrackingConfig = {
  ga4Id: 'G-TEST123',
  metaPixelId: '123456789'
};

const granted = {
  ad_personalization: 'granted',
  ad_storage: 'granted',
  ad_user_data: 'granted',
  analytics_storage: 'granted'
};

const denied = {
  ad_personalization: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  analytics_storage: 'denied'
};

function renderConsent(initialDecision: 'accepted' | 'necessary' | null = null) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ConsentClient initialDecision={initialDecision} trackingConfig={trackingConfig} />
    </NextIntlClientProvider>
  );
}

afterEach(() => {
  document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/`;
  window.dataLayer = [];
  vi.restoreAllMocks();
});

describe('ConsentClient', () => {
  it('renders the banner when analytics are configured and there is no decision', () => {
    renderConsent();

    expect(screen.getByRole('dialog', { name: 'Your privacy matters' })).toBeInTheDocument();
  });

  it('persists a necessary-only decision without inserting tracker scripts', async () => {
    const user = userEvent.setup();
    renderConsent();

    await user.click(screen.getByRole('button', { name: 'Necessary only' }));

    expect(document.cookie).toContain(`${CONSENT_COOKIE_NAME}=necessary`);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
    expect(document.documentElement.innerHTML).not.toContain('connect.facebook');
  });

  it('grants Google consent only after the visitor accepts', async () => {
    const user = userEvent.setup();
    renderConsent();

    await user.click(screen.getByRole('button', { name: 'Accept all' }));

    expect(document.cookie).toContain(`${CONSENT_COOKIE_NAME}=accepted`);
    expect(window.dataLayer).toContainEqual(['consent', 'update', granted]);
  });

  it('reopens the banner when the footer asks for the cookie settings', async () => {
    renderConsent('accepted');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));

    expect(await screen.findByRole('dialog', { name: 'Your privacy matters' })).toBeInTheDocument();
  });

  it('denies Google consent and reloads when the visitor withdraws it', async () => {
    const reload = vi.fn();

    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      protocol: 'http:',
      reload
    } as unknown as Location);

    const user = userEvent.setup();
    renderConsent('accepted');

    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
    await user.click(await screen.findByRole('button', { name: 'Necessary only' }));

    expect(window.dataLayer).toContainEqual(['consent', 'update', denied]);
    expect(reload).toHaveBeenCalled();
  });
});
