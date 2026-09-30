import { headers } from 'next/headers';

import { toCountryCode } from './regionalPrice';

// Отдельно от regionalPrice.ts: next/headers нельзя тянуть в код, который
// импортирует конфиг Payload и тесты без Next.
export const getVisitorCountry = async () => toCountryCode((await headers()).get('cf-ipcountry'));
