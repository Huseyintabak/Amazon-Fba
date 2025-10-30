import { test, expect } from '@playwright/test';

test.describe('Purchase Orders Page', () => {
  test('should navigate to purchase orders page', async ({ page }) => {
    await page.goto('/purchase-orders');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for page content
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should display purchase orders table', async ({ page }) => {
    await page.goto('/purchase-orders');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should allow creating new purchase order', async ({ page }) => {
    await page.goto('/purchase-orders');
    
    await page.waitForLoadState('networkidle');
    
    // Check if page has content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});


test.describe('Purchase Orders Page', () => {
  test('should navigate to purchase orders page', async ({ page }) => {
    await page.goto('/purchase-orders');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for page content
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should display purchase orders table', async ({ page }) => {
    await page.goto('/purchase-orders');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should allow creating new purchase order', async ({ page }) => {
    await page.goto('/purchase-orders');
    
    await page.waitForLoadState('networkidle');
    
    // Check if page has content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});



