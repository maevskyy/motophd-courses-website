import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it } from 'vitest';
import { ConsentClient } from './ConsentClient';
import { CONSENT_COOKIE_NAME, type TrackingConfig } from './consentConfig';

const messages = {
  consent: {
    acceptAll: 'Accept all',
    change: 'Cookie settings',
    description: 'Optional analytics cookies.',
    necessaryOnly: 'Necessary only',
    title: 'Your privacy matters'
  }
};

const trackingConfig: TrackingConfig = {
  ga4Id: 'G-TEST123',
  metaPixelId: '123456789'
};

function renderConsent() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ConsentClient initialDecision={null} trackingConfig={trackingConfig} />
    </NextIntlClientProvider>
  );
}

afterEach(() => {
  document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/`;
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
});
