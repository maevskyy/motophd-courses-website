import type { CurriculumModule } from './types';

export const curriculum: CurriculumModule[] = [
  {
    number: '1',
    title: 'Understanding Lean Angle',
    meta: '1 PDF · 1 video (10 min) · Theory foundation',
    open: true,
    lessons: [
      { icon: '📄', name: 'Theory PDF — Lean Angle & Physics', duration: '5–6 pages' },
      {
        icon: '🎥',
        name: 'Theory Video — Why Your Bike Can Lean Far More',
        duration: '10 min'
      },
      { icon: '⚠️', name: 'Common Mistakes: What Most Riders Get Wrong', duration: 'Reading' }
    ]
  },
  {
    number: '2',
    title: 'Understanding Grip',
    meta: '1 PDF · 1 video · Grip awareness training',
    lessons: [
      { icon: '📄', name: 'Theory PDF — Grip & Contact Patch', duration: '5 pages' },
      { icon: '🎥', name: 'Theory Video — How Tyres Actually Hold You', duration: '10 min' }
    ]
  },
  {
    number: '3',
    title: 'Practice Drills — Building Lean Confidence',
    meta: '3 practice videos · PDF drill sheets',
    lessons: [
      { icon: '🎥', name: 'Drill 1 — First Lean Exercise (Parking Lot)', duration: '5 min' },
      { icon: '🎥', name: 'Drill 2 — Progressive Lean Progression', duration: '5 min' },
      { icon: '🎥', name: 'Drill 3 — Corner Entry Confidence', duration: '5 min' },
      { icon: '📄', name: 'Drill Sheets PDF', duration: 'Exercises' }
    ]
  },
  {
    number: '4',
    title: 'Applying It on the Road',
    meta: 'Real-world application framework',
    lessons: [
      { icon: '🎥', name: 'From Parking Lot to Real Corners', duration: '5 min' },
      { icon: '📄', name: 'What You Should Now Feel — Checklist', duration: 'PDF' }
    ]
  }
];
