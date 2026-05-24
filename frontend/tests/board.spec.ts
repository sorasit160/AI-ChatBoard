import { test, expect } from '@playwright/test';

test.describe('Board Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    username: `board_user_${timestamp}`,
    email: `board_user_${timestamp}@example.com`,
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
    await expect(page).toHaveURL(/.*\/board/);
  });

  test('should create a new post', async ({ page }) => {
    // Click New Post button
    await page.locator('button:has-text("New Post"), button:has-text("โพสต์ใหม่")').click();
    
    // Check if modal appears
    await expect(page.locator('.modal')).toBeVisible();
    
    // Fill form
    const postTitle = `Test Post ${Date.now()}`;
    await page.locator('input[placeholder*="title"], input[placeholder*="หัวข้อ"]').fill(postTitle);
    await page.locator('textarea[placeholder*="thoughts"], textarea[placeholder*="ความคิด"]').fill('This is a test post content.');
    
    // Submit
    await page.locator('button[type="submit"]').click();
    
    // Modal should disappear
    await expect(page.locator('.modal')).not.toBeVisible();
    
    // Post should be in the list
    await expect(page.locator('.post-card-title').first()).toHaveText(postTitle);
  });

  test('should open a post and add a reply', async ({ page }) => {
    // Ensure there's a post
    const postCards = page.locator('.post-card');
    if (await postCards.count() === 0) {
      test.skip(); // Skip if no posts to reply to
    }

    // Click the first post
    await postCards.first().click();
    
    // Check if thread view appears
    await expect(page.locator('.thread-view')).toBeVisible();
    
    // Fill reply form
    const replyText = `Test reply ${Date.now()}`;
    await page.locator('textarea[placeholder*="reply"], textarea[placeholder*="การตอบกลับ"]').fill(replyText);
    
    // Submit
    await page.locator('form.reply-form button[type="submit"]').click();
    
    // Reply should appear in the list
    await expect(page.locator('.reply-content').last()).toContainText(replyText);
  });
});
