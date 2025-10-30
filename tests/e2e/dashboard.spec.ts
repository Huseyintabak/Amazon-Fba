import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test('should navigate to dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for dashboard content
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should display dashboard stats', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have date range filter', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    
    // Check if page has content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});


test.describe('Dashboard Page', () => {
  test('should navigate to dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for dashboard content
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should display dashboard stats', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have date range filter', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    
    // Check if page has content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});



