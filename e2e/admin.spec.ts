import { expect, test, type APIRequestContext } from '@playwright/test';

/*
  Админка ходит в те же REST-ручки Payload, что и этот файл, поэтому тесты
  проверяют её поведение без браузера: быстро и на все восемь коллекций сразу.

  Порядок последовательный (serial): тесты создают и удаляют документы в общей
  базе, а вход по одному аккаунту выбивает предыдущую сессию (keepOnlyCurrentSession),
  так что параллельный прогон ломал бы сам себя.
*/
test.describe.configure({ mode: 'serial' });

const ADMIN = { email: 'admin@motophd.com', password: 'admin1234' };
const STUDENT = { email: 'student@motophd.com', password: 'student1234' };

const auth = (token: string) => ({ Authorization: `JWT ${token}` });

async function login(request: APIRequestContext, email: string, password: string) {
  const response = await request.post('/api/users/login', { data: { email, password } });

  expect(response.status(), `вход ${email}`).toBe(200);

  const { token, user } = await response.json();

  return { id: user.id as number, token: token as string };
}

let admin: { id: number; token: string };
// Логинимся по разу на роль: у аккаунта одна живая сессия (singleSession.ts),
// а вход по /api/users/login ограничен middleware — 30 попыток с IP за 15 минут.
let student: { id: number; token: string };
/*
  Гостевой контекст отдельный и в нём никто не логинится: общий request хранит
  куку последнего входа, и запрос «от гостя» на самом деле шёл от студента —
  проверки доступа проходили вхолостую.
*/
let guest: APIRequestContext;
const rubbish: Array<{ collection: string; id: number }> = [];

const track = (collection: string, id: number) => {
  rubbish.push({ collection, id });

  return id;
};

test.beforeAll(async ({ baseURL, playwright, request }) => {
  admin = await login(request, ADMIN.email, ADMIN.password);
  student = await login(request, STUDENT.email, STUDENT.password);
  guest = await playwright.request.newContext({ baseURL });
});

test.afterAll(async ({ request }) => {
  await guest.dispose();

  // Чистим за собой в обратном порядке: покупки и уроки ссылаются на курсы.
  for (const { collection, id } of rubbish.reverse()) {
    await request.delete(`/api/${collection}/${id}`, { headers: auth(admin.token) });
  }
});

test.describe('users', () => {
  test('админ видит всех, студент — только себя', async ({ request }) => {
    const asAdmin = await request.get('/api/users?limit=100', { headers: auth(admin.token) });
    expect(asAdmin.status()).toBe(200);
    expect((await asAdmin.json()).totalDocs).toBeGreaterThan(1);

    const asStudent = await request.get('/api/users?limit=100', { headers: auth(student.token) });
    expect(asStudent.status()).toBe(200);
    const list = await asStudent.json();
    expect(list.totalDocs).toBe(1);
    expect(list.docs[0].email).toBe(STUDENT.email);
  });

  test('студент не может выдать себе админа и удалить аккаунт', async ({ request }) => {
    const promote = await request.patch(`/api/users/${student.id}`, {
      data: { role: 'admin' },
      headers: auth(student.token)
    });
    expect(promote.status()).toBe(200);
    expect((await promote.json()).doc.role).toBe('student');

    const remove = await request.delete(`/api/users/${student.id}`, {
      headers: auth(student.token)
    });
    expect(remove.status()).toBe(403);
  });

  test('пароль, выданный админом, пускает на сайт', async ({ request }) => {
    const email = `admin-test-${Date.now()}@motophd.com`;

    const created = await request.post('/api/users', {
      data: { email, password: 'firstpass1234', role: 'student' },
      headers: auth(admin.token)
    });
    expect(created.status()).toBe(201);
    const id = track('users', (await created.json()).doc.id);

    const changed = await request.patch(`/api/users/${id}`, {
      data: { password: 'secondpass1234' },
      headers: auth(admin.token)
    });
    expect(changed.status()).toBe(200);

    const withNew = await request.post('/api/users/login', {
      data: { email, password: 'secondpass1234' }
    });
    expect(withNew.status(), 'новый пароль должен пускать').toBe(200);

    const withOld = await request.post('/api/users/login', {
      data: { email, password: 'firstpass1234' }
    });
    expect(withOld.status(), 'старый пароль должен перестать работать').toBe(401);
  });

  test('после пяти промахов аккаунт заблокирован, и админ снимает блокировку', async ({
    request
  }) => {
    const email = `admin-lock-${Date.now()}@motophd.com`;
    const password = 'lockme1234';

    const created = await request.post('/api/users', {
      data: { email, password, role: 'student' },
      headers: auth(admin.token)
    });
    const id = track('users', (await created.json()).doc.id);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request.post('/api/users/login', { data: { email, password: 'wrong-password' } });
    }

    const locked = await request.post('/api/users/login', { data: { email, password } });
    expect(locked.status(), 'после пяти промахов верный пароль тоже не пускает').toBe(401);

    // Админ обязан видеть причину: без статуса он меняет пароль и не понимает,
    // почему вход всё равно не работает.
    const state = await request.get(`/api/users/${id}/lock-state`, { headers: auth(admin.token) });
    expect(state.status()).toBe(200);
    const lockState = await state.json();
    expect(lockState.loginAttempts).toBeGreaterThanOrEqual(5);
    expect(new Date(lockState.lockUntil).getTime()).toBeGreaterThan(Date.now());

    const asStudent = await request.get(`/api/users/${id}/lock-state`, {
      headers: auth(student.token)
    });
    expect(asStudent.status(), 'статус блокировки — только админу').toBe(403);

    const asGuest = await guest.get(`/api/users/${id}/lock-state`);
    expect(asGuest.status(), 'статус блокировки — только админу').toBe(403);

    // Админка обязана уметь снимать блокировку — этой ручкой будет ходить кнопка.
    const unlocked = await request.post('/api/users/unlock', {
      data: { email },
      headers: auth(admin.token)
    });
    expect(unlocked.status(), 'админ снимает блокировку').toBe(200);

    const after = await request.post('/api/users/login', { data: { email, password } });
    expect(after.status(), 'после разблокировки вход работает').toBe(200);

    const cleared = await request.get(`/api/users/${id}/lock-state`, {
      headers: auth(admin.token)
    });
    expect((await cleared.json()).lockUntil, 'после разблокировки замок снят').toBeFalsy();
  });
});

test.describe('media', () => {
  test('гость видит только картинки, админ — все файлы', async ({ request }) => {
    const anonymous = await guest.get('/api/media?limit=100');
    expect(anonymous.status()).toBe(200);
    const visible = (await anonymous.json()).docs as Array<{ mimeType?: string }>;
    expect(visible.every((file) => (file.mimeType ?? '').startsWith('image/'))).toBe(true);

    const asAdmin = await request.get('/api/media?limit=100', { headers: auth(admin.token) });
    expect((await asAdmin.json()).totalDocs).toBeGreaterThanOrEqual(visible.length);
  });

  test('студент не заливает файлы', async ({ request }) => {
    const response = await request.post('/api/media', {
      data: { alt: 'от студента' },
      headers: auth(student.token)
    });

    expect(response.status()).toBe(403);
  });
});

test.describe('courses', () => {
  const draft = {
    currency: 'EUR',
    priceFeedback: 200,
    priceStandard: 100,
    slug: `admin-test-course-${Date.now()}`,
    status: 'draft',
    title: 'Черновик из теста'
  };

  test('черновик не виден снаружи, опубликованный виден', async ({ request }) => {
    const created = await request.post('/api/courses', {
      data: draft,
      headers: auth(admin.token)
    });
    expect(created.status()).toBe(201);
    const id = track('courses', (await created.json()).doc.id);

    const anonymous = await guest.get(`/api/courses/${id}`);
    expect(anonymous.status(), 'черновик не отдаётся гостю').toBe(404);

    const published = await request.patch(`/api/courses/${id}`, {
      data: { status: 'published' },
      headers: auth(admin.token)
    });
    expect(published.status()).toBe(200);

    const again = await guest.get(`/api/courses/${id}`);
    expect(again.status(), 'опубликованный курс виден').toBe(200);
  });

  test('slug курса уникален, студент курсы не создаёт', async ({ request }) => {
    const duplicate = await request.post('/api/courses', {
      data: { ...draft, title: 'Дубликат' },
      headers: auth(admin.token)
    });
    expect(duplicate.status(), 'два курса с одним slug').toBe(400);

    const forbidden = await request.post('/api/courses', {
      data: { ...draft, slug: `admin-test-course-student-${Date.now()}` },
      headers: auth(student.token)
    });
    expect(forbidden.status()).toBe(403);
  });
});

test.describe('lessons', () => {
  // Урок = видео + название (+PDF), текста у платных уроков может не быть
  // (MOT-77) — закрытым считается любое из трёх полей содержимого.
  test('гость не получает содержимое платного урока', async ({ request }) => {
    const asAdmin = await request.get('/api/lessons?limit=100&depth=0', {
      headers: auth(admin.token)
    });
    const lessons = (await asAdmin.json()).docs as Array<{
      id: number;
      isFreePreview?: boolean;
      pdf?: unknown;
      streamVideoId?: unknown;
    }>;
    const paid = lessons.find(
      (lesson) => !lesson.isFreePreview && (lesson.streamVideoId || lesson.pdf)
    );
    expect(paid, 'в базе нужен платный урок с видео, PDF или текстом').toBeTruthy();

    const anonymous = await guest.get(`/api/lessons/${paid!.id}?depth=0`);

    if (anonymous.status() === 200) {
      const lesson = await anonymous.json();

      for (const field of ['streamVideoId', 'video', 'pdf']) {
        expect(lesson[field], `${field} платного урока не отдаём гостю`).toBeFalsy();
      }
    } else {
      expect(anonymous.status()).toBe(404);
    }
  });

  test('студент уроки не правит', async ({ request }) => {
    const asAdmin = await request.get('/api/lessons?limit=1&depth=0', {
      headers: auth(admin.token)
    });
    const [lesson] = (await asAdmin.json()).docs as Array<{ id: number }>;

    const response = await request.patch(`/api/lessons/${lesson.id}`, {
      data: { title: 'Переименовано студентом' },
      headers: auth(student.token)
    });

    expect(response.status()).toBe(403);
  });
});

test.describe('videos', () => {
  // ID, которого нет в Stream: удаление записи сходит в Stream и получит 404 —
  // это «уже удалено», не ошибка. Настоящие видео тест не трогает.
  const fakeUid = () =>
    Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  test('видео видит и загружает только админ', async ({ request }) => {
    expect((await guest.get('/api/videos')).status()).toBe(403);
    expect((await request.get('/api/videos', { headers: auth(student.token) })).status()).toBe(403);

    for (const headers of [{}, auth(student.token)]) {
      const upload = await request.post('/api/videos/upload', {
        headers: { ...headers, 'Tus-Resumable': '1.0.0', 'Upload-Length': '1024' }
      });
      expect(upload.status(), 'ссылку на загрузку в Stream получает только админ').toBe(403);
    }
  });

  test('урок играет выбранное видео, а видео из урока не удалить', async ({ request }) => {
    const headers = auth(admin.token);
    const uid = fakeUid();
    const video = await request.post('/api/videos', {
      data: { status: 'ready', streamUid: uid, title: 'Видео из теста' },
      headers
    });
    expect(video.status()).toBe(201);
    const videoId = (await video.json()).doc.id as number;

    const course = await request.post('/api/courses', {
      data: {
        currency: 'EUR',
        priceFeedback: 200,
        priceStandard: 100,
        slug: `admin-test-video-${Date.now()}`,
        status: 'draft',
        title: 'Курс для видео'
      },
      headers
    });
    const courseId = track('courses', (await course.json()).doc.id);
    const lesson = await request.post('/api/lessons?locale=ru', {
      data: { course: courseId, order: 1, title: 'Урок с видео', video: videoId },
      headers
    });
    expect(lesson.status()).toBe(201);
    const lessonDoc = (await lesson.json()).doc;
    track('lessons', lessonDoc.id);
    expect(lessonDoc.streamVideoId, 'плеер берёт ID Stream из выбранного видео').toBe(uid);

    const refused = await request.delete(`/api/videos/${videoId}`, { headers });
    expect(refused.status()).toBe(400);
    expect(JSON.stringify(await refused.json())).toContain('Урок с видео');

    const cleared = await request.patch(`/api/lessons/${lessonDoc.id}?locale=ru`, {
      data: { video: null },
      headers
    });
    expect((await cleared.json()).doc.streamVideoId, 'сняли видео — урок без видео').toBeFalsy();

    const deleted = await request.delete(`/api/videos/${videoId}`, { headers });
    expect(deleted.status()).toBe(200);
  });
});

test.describe('legalPages', () => {
  test('страницы читает любой, пишет только админ', async ({ request }) => {
    const anonymous = await guest.get('/api/legalPages?limit=100');
    expect(anonymous.status()).toBe(200);
    expect((await anonymous.json()).totalDocs).toBeGreaterThan(0);

    const forbidden = await request.post('/api/legalPages', {
      data: { slug: 'contact', title: 'Подмена' },
      headers: auth(student.token)
    });
    expect(forbidden.status()).toBe(403);
  });

  test('slug страницы уникален', async ({ request }) => {
    const duplicate = await request.post('/api/legalPages', {
      data: { slug: 'contact', title: 'Второй контакт' },
      headers: auth(admin.token)
    });

    expect(duplicate.status(), 'две страницы с одним slug').toBe(400);
  });
});

test.describe('purchases', () => {
  test('студент видит только свои покупки и не выписывает новые', async ({ request }) => {
    const own = await request.get('/api/purchases?limit=100&depth=0', {
      headers: auth(student.token)
    });
    expect(own.status()).toBe(200);
    const docs = (await own.json()).docs as Array<{ user: number }>;
    expect(docs.every((purchase) => purchase.user === student.id)).toBe(true);

    const anonymous = await guest.get('/api/purchases?limit=100');
    expect(anonymous.status(), 'гость не видит покупок').toBe(403);

    const forged = await request.post('/api/purchases', {
      data: {
        amount: 0,
        currency: 'EUR',
        locale: 'ru',
        provider: 'manual',
        status: 'paid',
        tier: 'standard',
        user: student.id
      },
      headers: auth(student.token)
    });
    expect(forged.status(), 'студент выписал себе покупку').toBe(403);
  });

  test('покупка, выданная админом, открывает курс', async ({ request }) => {
    const email = `admin-buy-${Date.now()}@motophd.com`;
    const password = 'buyer1234';

    const createdUser = await request.post('/api/users', {
      data: { email, password, role: 'student' },
      headers: auth(admin.token)
    });
    const userId = track('users', (await createdUser.json()).doc.id);

    const courses = await request.get('/api/courses?limit=1&depth=0', {
      headers: auth(admin.token)
    });
    const [course] = (await courses.json()).docs as Array<{ id: number }>;

    const buyer = await login(request, email, password);

    const purchase = await request.post('/api/purchases', {
      data: {
        amount: 100,
        course: course.id,
        currency: 'EUR',
        locale: 'ru',
        paidAt: new Date().toISOString(),
        provider: 'manual',
        status: 'paid',
        tier: 'standard',
        user: userId
      },
      headers: auth(admin.token)
    });
    expect(purchase.status(), 'админ выписывает покупку вручную').toBe(201);
    track('purchases', (await purchase.json()).doc.id);

    const mine = await request.get('/api/purchases?limit=100&depth=0', {
      headers: auth(buyer.token)
    });
    const list = (await mine.json()).docs as Array<{ course: number; status: string }>;
    expect(list.some((item) => item.course === course.id && item.status === 'paid')).toBe(true);
  });
});

test.describe('promoCodes', () => {
  test('промокоды не видны никому, кроме админа', async ({ request }) => {
    const anonymous = await guest.get('/api/promoCodes?limit=100');
    expect(anonymous.status(), 'гость читает промокоды').toBe(403);

    const asStudent = await request.get('/api/promoCodes?limit=100', {
      headers: auth(student.token)
    });
    expect(asStudent.status(), 'студент читает промокоды').toBe(403);
  });

  test('админ заводит промокод, дубль кода не проходит', async ({ request }) => {
    const code = `ADMINTEST${Date.now()}`;
    const data = { active: true, code, discountType: 'percent', usedCount: 0, value: 10 };

    const created = await request.post('/api/promoCodes', {
      data,
      headers: auth(admin.token)
    });
    expect(created.status()).toBe(201);
    track('promoCodes', (await created.json()).doc.id);

    const duplicate = await request.post('/api/promoCodes', {
      data,
      headers: auth(admin.token)
    });
    expect(duplicate.status(), 'два промокода с одним кодом').toBe(400);
  });
});
