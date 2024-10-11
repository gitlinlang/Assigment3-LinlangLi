import { test, expect } from '@playwright/test';

let authPayload: string;

test.describe('Front-end tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.locator('input[type="text"]').fill(`${process.env.TEST_USERNAME}`);
    await page.locator('input[type="password"]').fill(`${process.env.TEST_PASSWORD}`);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('heading', { name: 'Tester Hotel Overview' })).toBeVisible();
  });

  test('FET 01 view rooms', async ({ page }) => {
    await page.locator('#app > div > div > div:nth-child(1) > a').click();
    await expect(page.getByText('Rooms')).toBeVisible();
  });

  test('FET 02 view clients', async ({ page }) => {
    await page.locator('#app > div > div > div:nth-child(2) > a').click();
    await expect(page.getByText('Clients')).toBeVisible();
  });
});

test.describe('Backend tests', () => {

  test.beforeAll(async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/login', {
      data: {
        "username": `${process.env.TEST_USERNAME}`,
        "password": `${process.env.TEST_PASSWORD}`
      }
    });
    expect(response.ok()).toBeTruthy();
    const responseData = await response.json();
    authPayload = JSON.stringify({
      username: responseData.username,
      token: responseData.token
    });
  });

  test('BET 01 view bills', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/bills', {
      headers: {
        'x-user-auth': authPayload,
        'Content-Type': 'application/json',
      },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('BET 02 view reservations', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/reservations', {
      headers: {
        'x-user-auth': authPayload,
        'Content-Type': 'application/json',
      },
    });
    expect(response.ok()).toBeTruthy();
  });
});

