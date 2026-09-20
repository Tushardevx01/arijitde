import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test('should load admin login page', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/.*auth\/login/);
  });

  test('should redirect to onboarding for admin dashboard', async ({ page }) => {
    await page.goto('/dashboard/admin');
    // The app redirects to onboarding for admin dashboard
    await expect(page).toHaveURL(/.*onboarding/);
  });
});