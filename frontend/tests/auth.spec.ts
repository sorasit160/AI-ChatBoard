import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    username: `user_${timestamp}`,
    email: `user_${timestamp}@example.com`,
    password: 'password123'
  };

  test('should redirect unauthenticated user from protected routes', async ({ page }) => {
    await page.goto('/board');
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('.auth-alert.warning')).toBeVisible();
  });

  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Switch to register mode
    await page.locator('#btn-toggle-auth').click();
    
    // Fill form
    await page.locator('input[name="username"]').fill(testUser.username);
    await page.locator('input[name="email"]').fill(testUser.email);
    await page.locator('input[name="password"]').fill(testUser.password);
    
    // Submit
    await page.locator('#btn-submit-register').click();
    
    // Should redirect to board
    await expect(page).toHaveURL(/.*\/board/);
    
    // Navbar should show username and logout button
    await expect(page.locator('.user-name')).toContainText(testUser.username);
    await expect(page.locator('#btn-logout')).toBeVisible();
  });

  test('should login successfully', async ({ page }) => {
    // Create a new unique user for this test to avoid parallel execution issues
    const loginUser = {
      username: `u_${Date.now()}`,
      email: `login_user_${Date.now()}@example.com`,
      password: 'password123'
    };
    
    // Register the user via API first
    await page.request.post('http://localhost:3001/api/auth/register', {
      data: loginUser
    });

    await page.goto('/login');
    
    // Fill form
    await page.locator('input[name="email"]').fill(loginUser.email);
    await page.locator('input[name="password"]').fill(loginUser.password);
    
    // Submit
    await page.locator('#btn-submit-login').click();
    
    // Should redirect to board
    await expect(page).toHaveURL(/.*\/board/);
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/login');
    
    await page.locator('input[name="email"]').fill('wrong@example.com');
    await page.locator('input[name="password"]').fill('wrongpass');
    
    await page.locator('#btn-submit-login').click();
    
    // Should show error alert
    await expect(page.locator('.auth-alert.error')).toBeVisible();
  });
});
