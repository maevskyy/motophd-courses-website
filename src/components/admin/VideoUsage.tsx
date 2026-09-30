import type { Payload } from 'payload';

import { findLessonsUsingVideo } from '@/collections/Videos';

interface Props {
  data?: { id?: number | string };
  i18n?: { language?: string };
  payload: Payload;
}

const copy = {
  en: { none: 'Not used in any lesson — safe to delete.', title: 'Used in lessons' },
  ru: { none: 'Ни в одном уроке не стоит — можно удалять.', title: 'Стоит в уроках' }
};

// Перед удалением видно, где видео стоит: удалить используемое не даст
// beforeDelete, а отсюда понятно, какие уроки править.
export async function VideoUsage({ data, i18n, payload }: Props) {
  const id = data?.id;

  if (id === undefined) {
    return null;
  }

  const words = i18n?.language === 'ru' ? copy.ru : copy.en;
  const lessons = await findLessonsUsingVideo(payload, id);

  return (
    <div className="field-type">
      <strong>{words.title}</strong>
      {lessons.length === 0 ? (
        <p>{words.none}</p>
      ) : (
        <ul>
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <a href={`/admin/collections/lessons/${lesson.id}`}>{lesson.label}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
