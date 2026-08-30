import { redirect } from 'next/navigation';

// Именно next/navigation: redirect из next-intl читает requestLocale
// (headers) даже при явной locale, а эта страница статическая — на проде
// такой вызов ронял рантайм («static to dynamic at runtime»).
export default function IndexPage() {
  redirect('/en');
}
