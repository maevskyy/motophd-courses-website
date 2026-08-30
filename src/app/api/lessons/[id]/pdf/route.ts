import { NextResponse } from 'next/server';

import { hasPaidAccess } from '@/lib/access/hasPaidAccess';
import { getCurrentUser } from '@/lib/auth';
import { toAppLocale } from '@/lib/data';
import { getPayloadClient } from '@/lib/data/payload';
import { readMediaObject } from '@/lib/media';
import { consumeRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';
import type { Course, Lesson, Media } from '@/payload-types';

const isLocale = (value: string | null): value is 'en' | 'ru' => value === 'en' || value === 'ru';

const getFilename = (pdf: number | Media | null | undefined) =>
  pdf && typeof pdf === 'object' ? pdf.filename : undefined;

// Тизер открыт всем, но только у опубликованного курса — иначе материалы
// черновика утекают до запуска.
const isPublicPreview = (lesson: Lesson) => {
  const course = lesson.course as number | Course;

  return Boolean(lesson.isFreePreview) && typeof course === 'object' && course.status === 'published';
};

const getInlineDisposition = (filename: string) =>
  `inline; filename*=UTF-8''${encodeURIComponent(filename)}`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const localeParam = new URL(request.url).searchParams.get('locale');

  if (!isLocale(localeParam)) {
    return new NextResponse(null, { status: 404 });
  }

  const [{ id }, user, payload] = await Promise.all([params, getCurrentUser(), getPayloadClient()]);

  // Залогиненных считаем по пользователю, не по IP: за одним NAT сидит
  // много студентов, а выкачивают материалы конкретным аккаунтом.
  const limitDecision = user
    ? consumeRateLimit(`pdf:user:${user.id}`, RATE_LIMITS.pdfUser)
    : consumeRateLimit(`pdf:ip:${getClientIp(request.headers)}`, RATE_LIMITS.pdfAnonIp);

  if (!limitDecision.allowed) {
    return new NextResponse(null, {
      headers: { 'Retry-After': String(limitDecision.retryAfterSec) },
      status: 429
    });
  }

  let lesson: Lesson;

  try {
    lesson = await payload.findByID({
      collection: 'lessons',
      depth: 1,
      // Тот же fallback, что и у getCourseLessons: иначе плеер показывает
      // ссылку (там EN-файл подставился), а роут отвечает 404.
      fallbackLocale: 'en',
      id,
      locale: toAppLocale(localeParam),
      overrideAccess: true
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  const filename = getFilename(lesson.pdf);

  if (!filename) {
    return new NextResponse(null, { status: 404 });
  }

  if (!isPublicPreview(lesson) && (!user || !(await hasPaidAccess(payload, user, lesson.course)))) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    // TODO(F7): apply the purchase email and order number watermark here.
    const body = await readMediaObject(filename);

    return new Response(body, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': getInlineDisposition(filename),
        'Content-Type': 'application/pdf',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
