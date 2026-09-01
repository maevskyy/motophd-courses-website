import { mockProvider } from './providers/mock';
import { wayForPayProvider } from './providers/wayforpay';
import type { PaymentProvider } from './types';

export const getPaymentProvider = (): PaymentProvider | null => {
  if (process.env.PAYMENTS_PROVIDER === 'mock') {
    return mockProvider;
  }

  if (process.env.PAYMENTS_PROVIDER === 'wayforpay') {
    return wayForPayProvider;
  }

  return null;
};
