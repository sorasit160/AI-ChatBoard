import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    username: `dashboard_user_${timestamp}`,
    email: `dashboard_user_${timestamp}@example.com`,
    password: 'password123'
  };

  test.beforeAll(async ({ request }) => {
    // Create a user via API to use in tests
    await request.post('http://localhost:3001/api/auth/register', {
      data: testUser
    });
  });

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(testUser.email);
    await page.locator('input[name="password"]').fill(testUser.password);
    await page.locator('#btn-submit-login').click();
    await expect(page).toHaveURL(/.*\/board/); // Assuming redirect to board on login
  });

  test('should load dashboard and display stats', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Check if dashboard header is visible
    await expect(page.locator('.dashboard-title, .gradient-text').first()).toBeVisible();
    
    // Check if KPI cards are rendered
    await expect(page.locator('.stat-card').first()).toBeVisible();
    
    // Ensure all 4 KPI cards exist
    await expect(page.locator('.stat-card')).toHaveCount(4);
    
    // Check if chart container exists
    await expect(page.locator('.chart-container')).toBeVisible();
    
    // Check if Top Users table is rendered
    await expect(page.locator('.data-table')).toBeVisible();
    
    // Check if Recent Activity list is rendered
    await expect(page.locator('.activity-list')).toBeVisible();
  });
});
