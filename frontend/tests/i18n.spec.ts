import { test, expect } from '@playwright/test';

test.describe('Internationalization (i18n)', () => {
  test('should toggle language between English and Thai', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Check initial language (should be English by default)
    await expect(page.locator('#nav-chat')).toContainText('AI Chat');
    await expect(page.locator('#btn-login')).toContainText('Login');
    
    // Find and click the language toggle button
    const langToggle = page.locator('#lang-toggle');
    await langToggle.click();
    
    // Check if UI changed to Thai
    await expect(page.locator('#nav-chat')).toContainText('AI แชท');
    await expect(page.locator('#btn-login')).toContainText('เข้าสู่ระบบ');
    
    // Click again to toggle back to English
    await langToggle.click();
    
    // Check if UI changed back to English
    await expect(page.locator('#nav-chat')).toContainText('AI Chat');
    await expect(page.locator('#btn-login')).toContainText('Login');
  });

  test('language preference should persist across reloads', async ({ page }) => {
    await page.goto('/');
    
    // Change to Thai
    await page.locator('#lang-toggle').click();
    await expect(page.locator('#btn-login')).toContainText('เข้าสู่ระบบ');
    
    // Reload page
    await page.reload();
    
    // Should still be Thai
    await expect(page.locator('#btn-login')).toContainText('เข้าสู่ระบบ');
  });
});
