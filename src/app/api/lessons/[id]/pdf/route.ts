import { NextResponse } from 'next/server';

import { hasPaidAccess } from '@/lib/access/hasPaidAccess';
import { getCurrentUser } from '@/lib/auth';
import { toAppLocale } from '@/lib/data';
import { getPayloadClient } from '@/lib/data/payload';
import { readMediaObject } from '@/lib/media';
import type { Media } from '@/payload-types';

const isLocale = (value: string | null): value is 'en' | 'ru' => value === 'en' || value === 'ru';

const getFilename = (pdf: number | Media | null | undefined) =>
  pdf && typeof pdf === 'object' ? pdf.filename : undefined;

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
  let lesson;

  try {
    lesson = await payload.findByID({
      collection: 'lessons',
      depth: 1,
      fallbackLocale: false,
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

  if (!lesson.isFreePreview && (!user || !(await hasPaidAccess(payload, user, lesson.course)))) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    // TODO(F7): apply the purchase email and order number watermark here.
    const body = await readMediaObject(filename);

    return new Response(body, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': getInlineDisposition(filename),
        'Content-Type': 'application/pdf'
      }
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
