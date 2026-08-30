# WayForPay: проверенные факты живого API (2026-08-20)

Проверено реальными запросами к `POST https://api.wayforpay.com/api` на публичном
демо-мерчанте `test_merch_n1` (ключ — на официальной странице
[Test details](https://wiki.wayforpay.com/en/view/852472)). Эти факты **надёжнее печатной
документации** — использовать их при реализации и в тестах.

## Подтверждённые строки подписи (HMAC-MD5, UTF-8, `;`)

- `CREATE_INVOICE`: `merchantAccount;merchantDomainName;orderReference;orderDate;amount;currency;productName[0];…;productCount[0];…;productPrice[0];…`
- `CHECK_STATUS` / `REMOVE_INVOICE` (запрос): `merchantAccount;orderReference`
- Подпись ответа `CHECK_STATUS`: `merchantAccount;orderReference;amount;currency;authCode;cardPan;transactionStatus;reasonCode` —
  **пустые поля участвуют как пустые строки** (`…;;;;;Declined;1151`), сверено бит-в-бит.

## Грабли, подтверждённые запросами

1. **Ошибки приходят с HTTP 200.** Статус HTTP не значит ничего — парсить только `reasonCode`.
2. **Битая подпись = `reasonCode:1113`** («Invalid signature»), не 1109. 1109 — ошибка формата.
3. **`amount` подписывается литералом из JSON.** В подписи `100.00`, в теле `100` → 1113.
   Сериализовать в строку подписи ровно тот же литерал, что уходит в тело.
4. **Повтор `orderReference` → 1112, но БЕЗ идемпотентности:** повторный CREATE того же
   тела возвращает `invoiceUrl: null`. Сохранять `invoiceUrl` при первом ответе; ретраи —
   через `CHECK_STATUS`, никогда через повторный CREATE.
5. **До оплаты `CHECK_STATUS` отдаёт `transactionStatus:"Declined"` при `reasonCode:1151`**
   («Invoice Is Awaiting For Payment»). Статус инвойса определять по `reasonCode`,
   `transactionStatus` до оплаты — ловушка. Пустые поля — `""`, не `null`;
   `refundAmount`/`settlementAmount`/`fee` — `0`.
6. **Несуществующий заказ → 1127** («Order Not Found»), структура ответа та же, подпись валидна.
7. **Неизвестный `merchantAccount` → 1118 «Merchant Restriction»** — маскируется под
   ограничение мерчанта; в мониторинге 1118 = и «лимиты», и «опечатка в аккаунте».
8. **EUR принимается на создание счёта** демо-мерчантом (1100 Ok). Прохождение реальной
   оплаты в EUR — проверяется только боевым мерчантом.
9. **`REMOVE_INVOICE` работает** (1100 «Removed») — годится для отмены просроченных заказов.
10. **Контрольный пример подписи в доке не воспроизводится** — алгоритм сверять по живому
    API, не по печатным примерам (это согласуется с находкой грум-задачи о недостоверности
    примеров).

## Непроверяемое без боевого/личного мерчанта

serviceUrl-колбэк фактической оплаты (формат/подпись), жизненный цикл статусов после
оплаты (1151 → Approved), Purchase-форма `secure.wayforpay.com/pay` (3DS, holdTimeout),
Refund/Settle, реальный EUR-платёж и вид `settlementAmount` после конвертации.
