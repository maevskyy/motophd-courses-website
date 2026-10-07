'use client';

import { useEffect } from 'react';

import { useRouter } from '@/i18n/routing';
import type { PaymentState } from '@/lib/payments/types';

const FAST_POLL_MS = 3000;
const SLOW_POLL_MS = 15_000;
const FAST_FOR_MS = 3 * 60 * 1000;
const GIVE_UP_AFTER_MS = 60 * 60 * 1000;

interface Props {
  order: string;
  token?: string;
}

// Ждёт решения банка и переводит на «оплата прошла» или «не прошла».
// Сервер на каждый опрос сам спрашивает банк, так что страница узнаёт
// об одобрении через секунды, даже если уведомление банка задержалось.
export function PaymentStatusWatcher({ order, token }: Props) {
  const router = useRouter();

  useEffect(() => {
    const startedAt = Date.now();
    const query = new URLSearchParams({ order });
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    if (token) {
      query.set('t', token);
    }

    const poll = async () => {
      try {
        const response = await fetch(`/api/payments/status?${query.toString()}`, {
          cache: 'no-store'
        });
        const { signedIn, state } = (await response.json()) as {
          signedIn: boolean;
          state: PaymentState;
        };

        if (stopped) {
          return;
        }

        if (state === 'paid') {
          router.replace(
            `/checkout/success?order=${encodeURIComponent(order)}${signedIn ? '&signedIn=1' : ''}`
          );
          return;
        }

        if (state === 'failed') {
          router.replace(`/checkout/fail?order=${encodeURIComponent(order)}`);
          return;
        }
      } catch {
        // сеть моргнула — спросим в следующий раз
      }

      const elapsed = Date.now() - startedAt;

      if (!stopped && elapsed < GIVE_UP_AFTER_MS) {
        timer = setTimeout(poll, elapsed < FAST_FOR_MS ? FAST_POLL_MS : SLOW_POLL_MS);
      }
    };

    void poll();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [order, router, token]);

  return null;
}
