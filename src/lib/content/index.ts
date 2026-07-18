import type { LocalizedContent, PrototypeContent } from './types';
import { coursesPageContent, salesContent } from './coursePages';
import { dashboardContent } from './dashboard';
import { homeEn } from './home.en';
import { homeRu } from './home.ru';
import { playerContent } from './player';

export { curriculum } from './curriculum';
export { localizedCourses } from './courses';
export type { Course, CurriculumModule, HomeContent, PrototypeContent } from './types';

export const prototypeContent: LocalizedContent<PrototypeContent> = {
  en: {
    home: homeEn,
    courses: coursesPageContent.en,
    sales: salesContent.en,
    dashboard: dashboardContent.en,
    player: playerContent
  },
  ru: {
    home: homeRu,
    courses: coursesPageContent.ru,
    sales: salesContent.ru,
    dashboard: dashboardContent.ru,
    player: playerContent
  }
};
