import type { FlatLesson, Locale } from './contentSeedData';
import { playerContent } from './fixtures/player';
import type { Course } from './fixtures/types';
import { heading, paragraph, toLexical, toRichText, type LexicalRichText } from './lexical';

type LessonRef = Pick<FlatLesson, 'moduleTitle' | 'name'>;

const headings: Record<Locale, { feel: string; keyPoints: string }> = {
  en: { feel: 'What you should feel', keyPoints: 'Key points' },
  ru: { feel: 'Что ты должен почувствовать', keyPoints: 'Главное' }
};

const intro: Record<Locale, (lesson: LessonRef, copy: string) => string> = {
  en: ({ moduleTitle, name }, copy) => `"${name}" is part of ${moduleTitle}. ${copy}`,
  ru: ({ moduleTitle, name }, copy) => `Урок «${name}» — из блока «${moduleTitle}». ${copy}`
};

// Тело урока для витрины. У курса lean оно собирается из фикстуры плеера
// (overviewCopy / notes / feel) на языке локали; у остальных курсов — заглушка
// из названия модуля и урока, как и раньше.
export const getLessonBody = (
  course: Course,
  lesson: LessonRef,
  locale: Locale
): LexicalRichText => {
  if (course.slug !== 'lean') {
    return toRichText(`${lesson.moduleTitle}\n\n${lesson.name}`);
  }

  const copy = playerContent[locale];
  const titles = headings[locale];

  return toLexical([
    paragraph(intro[locale](lesson, copy.overviewCopy)),
    heading(titles.keyPoints),
    ...copy.notes.map((note) => paragraph(note)),
    heading(titles.feel),
    paragraph(copy.feel)
  ]);
};
