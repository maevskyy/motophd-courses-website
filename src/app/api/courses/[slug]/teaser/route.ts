import { NextResponse } from 'next/server';

import { isLocale } from '@/i18n/locales';
import { getCourseBySlug } from '@/lib/data';
import { getPayloadClient } from '@/lib/data/payload';
import { getPlaybackUrl, lessonPosterUrl } from '@/lib/video';

export const dynamic = 'force-dynamic';

const notFound = () => new NextResponse(null, { status: 404 });

// Ссылка на трейлер для кнопки play на странице курса. Страница живёт в кэше
// (ISR + Cloudflare) дольше, чем бесплатный токен Stream, поэтому токен
// выдаётся здесь, в момент нажатия. На входе slug курса, а не id видео:
// подписать можно только выбранный у курса трейлер, а не видео урока.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const locale = new URL(request.url).searchParams.get('locale');

  if (!isLocale(locale)) {
    return notFound();
  }

  const { slug } = await params;
  // Тот же кэш опубликованных курсов и тот же фолбэк языков, что у страницы:
  // раз кнопка показана, трейлер здесь найдётся.
  const course = await getCourseBySlug(slug, locale);
  const teaser = course?.teaser;
  const teaserId = teaser && typeof teaser === 'object' ? teaser.id : teaser;

  if (!course || !teaserId) {
    return notFound();
  }

  const payload = await getPayloadClient();
  // Видео читают только админы — аноним видит у курса лишь id трейлера.
  const video = await payload.findByID({
    collection: 'videos',
    depth: 0,
    disableErrors: true,
    id: teaserId,
    overrideAccess: true
  });
  const url = getPlaybackUrl(video?.streamUid, { free: true, poster: lessonPosterUrl(course) });

  if (!url) {
    return notFound();
  }

  return NextResponse.json({ url }, { headers: { 'Cache-Control': 'no-store' } });
}
