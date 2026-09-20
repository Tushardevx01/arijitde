import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/auth/login');
    // Wait for page to load
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