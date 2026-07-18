import type { Course, LocalizedContent } from './types';

const coursesEn: Course[] = [
  {
    slug: 'lean',
    icon: '🏍️',
    badge: 'Flagship',
    imageTone: 'red',
    featured: true,
    pain: 'Fear → Confidence',
    title: 'Stop Being Afraid to Lean Your Motorcycle',
    description:
      'Learn why your motorcycle can lean far more than you think — and gain the confidence to corner safely, smoothly and consistently.',
    includes: [
      '1 Theory PDF (5–6 pages)',
      '1 Theory Video (10 min)',
      '3 Practice Videos (5 min each)',
      'Lifetime access'
    ]
  },
  {
    slug: 'counter-steering',
    icon: '⚡',
    imageTone: 'green',
    pain: 'Confusion → Mastery',
    title: 'Counter Steering',
    description:
      'Master the technique that separates confident riders from anxious ones. Understand exactly what your hands do in a corner.',
    includes: [
      'Theory explanation',
      'Control drills',
      'Common mistakes guide',
      'Lifetime access'
    ]
  },
  {
    slug: 'emergency-braking',
    icon: '🛑',
    imageTone: 'blue',
    pain: 'Panic → Control',
    title: 'Emergency Braking',
    description:
      'Build the muscle memory and mental framework to stop your motorcycle correctly, safely, every single time.',
    includes: [
      'Braking fundamentals',
      'Practice drills',
      'Mistake checklist',
      'Lifetime access'
    ]
  }
];

const coursesRu: Course[] = [
  {
    slug: 'lean',
    icon: '🏍️',
    badge: 'Флагман',
    imageTone: 'red',
    featured: true,
    pain: 'Страх → Уверенность',
    title: 'Перестань бояться наклонять мотоцикл',
    description:
      'Узнай, почему твой мотоцикл может наклоняться гораздо больше, чем ты думаешь — и научись проходить повороты уверенно, плавно и стабильно.',
    includes: [
      '1 PDF с теорией (5–6 страниц)',
      '1 видео с теорией (10 мин)',
      '3 практических видео (по 5 мин)',
      'Доступ навсегда'
    ]
  },
  {
    slug: 'counter-steering',
    icon: '⚡',
    imageTone: 'green',
    pain: 'Растерянность → Мастерство',
    title: 'Контрруление',
    description:
      'Освой технику, которая отличает уверенных райдеров от нервных. Пойми, что именно делают твои руки в повороте.',
    includes: ['Теория', 'Упражнения', 'Частые ошибки', 'Доступ навсегда']
  },
  {
    slug: 'emergency-braking',
    icon: '🛑',
    imageTone: 'blue',
    pain: 'Паника → Контроль',
    title: 'Экстренное торможение',
    description:
      'Выработай мышечную память и правильный алгоритм действий, чтобы тормозить правильно, безопасно — каждый раз.',
    includes: ['Основы торможения', 'Практические дрилы', 'Чеклист ошибок', 'Доступ навсегда']
  }
];

export const localizedCourses: LocalizedContent<Course[]> = {
  en: coursesEn,
  ru: coursesRu
};
