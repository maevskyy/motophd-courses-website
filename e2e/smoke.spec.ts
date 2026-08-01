import { expect, test } from '@playwright/test';

test('health endpoint responds', async ({ request }) => {
  const response = await request.get('/api/health');

  expect(response.ok()).toBe(true);
});

test('home page renders in English', async ({ page }) => {
  await page.goto('/en');

  const nav = page.getByRole('navigation');

  await expect(nav.getByRole('link', { exact: true, name: 'Courses' })).toBeVisible();
  await expect(nav).toContainText('MOTO');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('home page renders in Russian', async ({ page }) => {
  await page.goto('/ru');

  await expect(
    page.getByRole('navigation').getByRole('link', { exact: true, name: 'Курсы' })
  ).toBeVisible();
});

test('home page ends with the enroll call to action', async ({ page }) => {
  await page.goto('/ru');

  await expect(page.getByRole('link', { name: 'Записаться на курс' })).toBeVisible();

  await page.goto('/en');

  await expect(page.getByRole('link', { name: 'Join the Course' })).toBeVisible();
});

test('language switcher toggles the locale', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('link', { name: /EN.*RU/ }).click();

  await expect(page).toHaveURL(/\/ru(\/|$)/);
  await expect(
    page.getByRole('navigation').getByRole('link', { exact: true, name: 'Курсы' })
  ).toBeVisible();
});

test('catalog lists seeded courses', async ({ page }) => {
  await page.goto('/en/courses');

  await expect(page.locator('a[href*="/en/courses/"]').first()).toBeVisible();
});

test('lesson API exposes protected content only to previews or paid students', async ({
  request
}) => {
  const courseResponse = await request.get('/api/courses?where[slug][equals]=lean&limit=1&depth=0');
  const courseId = (await courseResponse.json()).docs[0].id;
  const lockedLessonsUrl =
    `/api/lessons?where[course][equals]=${courseId}` +
    '&where[isFreePreview][equals]=false&limit=1&depth=0';
  const previewLessonsUrl =
    `/api/lessons?where[course][equals]=${courseId}` +
    '&where[isFreePreview][equals]=true&limit=1&depth=0';
  const lockedResponse = await request.get(lockedLessonsUrl);
  const lockedLesson = (await lockedResponse.json()).docs[0];

  expect(lockedResponse.ok()).toBe(true);
  expect(lockedLesson).not.toHaveProperty('streamVideoId');
  expect(lockedLesson).not.toHaveProperty('body');
  expect(lockedLesson).not.toHaveProperty('pdf');

  const previewResponse = await request.get(previewLessonsUrl);
  const previewLesson = (await previewResponse.json()).docs[0];

  expect(previewResponse.ok()).toBe(true);
  expect(previewLesson).toHaveProperty('streamVideoId');
  expect(previewLesson).toHaveProperty('body');

  const loginResponse = await request.post('/api/users/login', {
    data: {
      email: 'student@motophd.com',
      password: 'student1234'
    }
  });
  const { token } = await loginResponse.json();
  const paidResponse = await request.get(lockedLessonsUrl, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const paidLesson = (await paidResponse.json()).docs[0];

  expect(paidResponse.ok()).toBe(true);
  expect(paidLesson).toHaveProperty('streamVideoId');
  expect(paidLesson).toHaveProperty('body');
});

test('course page opens from the catalog', async ({ page }) => {
  await page.goto('/en/courses');
  await page.locator('a[href*="/en/courses/"]').first().click();

  await expect(page).toHaveURL(/\/en\/courses\/.+/);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('login page shows the form', async ({ page }) => {
  await page.goto('/en/login');

  await expect(page.locator('#login-email')).toBeVisible();
  await expect(page.locator('#login-password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In to My Dashboard' })).toBeVisible();
  await expect(page.locator('#login-email')).toHaveValue('');
});

test('student can sign in and returns to the requested page', async ({ page }) => {
  await page.goto('/en/login?next=%2Fen%2Fcourses');
  await page.locator('#login-email').fill('student@motophd.com');
  await page.locator('#login-password').fill('student1234');
  await page.getByRole('button', { name: 'Sign In to My Dashboard' }).click();

  await expect(page).toHaveURL(/\/en\/courses$/);
  await expect(
    page.getByRole('navigation').getByRole('link', { name: 'My Dashboard' })
  ).toBeVisible();
});

test('direct login opens the dashboard', async ({ page }) => {
  await page.goto('/en/login');
  await page.locator('#login-email').fill('guest@motophd.com');
  await page.locator('#login-password').fill('guest1234');
  await page.getByRole('button', { name: 'Sign In to My Dashboard' }).click();

  await expect(page).toHaveURL(/\/en\/dashboard$/);
});

test('anonymous visitors return to the exact private page after signing in', async ({ page }) => {
  await page.goto('/en/dashboard');

  await expect(page).toHaveURL(/\/en\/login\?/);
  expect(new URL(page.url()).searchParams.get('next')).toBe('/en/dashboard');

  await page.goto('/en/learn/lean');

  await expect(page).toHaveURL(/\/en\/login\?/);
  expect(new URL(page.url()).searchParams.get('next')).toBe('/en/learn/lean');
});

test('guest without a purchase is returned to the course page', async ({ page }) => {
  await page.goto('/en/login?next=%2Fen%2Flearn%2Flean');
  await page.locator('#login-email').fill('guest@motophd.com');
  await page.locator('#login-password').fill('guest1234');
  await page.getByRole('button', { name: 'Sign In to My Dashboard' }).click();

  await expect(page).toHaveURL(/\/en\/courses\/lean\?access=denied$/);
  await expect(page.getByText('This course is not included in your purchases.')).toBeVisible();
});

test('student with a purchase can open the course player', async ({ page }) => {
  await page.goto('/en/login?next=%2Fen%2Flearn%2Flean');
  await page.locator('#login-email').fill('student@motophd.com');
  await page.locator('#login-password').fill('student1234');
  await page.getByRole('button', { name: 'Sign In to My Dashboard' }).click();

  await expect(page).toHaveURL(/\/en\/learn\/lean$/);
  await expect(page.getByText('Lesson Notes')).toBeVisible();
});

test('logout removes access to private pages', async ({ page }) => {
  await page.goto('/en/login');
  await page.locator('#login-email').fill('student@motophd.com');
  await page.locator('#login-password').fill('student1234');
  await page.getByRole('button', { name: 'Sign In to My Dashboard' }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page).toHaveURL(/\/en$/);

  await page.goto('/en/dashboard');
  await expect(page).toHaveURL(/\/en\/login\?/);
  expect(new URL(page.url()).searchParams.get('next')).toBe('/en/dashboard');
});

test('invalid login shows a generic error message', async ({ page }) => {
  await page.goto('/en/login');
  await page.locator('#login-email').fill('student@motophd.com');
  await page.locator('#login-password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign In to My Dashboard' }).click();

  await expect(page).toHaveURL(/\/en\/login$/);
  const loginError = page.locator('form [role="alert"]');

  await expect(loginError).toContainText('Incorrect email or password');
  await expect(loginError).toContainText('Access is sent by email after purchasing a course.');
});

test('legal page renders content from Payload', async ({ page }) => {
  await page.goto('/en/privacy');

  await expect(page.locator('h1').first()).toBeVisible();
});

test('admin panel responds', async ({ request }) => {
  const response = await request.get('/admin');

  expect(response.status()).toBe(200);
});
