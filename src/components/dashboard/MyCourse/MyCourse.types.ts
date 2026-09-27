import type { IconName } from '@/components/ui/Icon';
import type { Course } from '@/payload-types';

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
  currency: Course['currency'];
  icon: IconName;
  modules: MyCourseModule[];
  slug: string;
  title: string;
  // Доплата за обратную связь: priceFeedback − priceStandard.
  upgradePrice: number;
}

export type FeedbackStatus = 'connected' | 'upgrade';
