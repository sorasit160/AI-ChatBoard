# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: board.spec.ts >> Board Flow >> should open a post and add a reply
- Location: tests\board.spec.ts:49:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/board/
Received string:  "http://localhost:5173/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "http://localhost:5173/login"

```

```yaml
- navigation "Main navigation":
  - link "🤖 AI ChatBoard":
    - /url: /
  - link "💬 AI Chat":
    - /url: /
  - button "Toggle language": 🇺🇸 EN
  - link "Login":
    - /url: /login
- text: 👋
- heading "Welcome Back" [level=1]
- paragraph: Sign in to access Board & Dashboard
- text: ⚠️ Invalid email or password Email Address
- textbox "Email Address":
  - /placeholder: Enter your email
  - text: board_user_1779584918737@example.com
- text: Password
- textbox "Password":
  - /placeholder: Enter your password
  - text: password123
- button "Sign In"
- paragraph:
  - text: Don't have an account?
  - button "Register"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Board Flow', () => {
  4  |   const timestamp = Date.now();
  5  |   const testUser = {
  6  |     username: `board_user_${timestamp}`,
  7  |     email: `board_user_${timestamp}@example.com`,
  8  |     password: 'password123'
  9  |   };
  10 | 
  11 |   test.beforeAll(async ({ request }) => {
  12 |     // Create a user via API to use in tests
  13 |     await request.post('http://localhost:3001/api/auth/register', {
  14 |       data: testUser
  15 |     });
  16 |   });
  17 | 
  18 |   test.beforeEach(async ({ page }) => {
  19 |     // Login before each test
  20 |     await page.goto('/login');
  21 |     await page.locator('input[name="email"]').fill(testUser.email);
  22 |     await page.locator('input[name="password"]').fill(testUser.password);
  23 |     await page.locator('#btn-submit-login').click();
> 24 |     await expect(page).toHaveURL(/.*\/board/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  25 |   });
  26 | 
  27 |   test('should create a new post', async ({ page }) => {
  28 |     // Click New Post button
  29 |     await page.locator('button:has-text("New Post"), button:has-text("โพสต์ใหม่")').click();
  30 |     
  31 |     // Check if modal appears
  32 |     await expect(page.locator('.modal')).toBeVisible();
  33 |     
  34 |     // Fill form
  35 |     const postTitle = `Test Post ${Date.now()}`;
  36 |     await page.locator('input[placeholder*="title"], input[placeholder*="หัวข้อ"]').fill(postTitle);
  37 |     await page.locator('textarea[placeholder*="thoughts"], textarea[placeholder*="ความคิด"]').fill('This is a test post content.');
  38 |     
  39 |     // Submit
  40 |     await page.locator('button[type="submit"]').click();
  41 |     
  42 |     // Modal should disappear
  43 |     await expect(page.locator('.modal')).not.toBeVisible();
  44 |     
  45 |     // Post should be in the list
  46 |     await expect(page.locator('.post-card-title').first()).toHaveText(postTitle);
  47 |   });
  48 | 
  49 |   test('should open a post and add a reply', async ({ page }) => {
  50 |     // Ensure there's a post
  51 |     const postCards = page.locator('.post-card');
  52 |     if (await postCards.count() === 0) {
  53 |       test.skip(); // Skip if no posts to reply to
  54 |     }
  55 | 
  56 |     // Click the first post
  57 |     await postCards.first().click();
  58 |     
  59 |     // Check if thread view appears
  60 |     await expect(page.locator('.thread-view')).toBeVisible();
  61 |     
  62 |     // Fill reply form
  63 |     const replyText = `Test reply ${Date.now()}`;
  64 |     await page.locator('textarea[placeholder*="reply"], textarea[placeholder*="การตอบกลับ"]').fill(replyText);
  65 |     
  66 |     // Submit
  67 |     await page.locator('form.reply-form button[type="submit"]').click();
  68 |     
  69 |     // Reply should appear in the list
  70 |     await expect(page.locator('.reply-content').last()).toContainText(replyText);
  71 |   });
  72 | });
  73 | 
```