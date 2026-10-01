import type { IconName } from '@/components/ui/Icon';

// Плоские сериализуемые DTO для клиентских компонентов кабинета: объекты
// Payload целиком в клиент не уезжают, только то, что нужно разметке.
export interface MyCourseLesson {
  durationSec: number | null;
  hasPdf: boolean;
  order: number;
  title: string;
}

export interface MyCourseModule {
  lessons: MyCourseLesson[];
  number: string;
  title: string;
}

export interface MyCourseData {
  icon: IconName;
  // Обложка курса; нет — на её месте иконка.
  image?: string;
  modules: MyCourseModule[];
  slug: string;
  title: string;
  // Доплата за обратную связь: priceFeedback − priceStandard.
  upgradePrice: number;
}

export type FeedbackStatus = 'connected' | 'upgrade';
