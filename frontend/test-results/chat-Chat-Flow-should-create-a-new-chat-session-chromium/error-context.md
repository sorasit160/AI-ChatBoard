# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat.spec.ts >> Chat Flow >> should create a new chat session
- Location: tests\chat.spec.ts:34:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.message-wrapper')
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('.message-wrapper')
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation "Main navigation" [ref=e3]:
    - generic [ref=e4]:
      - link "🤖 AI ChatBoard" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e6]: 🤖
        - generic [ref=e7]: AI ChatBoard
      - link "💬 AI Chat" [ref=e9] [cursor=pointer]:
        - /url: /
        - generic [ref=e10]: 💬
        - generic [ref=e11]: AI Chat
      - generic [ref=e12]:
        - button "Toggle language" [ref=e13] [cursor=pointer]:
          - generic [ref=e14]: 🇺🇸
          - generic [ref=e15]: EN
        - link "Login" [ref=e16] [cursor=pointer]:
          - /url: /login
  - generic [ref=e17]:
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]: 🤖
        - generic [ref=e21]:
          - heading "AI Assistant" [level=1] [ref=e22]
          - paragraph [ref=e23]: Ask me anything — I speak Thai & English
      - button "✨ New Chat" [active] [ref=e24] [cursor=pointer]
    - generic [ref=e26]:
      - generic [ref=e27]: 🤖
      - generic [ref=e28]:
        - generic [ref=e29]:
          - text: AI Assistant
          - generic [ref=e30]: 08:08 AM
        - generic [ref=e32]:
          - paragraph [ref=e33]:
            - text: 👋
            - strong [ref=e34]: สวัสดีครับ!
            - text: ยินดีต้อนรับสู่ AI Assistant
          - paragraph [ref=e35]:
            - strong [ref=e36]: Hello!
            - text: Welcome to AI Assistant. How can I help you today?
    - generic [ref=e37]:
      - generic [ref=e38]:
        - textbox "Type your message here..." [ref=e39]
        - button "Send" [disabled] [ref=e40]: ➤
      - paragraph [ref=e41]: Enter to send · Shift+Enter for new line
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Chat Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |   });
  7  | 
  8  |   test('should display chat interface correctly', async ({ page }) => {
  9  |     // Check main UI elements
  10 |     await expect(page.locator('.chat-title')).toBeVisible();
  11 |     await expect(page.locator('.chat-empty')).toBeVisible();
  12 |     await expect(page.locator('#chat-input')).toBeVisible();
  13 |     await expect(page.locator('#btn-send')).toBeVisible();
  14 |   });
  15 | 
  16 |   test('should be able to send a message and receive a response', async ({ page }) => {
  17 |     // Type message
  18 |     await page.locator('#chat-input').fill('สวัสดี');
  19 |     
  20 |     // Send message
  21 |     await page.locator('#btn-send').click();
  22 |     
  23 |     // User message should appear immediately
  24 |     await expect(page.locator('.message-wrapper.user')).toBeVisible();
  25 |     await expect(page.locator('.message-wrapper.user .message-text')).toHaveText('สวัสดี');
  26 |     
  27 |     // AI typing indicator might show briefly, then AI response should appear
  28 |     await expect(page.locator('.message-wrapper.assistant .message-bubble')).toBeVisible({ timeout: 10000 });
  29 |     
  30 |     // Empty state should be gone
  31 |     await expect(page.locator('.chat-empty')).not.toBeVisible();
  32 |   });
  33 | 
  34 |   test('should create a new chat session', async ({ page }) => {
  35 |     // Send a message first
  36 |     await page.locator('#chat-input').fill('Hello');
  37 |     await page.locator('#btn-send').click();
  38 |     await expect(page.locator('.message-wrapper.user')).toBeVisible();
  39 | 
  40 |     // Click New Chat
  41 |     await page.locator('#btn-new-chat').click();
  42 | 
  43 |     // Should return to empty state
  44 |     await expect(page.locator('.chat-empty')).toBeVisible();
> 45 |     await expect(page.locator('.message-wrapper')).toHaveCount(0);
     |                                                    ^ Error: expect(locator).toHaveCount(expected) failed
  46 |   });
  47 | });
  48 | 
```