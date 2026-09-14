import type { LocalizedContent, PrototypeContent } from './types';

export const playerContent: LocalizedContent<PrototypeContent['player']> = {
  en: {
    title: 'Theory Video — Why Your Bike Can Lean Far More Than You Think',
    subtitle: 'Understanding the physics of lean angle removes fear before you even get on the bike.',
    videoMeta: '10:00 · MotoPhD Online',
    notes: [
      'A motorcycle can lean to ~45° before any hard part touches the ground',
      'Most street riders never exceed 25° — the bike has enormous reserve',
      'Fear of leaning comes from unfamiliarity, not from real danger',
      'Tyres grip through a combination of load and contact patch, not angle alone',
      'Understanding this cognitively is the first step to removing the fear reflex'
    ],
    feel:
      'After this lesson, you should feel that leaning is a controlled, physics-backed action — not a gamble. The goal is to shift your emotional relationship with lean angle before any physical practice begins.',
    overviewTitle: 'Module 1 — Understanding Lean Angle',
    overviewCopy:
      'This module builds the mental foundation for everything that follows. Before you practice any drill, you must understand why the motorcycle behaves the way it does in a corner.',
    moduleOutcome: [
      'Understand the physics of motorcycle lean angle',
      'Know your actual lean angle reserve on a street bike',
      'Identify the #1 cause of corner fear in riders',
      'Be ready to start the first physical drill with confidence'
    ],
    sidebarTitle: 'Stop Being Afraid to Lean'
  },
  ru: {
    title: 'Видео по теории — почему твой мотоцикл может наклоняться гораздо сильнее, чем ты думаешь',
    subtitle:
      'Когда понимаешь физику наклона, страх уходит ещё до того, как ты сел на мотоцикл.',
    videoMeta: '10:00 · MotoPhD Online',
    notes: [
      'Мотоцикл можно наклонить примерно до 45°, прежде чем что-то жёсткое коснётся асфальта',
      'Большинство дорожных райдеров никогда не выходят за 25° — у мотоцикла огромный запас',
      'Страх наклона идёт от непривычки, а не от реальной опасности',
      'Резина держит за счёт нагрузки и пятна контакта, а не одного лишь угла наклона',
      'Понять это головой — первый шаг к тому, чтобы отключить рефлекс страха'
    ],
    feel:
      'После этого урока наклон должен ощущаться как контролируемое действие, за которым стоит физика, а не как лотерея. Задача — поменять твоё отношение к углу наклона ещё до первой практики.',
    overviewTitle: 'Модуль 1 — Понимаем угол наклона',
    overviewCopy:
      'Этот модуль закладывает базу для всего, что будет дальше. Прежде чем браться за любое упражнение, нужно понять, почему мотоцикл в повороте ведёт себя именно так.',
    moduleOutcome: [
      'Понять физику наклона мотоцикла',
      'Узнать свой реальный запас по углу наклона на дорожном мотоцикле',
      'Найти главную причину страха поворотов у райдеров',
      'Быть готовым уверенно начать первое упражнение'
    ],
    sidebarTitle: 'Перестань бояться наклонять мотоцикл'
  }
};
