# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard Flow >> should load dashboard and display stats
- Location: tests\dashboard.spec.ts:27:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/board/
Received string:  "http://localhost:5173/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "http://localhost:5173/login"

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
  - text: dashboard_user_1779584922049@example.com
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
  3  | test.describe('Dashboard Flow', () => {
  4  |   const timestamp = Date.now();
  5  |   const testUser = {
  6  |     username: `dashboard_user_${timestamp}`,
  7  |     email: `dashboard_user_${timestamp}@example.com`,
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
> 24 |     await expect(page).toHaveURL(/.*\/board/); // Assuming redirect to board on login
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  25 |   });
  26 | 
  27 |   test('should load dashboard and display stats', async ({ page }) => {
  28 |     // Navigate to dashboard
  29 |     await page.goto('/dashboard');
  30 |     
  31 |     // Check if dashboard header is visible
  32 |     await expect(page.locator('.dashboard-title, .gradient-text').first()).toBeVisible();
  33 |     
  34 |     // Check if KPI cards are rendered
  35 |     await expect(page.locator('.stat-card').first()).toBeVisible();
  36 |     
  37 |     // Ensure all 4 KPI cards exist
  38 |     await expect(page.locator('.stat-card')).toHaveCount(4);
  39 |     
  40 |     // Check if chart container exists
  41 |     await expect(page.locator('.chart-container')).toBeVisible();
  42 |     
  43 |     // Check if Top Users table is rendered
  44 |     await expect(page.locator('.data-table')).toBeVisible();
  45 |     
  46 |     // Check if Recent Activity list is rendered
  47 |     await expect(page.locator('.activity-list')).toBeVisible();
  48 |   });
  49 | });
  50 | 
```