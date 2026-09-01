import { fulfilPayment, getPaymentProvider } from '@/lib/payments';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerName } = await params;
  const provider = getPaymentProvider();

  if (!provider || provider.name !== providerName) {
    return Response.json({ error: 'Unknown provider' }, { status: 404 });
  }

  const rawBody = await request.text();
  const callback = provider.verifyCallback(rawBody, request.headers.get('x-payment-signature'));

  if (!callback) {
    return Response.json({ error: 'Invalid callback signature' }, { status: 400 });
  }

  await fulfilPayment(callback);

  return provider.buildAck(callback);
}
