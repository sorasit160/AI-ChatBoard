# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> should login successfully
- Location: tests\auth.spec.ts:40:3

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
  - text: login_user_1779584919118@example.com
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
  3  | test.describe('Authentication Flow', () => {
  4  |   const timestamp = Date.now();
  5  |   const testUser = {
  6  |     username: `user_${timestamp}`,
  7  |     email: `user_${timestamp}@example.com`,
  8  |     password: 'password123'
  9  |   };
  10 | 
  11 |   test('should redirect unauthenticated user from protected routes', async ({ page }) => {
  12 |     await page.goto('/board');
  13 |     // Should be redirected to login
  14 |     await expect(page).toHaveURL(/.*\/login/);
  15 |     await expect(page.locator('.auth-alert.warning')).toBeVisible();
  16 |   });
  17 | 
  18 |   test('should register a new user successfully', async ({ page }) => {
  19 |     await page.goto('/login');
  20 |     
  21 |     // Switch to register mode
  22 |     await page.locator('#btn-toggle-auth').click();
  23 |     
  24 |     // Fill form
  25 |     await page.locator('input[name="username"]').fill(testUser.username);
  26 |     await page.locator('input[name="email"]').fill(testUser.email);
  27 |     await page.locator('input[name="password"]').fill(testUser.password);
  28 |     
  29 |     // Submit
  30 |     await page.locator('#btn-submit-register').click();
  31 |     
  32 |     // Should redirect to board
  33 |     await expect(page).toHaveURL(/.*\/board/);
  34 |     
  35 |     // Navbar should show username and logout button
  36 |     await expect(page.locator('.user-name')).toContainText(testUser.username);
  37 |     await expect(page.locator('#btn-logout')).toBeVisible();
  38 |   });
  39 | 
  40 |   test('should login successfully', async ({ page }) => {
  41 |     // Create a new unique user for this test to avoid parallel execution issues
  42 |     const loginUser = {
  43 |       username: `login_user_${Date.now()}`,
  44 |       email: `login_user_${Date.now()}@example.com`,
  45 |       password: 'password123'
  46 |     };
  47 |     
  48 |     // Register the user via API first
  49 |     await page.request.post('http://localhost:3001/api/auth/register', {
  50 |       data: loginUser
  51 |     });
  52 | 
  53 |     await page.goto('/login');
  54 |     
  55 |     // Fill form
  56 |     await page.locator('input[name="email"]').fill(loginUser.email);
  57 |     await page.locator('input[name="password"]').fill(loginUser.password);
  58 |     
  59 |     // Submit
  60 |     await page.locator('#btn-submit-login').click();
  61 |     
  62 |     // Should redirect to board
> 63 |     await expect(page).toHaveURL(/.*\/board/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  64 |   });
  65 | 
  66 |   test('should show error on invalid login', async ({ page }) => {
  67 |     await page.goto('/login');
  68 |     
  69 |     await page.locator('input[name="email"]').fill('wrong@example.com');
  70 |     await page.locator('input[name="password"]').fill('wrongpass');
  71 |     
  72 |     await page.locator('#btn-submit-login').click();
  73 |     
  74 |     // Should show error alert
  75 |     await expect(page.locator('.auth-alert.error')).toBeVisible();
  76 |   });
  77 | });
  78 | 
```