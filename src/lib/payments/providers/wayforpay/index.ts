import type { PaymentProvider } from '../../types';

export const wayForPayProvider: PaymentProvider = {
  name: 'wayforpay',
  buildAck: () => Response.json({ ok: true }),
  createCheckout: () => {
    throw new Error('WayForPay provider is not implemented yet');
  },
  verifyCallback: () => null
};
