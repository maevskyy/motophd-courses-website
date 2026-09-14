import { expect, test } from '@playwright/test';

/*
  Каркас лендинга не должен зависеть от языка.

  Русский текст системно длиннее английского на 20-30%, и пока высоту блоков
  задавала длина фразы, при переключении EN/RU уезжала вся композиция: хиро
  на RU был на 134px выше, статистика оказывалась за первым экраном, а каждый
  пункт шапки съезжал вправо. Лечится это слотами фиксированной высоты и
  ширины (lines-reserve / text-slot в src/styles/_mixins.scss и min-inline-size
  в Nav.module.scss) — этот тест сторожит, что слоты всё ещё в силе.
*/

const STRICT_WIDTHS = [1440, 1024, 768];
const ALL_WIDTHS = [...STRICT_WIDTHS, 390];
const TOLERANCE = 4;

type Frame = {
  heroHeight: number;
  navItems: Array<{ name: string; x: number }>;
  sectionTops: number[];
  scrollWidth: number;
  clientWidth: number;
};

async function readFrame(page: import('@playwright/test').Page, path: string): Promise<Frame> {
  await page.goto(path, { waitUntil: 'networkidle' });

  return page.evaluate(() => {
    const sections = [...document.querySelectorAll('main section, body > section')];
    const hero = sections[0];
    const navItems = [...document.querySelectorAll('header nav a, header nav button')]
      .filter((el) => el.getBoundingClientRect().width > 0)
      .map((el) => ({
        name: (el.textContent || el.getAttribute('aria-label') || '').trim(),
        x: Math.round(el.getBoundingClientRect().left)
      }));

    return {
      heroHeight: hero ? Math.round(hero.getBoundingClientRect().height) : 0,
      navItems,
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
    test(`ширина ${width}px: шапка и первый экран совпадают на EN и RU`, async ({ page }) => {
      await page.context().addCookies([
        { name: 'motophd_consent', value: 'necessary', url: page.url() || 'http://localhost:3100' }
      ]);
      await page.setViewportSize({ width, height: 900 });

      const en = await readFrame(page, '/en');
      const ru = await readFrame(page, '/ru');

      // Горизонтального скролла нет ни на одной локали и ни на одной ширине.
      expect(en.scrollWidth, `EN overflow at ${width}`).toBeLessThanOrEqual(en.clientWidth);
      expect(ru.scrollWidth, `RU overflow at ${width}`).toBeLessThanOrEqual(ru.clientWidth);

      // Каждый видимый пункт шапки стоит на своём x независимо от языка.
      expect(ru.navItems.length).toBe(en.navItems.length);
      en.navItems.forEach((item, index) => {
        expect(
          Math.abs(ru.navItems[index].x - item.x),
          `пункт шапки «${item.name}» съехал на ${width}px`
        ).toBeLessThanOrEqual(TOLERANCE);
      });

      if (STRICT_WIDTHS.includes(width)) {
        expect(
          Math.abs(ru.heroHeight - en.heroHeight),
          `высота хиро разошлась на ${width}px`
        ).toBeLessThanOrEqual(TOLERANCE);

        // Первая секция после хиро начинается на одном y — первый экран одинаковый.
        expect(
          Math.abs(ru.sectionTops[1] - en.sectionTops[1]),
          `вторая секция начинается по-разному на ${width}px`
        ).toBeLessThanOrEqual(TOLERANCE);
      }
    });
  }
});
