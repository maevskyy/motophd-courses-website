import { toCountryCode } from './regionalPrice';

/*
  Страна посетителя в браузере. Страницы витрины лежат в кэше и одинаковы
  для всех, поэтому региональную цену выбирает браузер. Страну сообщает сам
  Cloudflare: /cdn-cgi/trace отвечает с его края, до нашего сервера запрос
  не доходит. loc= там — та же страна, что заголовок CF-IPCountry, по
  которому считает цену оплата, так что показанное совпадает со списанным.

  Локально Cloudflare нет — запрос падает, и остаются цены по умолчанию.
*/
const TIMEOUT_MS = 2000;

let pending: Promise<null | string> | undefined;

export const parseTraceCountry = (trace: string) => toCountryCode(/^loc=(.+)$/m.exec(trace)?.[1]);

// Один запрос на страницу, сколько бы цен на ней ни было.
export const detectVisitorCountry = () => {
  pending ??= fetch('/cdn-cgi/trace', {
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS)
  })
    .then((response) => (response.ok ? response.text() : ''))
    .then(parseTraceCountry)
    .catch(() => null);

  return pending;
};
