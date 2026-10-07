// Запускается один раз при старте сервера Next.
export async function register() {
  // Проверка ровно в такой форме: по ней Next выкидывает импорт из сборки
  // для edge, где Payload и node:crypto не собираются.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Досверка зависших оплат; без настоящего банка (mock) не запускается.
    const { startPaymentReconciler } = await import('./lib/payments/paymentStatus');

    startPaymentReconciler();
  }
}
