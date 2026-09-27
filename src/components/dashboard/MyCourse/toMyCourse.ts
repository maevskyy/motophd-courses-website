import type { AppLocale } from '@/lib/data';
// Адаптеры напрямую, не через баррель: тот тянет Payload-клиент, а маппер
// чистый и нужен в тестах.
import { toCourseCardCourse, toCurriculumModules } from '@/lib/data/adapters';
import { lessonOrder } from '@/lib/progress';
import type { Course, Lesson } from '@/payload-types';
import type { MyCourseData, MyCourseLesson, MyCourseModule } from './MyCourse.types';

const toLesson = (lesson: Lesson): MyCourseLesson => ({
  durationSec: lesson.durationSec ?? null,
  hasPdf: Boolean(lesson.pdf),
  order: lessonOrder(lesson),
  title: lesson.title
});

// Модули берём из toCurriculumModules (та же разбивка, что на странице
// продажи), а уроки к ним режем сами: витринный адаптер отдаёт только имена,
// без `order`, а кабинету нужны ссылки в плеер и прогресс.
const toModules = (course: Course, lessons: Lesson[], locale: AppLocale): MyCourseModule[] => {
  const sorted = [...lessons].sort((a, b) => lessonOrder(a) - lessonOrder(b));
  let cursor = 0;

  return toCurriculumModules(course, sorted, locale).map((module) => {
    const moduleLessons = sorted.slice(cursor, cursor + module.lessons.length);
    cursor += module.lessons.length;

    return {
      lessons: moduleLessons.map(toLesson),
      number: module.number,
      title: module.title
    };
  });
};

export const toMyCourse = (
  course: Course,
  lessons: Lesson[],
  locale: AppLocale,
  index?: number
): MyCourseData => ({
  currency: course.currency,
  icon: toCourseCardCourse(course, index).icon,
  modules: toModules(course, lessons, locale),
  slug: course.slug,
  title: course.title,
  upgradePrice: Math.max(0, course.priceFeedback - course.priceStandard)
});
