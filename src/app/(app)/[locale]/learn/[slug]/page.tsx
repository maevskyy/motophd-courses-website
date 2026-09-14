import { CoursePlayerClient } from '@/components/player/CoursePlayerClient';
import { loadPlayerPage } from './loadPlayerPage';

export const dynamic = 'force-dynamic';

// Без урока в URL: показываем следующий непройденный (клиент решает по
// localStorage), адрес не меняем — его ждёт e2e и ссылка «Продолжить».
export default async function CoursePlayerPage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { locale, slug } = await params;
  const { activeOrder, curriculum, player } = await loadPlayerPage({ locale, slug });

  return <CoursePlayerClient activeOrder={activeOrder} curriculum={curriculum} player={player} />;
}
