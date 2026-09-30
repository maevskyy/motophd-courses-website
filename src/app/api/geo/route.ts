import { getVisitorCountry } from '@/lib/pricing/visitorCountry';

export const dynamic = 'force-dynamic';

// Какую страну сайт видит у посетителя — по ней выбирается региональная цена.
// Для проверки: открыть https://motophd.com/api/geo с VPN нужной страны.
export async function GET() {
  return Response.json({ country: await getVisitorCountry() });
}
