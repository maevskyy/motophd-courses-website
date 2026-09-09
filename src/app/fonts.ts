import { Inter, Unbounded } from 'next/font/google';

/*
  Две гарнитуры на весь сайт (правило дизайн-системы):
  Unbounded — только крупные заголовки и фирменные цифры,
  Inter — весь интерфейс и основной текст.
  Раньше Unbounded стоял и на теле текста: на 13–16px он читается тяжело и
  давал ощущение «много разных шрифтов».
*/
export const unbounded = Unbounded({
  display: 'swap',
  subsets: ['latin', 'cyrillic'],
  variable: '--font-unbounded',
  weight: ['600', '700']
});

export const inter = Inter({
  display: 'swap',
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700']
});

export const fontClassName = `${unbounded.variable} ${inter.variable}`;
