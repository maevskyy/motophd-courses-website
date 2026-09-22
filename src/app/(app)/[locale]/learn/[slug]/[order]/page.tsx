import { CoursePlayerClient } from '@/components/player/CoursePlayerClient';
import { loadPlayerPage } from '../loadPlayerPage';

export const dynamic = 'force-dynamic';

// Канонический адрес урока: /learn/[slug]/[order] (см. lessonHref).
export default async function LessonPage({
  params
}: {
  params: Promise<{ slug: string; locale: string; order: string }>;
}) {
  const { locale, order, slug } = await params;
  const { activeOrder, player } = await loadPlayerPage({ locale, order, slug });

  return <CoursePlayerClient activeOrder={activeOrder} player={player} />;
}
