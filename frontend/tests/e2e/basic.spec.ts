import { test, expect } from '@playwright/test';

test.describe('Basic Site Navigation', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FinAnalysis/);
  });

  test('should navigate to onboarding page', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.locator('h1')).toContainText('Book a Call');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/auth/login');
    // Just verify the page loads without errors
    await expect(page).toHaveURL(/.*auth\/login/);
  });

  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent');
    await expect(page.locator('h1')).toContainText('Page Not Found');
  });
});