import { expect, test } from '@playwright/test';

// Оба теста работают на выделенных сид-аккаунтах (lockout@ / ratelimit@):
// у счётчиков и локаута свои жертвы, остальной прогон они не запирают.
// Тесты устойчивы к повторным прогонам внутри окна лимита: они утверждают
// конечное состояние (заперто / 429), а не точный номер попытки.

test('серия неверных паролей запирает аккаунт даже для верного пароля', async ({ request }) => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await request.post('/api/users/login', {
      data: { email: 'lockout@motophd.com', password: 'definitely-wrong' }
    });

    expect(response.status()).toBe(401);
  }

  const withCorrectPassword = await request.post('/api/users/login', {
    data: { email: 'lockout@motophd.com', password: 'lockout1234' }
  });

  expect(withCorrectPassword.status()).toBe(401);
});

test('PDF-роут отвечает 429 с Retry-After после превышения лимита', async ({ request }) => {
  const loginResponse = await request.post('/api/users/login', {
    data: { email: 'ratelimit@motophd.com', password: 'ratelimit1234' }
  });

  expect(loginResponse.ok()).toBe(true);

  const { token } = await loginResponse.json();
  let tooManyRequests: import('@playwright/test').APIResponse | null = null;

  // Лимит по умолчанию 30/10мин; запас до 40 покрывает хвост от прошлого
  // прогона внутри окна.
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const response = await request.get('/api/lessons/999999/pdf?locale=en', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status() === 429) {
      tooManyRequests = response;
      break;
    }

    expect(response.status()).toBe(404);
  }

  expect(tooManyRequests).not.toBeNull();
  expect(Number(tooManyRequests?.headers()['retry-after'])).toBeGreaterThan(0);
});
