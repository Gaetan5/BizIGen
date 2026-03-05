import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Biz-IGen/);
});

test('sign in page accessible', async ({ page }) => {
  await page.goto('http://localhost:3000/sign-in');
  await expect(page.locator('text=Sign in')).toBeVisible();
});

test('dashboard requires auth', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  await expect(page.locator('text=Connectez-vous')).toBeVisible();
});
