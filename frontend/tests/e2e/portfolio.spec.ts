import { test, expect } from '@playwright/test';

test.describe('Portfolio & Scoring Flow', () => {
  test('should load onboarding page', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/.*onboarding/);
    await expect(page.locator('h1')).toContainText('Book a Call');
  });
});

test.describe('Authentication Flow', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/.*auth\/login/);
  });

  test('should load OTP send page', async ({ page }) => {
    await page.goto('/auth/otp/send');
    await expect(page).toHaveURL(/.*auth\/otp\/send/);
  });

  test('should load Google auth page', async ({ page }) => {
    await page.goto('/auth/google');
    await expect(page).toHaveURL(/.*auth\/google/);
  });
});