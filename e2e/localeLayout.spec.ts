import { expect, test } from '@playwright/test';

/*
  Каркас лендинга не должен зависеть от языка.

  Русский текст системно длиннее английского на 20-30%, и пока высоту блоков
  задавала длина фразы, при переключении EN/RU уезжала вся композиция: хиро
  на RU был на 134px выше, статистика оказывалась за первым экраном. Высоту
  держат слоты текста (lines-reserve / text-slot в src/styles/_mixins.scss), а
  у шапки фиксированы только правый край CTA и её высота.
*/

const STRICT_WIDTHS = [1440, 1024, 768];
const ALL_WIDTHS = [...STRICT_WIDTHS, 390];
const TOLERANCE = 4;

type Frame = {
  heroHeight: number;
  ctaRight: number;
  headerHeight: number;
  sectionTops: number[];
  scrollWidth: number;
  clientWidth: number;
};

async function readFrame(page: import('@playwright/test').Page, path: string): Promise<Frame> {
  await page.goto(path, { waitUntil: 'networkidle' });

  return page.evaluate(() => {
    const sections = [...document.querySelectorAll('main section, body > section')];
    const hero = sections[0];
    const navLinks = [...document.querySelectorAll('header nav a')]
      .filter((el) => el.getBoundingClientRect().width > 0)
    const cta = navLinks.at(-1);
    const header = document.querySelector('header');

    return {
      heroHeight: hero ? Math.round(hero.getBoundingClientRect().height) : 0,
      ctaRight: cta ? Math.round(cta.getBoundingClientRect().right) : 0,
      headerHeight: header ? Math.round(header.getBoundingClientRect().height) : 0,
      sectionTops: sections.map((el) =>
        Math.round(el.getBoundingClientRect().top + window.scrollY)
      ),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    };
  });
}

test.describe('композиция лендинга не зависит от локали', () => {
  for (const width of ALL_WIDTHS) {
    test(`ширина ${width}px: шапка и первый экран совпадают на EN, RU и UK`, async ({
      baseURL,
      page
    }) => {
      // Cookie-баннер прячем заранее, иначе он попадает в промеры. Адрес — из
      // конфига: до первого goto страница пустая (about:blank), куку на неё не поставить.
      await page.context().addCookies([
        { name: 'motophd_consent', value: 'necessary', url: baseURL ?? 'http://127.0.0.1:3100' }
      ]);
      await page.setViewportSize({ width, height: 900 });

      const en = await readFrame(page, '/en');
      const ru = await readFrame(page, '/ru');
      const uk = await readFrame(page, '/uk');

      // Горизонтального скролла нет ни на одной локали и ни на одной ширине.
      expect(en.scrollWidth, `EN overflow at ${width}`).toBeLessThanOrEqual(en.clientWidth);
      expect(ru.scrollWidth, `RU overflow at ${width}`).toBeLessThanOrEqual(ru.clientWidth);
      expect(uk.scrollWidth, `UK overflow at ${width}`).toBeLessThanOrEqual(uk.clientWidth);

      // Подписи ссылок могут быть разной ширины, но кнопка действия и высота
      // шапки не сдвигаются между локалями.
      for (const [locale, frame] of [
        ['RU', ru],
        ['UK', uk]
      ] as const) {
        expect(
          Math.abs(frame.ctaRight - en.ctaRight),
          `правый край CTA съехал на ${locale} при ${width}px`
        ).toBeLessThanOrEqual(TOLERANCE);
        expect(
          Math.abs(frame.headerHeight - en.headerHeight),
          `высота шапки изменилась на ${locale} при ${width}px`
        ).toBeLessThanOrEqual(TOLERANCE);
      }

      if (STRICT_WIDTHS.includes(width)) {
        expect(
          Math.abs(ru.heroHeight - en.heroHeight),
          `высота хиро разошлась на ${width}px`
        ).toBeLessThanOrEqual(TOLERANCE);

        expect(
          Math.abs(uk.heroHeight - en.heroHeight),
          `высота хиро разошлась на UK при ${width}px`
        ).toBeLessThanOrEqual(TOLERANCE);

        // Первая секция после хиро начинается на одном y — первый экран одинаковый.
        expect(
          Math.abs(ru.sectionTops[1] - en.sectionTops[1]),
          `вторая секция начинается по-разному на ${width}px`
        ).toBeLessThanOrEqual(TOLERANCE);

        expect(
          Math.abs(uk.sectionTops[1] - en.sectionTops[1]),
          `вторая секция начинается по-разному на UK при ${width}px`
        ).toBeLessThanOrEqual(TOLERANCE);
      }
    });
  }
});
