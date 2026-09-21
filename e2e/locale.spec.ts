import { expect, test, type APIRequestContext } from '@playwright/test';

// Украинская версия: интерфейс на украинском, а видео и PDF — русские через
// фолбэк локали Payload (uk → ru). Тесты не логинятся через форму: параллельные
// логины одного сид-аккаунта роняют друг другу сессии (MOT-36), поэтому
// приватные проверки ходят по REST с bearer-токеном.

const login = async (request: APIRequestContext, email: string, password: string) => {
  const response = await request.post('/api/users/login', { data: { email, password } });

  return response.ok() ? ((await response.json()).token as string) : null;
};

const getLeanCourseId = async (request: APIRequestContext) => {
  const response = await request.get('/api/courses?where[slug][equals]=lean&limit=1&depth=0');

  return (await response.json()).docs[0].id as number;
};

test('ukrainian home page renders the header and content in Ukrainian', async ({ page }) => {
  await page.goto('/uk');

  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(
    page.getByRole('navigation').getByRole('link', { exact: true, name: 'Курси' })
  ).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Мова' }).getByRole('link', { name: 'UK' })
  ).toHaveAttribute('aria-current', 'true');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('райдерів');
});

test('language select switches from Ukrainian to Russian on the same page', async ({ page }) => {
  await page.goto('/uk/courses');
  await page
    .getByRole('group', { name: 'Мова' })
    .getByRole('link', { exact: true, name: 'RU' })
    .click();

  await expect(page).toHaveURL(/\/ru\/courses$/);
  await expect(
    page.getByRole('navigation').getByRole('link', { exact: true, name: 'Курсы' })
  ).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Язык' }).getByRole('link', { name: 'RU' })
  ).toHaveAttribute('aria-current', 'true');
});

test('language select keeps the query string, e.g. ?next= on the login page', async ({ page }) => {
  await page.goto('/uk/login?next=%2Fuk%2Fdashboard');
  await page
    .getByRole('group', { name: 'Мова' })
    .getByRole('link', { exact: true, name: 'EN' })
    .click();

  await expect(page).toHaveURL(/\/en\/login\?next=%2Fuk%2Fdashboard$/);
  await expect(page.getByRole('button', { name: 'Sign In to My Dashboard' })).toBeVisible();
});

test('ukrainian course page opens with a title from the fallback locale', async ({ page }) => {
  const response = await page.goto('/uk/courses/lean');

  expect(response?.status()).toBe(200);
  await expect(page.locator('h1').first()).toBeVisible();
  await expect(page.locator('h1').first()).not.toBeEmpty();
  expect(await page.locator('head link[rel="canonical"]').first().getAttribute('href')).toMatch(
    /\/uk\/courses\/lean$/
  );
  expect(
    await page.locator('head meta[property="og:locale"]').first().getAttribute('content')
  ).toBe('uk_UA');
});

test('REST API serves Russian lesson media to Ukrainian readers', async ({ request }) => {
  const courseId = await getLeanCourseId(request);
  const lessonUrl = (locale: string) =>
    `/api/lessons?where[course][equals]=${courseId}&where[order][equals]=1&limit=1&depth=0&locale=${locale}`;
  // Первый урок — бесплатный тизер: streamVideoId читается без логина.
  const [ukrainian, russian] = await Promise.all([
    request.get(lessonUrl('uk')).then((r) => r.json()),
    request.get(lessonUrl('ru')).then((r) => r.json())
  ]);

  expect(russian.docs[0].streamVideoId).toMatch(/-ru-lesson-1$/);
  expect(ukrainian.docs[0].streamVideoId).toBe(russian.docs[0].streamVideoId);
  expect(ukrainian.docs[0].title).toBe(russian.docs[0].title);
});

test('PDF route serves the Russian file for a Ukrainian link', async ({ request }) => {
  const courseId = await getLeanCourseId(request);
  const lessonsResponse = await request.get(
    `/api/lessons?where[course][equals]=${courseId}&where[type][equals]=pdf&sort=order&limit=1&depth=0`
  );
  const lesson = (await lessonsResponse.json()).docs[0];
  const token = await login(request, 'student@motophd.com', 'student1234');

  expect(token).not.toBeNull();

  const response = await request.get(`/api/lessons/${lesson.id}/pdf?locale=uk`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
});

test('a Ukrainian title set in the admin stays while empty media still fall back to Russian', async ({
  request
}) => {
  const token = await login(request, 'admin@motophd.com', 'admin1234');

  test.skip(!token, 'seed admin (admin@motophd.com / admin1234) is not available on this database');

  const headers = { Authorization: `Bearer ${token}` };
  const slug = `e2e-uk-fallback-${Date.now()}`;
  const courseResponse = await request.post('/api/courses', {
    data: { slug, status: 'draft', title: 'Fallback probe' },
    headers
  });

  expect(courseResponse.ok()).toBe(true);

  const courseId = (await courseResponse.json()).doc.id as number;

  try {
    const lessonResponse = await request.post('/api/lessons', {
      data: {
        course: courseId,
        order: 1,
        streamVideoId: 'probe-en',
        title: 'Probe',
        type: 'video'
      },
      headers
    });

    expect(lessonResponse.ok()).toBe(true);

    const lessonId = (await lessonResponse.json()).doc.id as number;

    try {
      await request.patch(`/api/lessons/${lessonId}?locale=ru`, {
        data: { streamVideoId: 'probe-ru', title: 'Проба' },
        headers
      });
      const ukUpdate = await request.patch(`/api/lessons/${lessonId}?locale=uk`, {
        data: { title: 'Проба українською' },
        headers
      });

      expect(ukUpdate.ok()).toBe(true);

      const ukrainian = await request
        .get(`/api/lessons/${lessonId}?locale=uk&depth=0`, { headers })
        .then((r) => r.json());

      expect(ukrainian.title).toBe('Проба українською');
      expect(ukrainian.streamVideoId).toBe('probe-ru');
    } finally {
      await request.delete(`/api/lessons/${lessonId}`, { headers });
    }
  } finally {
    await request.delete(`/api/courses/${courseId}`, { headers });
  }
});
