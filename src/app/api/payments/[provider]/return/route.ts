import { NextResponse } from 'next/server';

const toLocale = (value: string | null) => (value === 'ru' ? 'ru' : 'en');

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const body = await request.formData();
  const locale = toLocale(new URL(request.url).searchParams.get('locale'));
  const orderReference = String(body.get('orderReference') || '');
  const status = body.get('status') === 'paid' ? 'success' : 'fail';
  const url = new URL(`/${locale}/checkout/${status}`, request.url);

  url.searchParams.set('provider', provider);

  if (orderReference) {
    url.searchParams.set('order', orderReference);
  }

  return NextResponse.redirect(url, 303);
}
