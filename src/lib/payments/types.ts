export const paymentTiers = ['standard', 'feedback', 'feedback_upgrade'] as const;

export type PaymentTier = (typeof paymentTiers)[number];

export type CheckoutRequest = {
  amount: number;
  currency: 'EUR';
  locale: 'en' | 'ru';
  orderReference: string;
  postPaymentToken?: string;
  productName: string;
  clientEmail: string;
};

export type CheckoutResponse = {
  redirectUrl: string;
};

export type VerifiedCallback = {
  orderReference: string;
  providerTxnId: string;
  status: 'paid' | 'failed';
  payload: unknown;
};

export interface PaymentProvider {
  name: 'mock' | 'wayforpay';
  buildAck: (callback: VerifiedCallback) => Response;
  createCheckout: (request: CheckoutRequest) => Promise<CheckoutResponse>;
  verifyCallback: (rawBody: string, signature: string | null) => VerifiedCallback | null;
}
