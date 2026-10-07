import type { Locale } from '@/i18n/locales';

// Валюта одна на весь сайт: цены курсов и регионов — в евро.
export const CURRENCY = 'EUR' as const;

export const paymentTiers = ['standard', 'feedback', 'feedback_upgrade'] as const;

export type PaymentTier = (typeof paymentTiers)[number];

export type CheckoutRequest = {
  amount: number;
  currency: typeof CURRENCY;
  locale: Locale;
  orderReference: string;
  postPaymentToken?: string;
  productName: string;
  clientEmail: string;
};

export type CheckoutResponse = {
  redirectUrl: string;
};

// pending — банк ещё решает (антифрод, 3-D Secure): ни доступа, ни отказа.
export type PaymentState = 'failed' | 'paid' | 'pending';

export type VerifiedCallback = {
  orderReference: string;
  providerTxnId: string;
  status: PaymentState;
  payload: unknown;
};

export interface PaymentProvider {
  name: 'mock' | 'wayforpay';
  buildAck: (callback: VerifiedCallback) => Response;
  createCheckout: (request: CheckoutRequest) => Promise<CheckoutResponse>;
  verifyCallback: (rawBody: string, signature: string | null) => VerifiedCallback | null;
  // Спросить у банка статус заказа самим, не дожидаясь его уведомления.
  // Ответ проверяется так же, как уведомление; null — не удалось узнать.
  checkStatus?: (orderReference: string) => Promise<VerifiedCallback | null>;
}
