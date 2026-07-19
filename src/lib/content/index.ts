import type { LocalizedContent, HomeContent } from './types';
import { homeEn } from './home.en';
import { homeRu } from './home.ru';

export type { HomeContent, LocalizedContent } from './types';

export const homeContent: LocalizedContent<HomeContent> = {
  en: homeEn,
  ru: homeRu
};
