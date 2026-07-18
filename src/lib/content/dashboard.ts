import type { LocalizedContent, PrototypeContent } from './types';

export const dashboardContent: LocalizedContent<PrototypeContent['dashboard']> = {
  en: {
    studentName: 'Demo Student',
    studentEmail: 'demo@motophd.com',
    downloads: [
      { name: 'Lean Angle & Physics — Theory Guide', size: 'PDF · 5–6 pages · Watermarked' },
      { name: 'Practice Drill Sheets — Module 3', size: 'PDF · Exercise guide · Watermarked' }
    ]
  },
  ru: {
    studentName: 'Demo Student',
    studentEmail: 'demo@motophd.com',
    downloads: [
      { name: 'Lean Angle & Physics — Theory Guide', size: 'PDF · 5–6 страниц · Watermarked' },
      { name: 'Practice Drill Sheets — Module 3', size: 'PDF · Упражнения · Watermarked' }
    ]
  }
};
