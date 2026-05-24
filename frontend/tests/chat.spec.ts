import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display chat interface correctly', async ({ page }) => {
    // Check main UI elements
    await expect(page.locator('.chat-title')).toBeVisible();
    await expect(page.locator('.chat-empty')).toBeVisible();
    await expect(page.locator('#chat-input')).toBeVisible();
    await expect(page.locator('#btn-send')).toBeVisible();
  });

  test('should be able to send a message and receive a response', async ({ page }) => {
    // Type message
    await page.locator('#chat-input').fill('สวัสดี');
    
    // Send message
    await page.locator('#btn-send').click();
    
    // User message should appear immediately
    await expect(page.locator('.message-wrapper.user')).toBeVisible();
    await expect(page.locator('.message-wrapper.user .message-text')).toHaveText('สวัสดี');
    
    // AI typing indicator might show briefly, then AI response should appear
    await expect(page.locator('.message-wrapper.assistant .message-bubble')).toBeVisible({ timeout: 10000 });
    
    // Empty state should be gone
    await expect(page.locator('.chat-empty')).not.toBeVisible();
  });

  test('should create a new chat session', async ({ page }) => {
    // Send a message first
    await page.locator('#chat-input').fill('Hello');
    await page.locator('#btn-send').click();
    await expect(page.locator('.message-wrapper.user')).toBeVisible();

    // Click New Chat
    await page.locator('#btn-new-chat').click();

    // Should return to empty state
    await expect(page.locator('.chat-empty')).toBeVisible();
    await expect(page.locator('.message-wrapper')).toHaveCount(0);
  });
});
