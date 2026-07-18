import { redirect } from '@/i18n/routing';

export default function IndexPage() {
  redirect({ href: '/', locale: 'en' });
}
