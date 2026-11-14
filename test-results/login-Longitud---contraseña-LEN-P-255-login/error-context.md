# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\login.spec.js >> Longitud - contraseña >> LEN-P-255
- Location: tests\login.spec.js:241:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[name="username"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('input[name="username"]') with timeout 5000ms
  - waiting for locator('input[name="username"]')
    - waiting for navigation to finish...
    - navigated to "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login"

```

# Page snapshot

```yaml
- generic [ref=f1e4]:
  - generic [ref=f1e6]:
    - img "company-branding" [ref=f1e8]
    - generic [ref=f1e9]:
      - heading "Login" [level=5] [ref=f1e10]
      - generic [ref=f1e11]:
        - generic [ref=f1e12]:
          - alert [ref=f1e13]:
            - generic [ref=f1e14]:
              - generic [ref=f1e15]: 
              - paragraph [ref=f1e16]: Invalid credentials
          - generic [ref=f1e18]:
            - paragraph [ref=f1e19]: "Username : Admin"
            - paragraph [ref=f1e20]: "Password : admin123"
        - generic [ref=f1e21]:
          - generic [ref=f1e23]:
            - generic [ref=f1e24]:
              - generic [ref=f1e25]: 
              - generic [ref=f1e26]: Username
            - textbox "Username" [active] [ref=f1e28]
          - generic [ref=f1e30]:
            - generic [ref=f1e31]:
              - generic [ref=f1e32]: 
              - generic [ref=f1e33]: Password
            - textbox "Password" [ref=f1e35]
          - button "Login" [ref=f1e37] [cursor=pointer]
          - paragraph [ref=f1e39] [cursor=pointer]: Forgot your password?
      - generic [ref=f1e40]:
        - generic [ref=f1e41]:
          - link [ref=f1e42] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/orangehrm/mycompany/
          - link [ref=f1e45] [cursor=pointer]:
            - /url: https://www.facebook.com/OrangeHRM/
          - link [ref=f1e48] [cursor=pointer]:
            - /url: https://twitter.com/orangehrm?lang=en
          - link [ref=f1e51] [cursor=pointer]:
            - /url: https://www.youtube.com/c/OrangeHRMInc
        - generic [ref=f1e54]:
          - paragraph [ref=f1e55]: OrangeHRM OS 5.9
          - paragraph [ref=f1e56]:
            - text: © 2005 - 2026
            - link "OrangeHRM, Inc" [ref=f1e57] [cursor=pointer]:
              - /url: http://www.orangehrm.com
            - text: . All rights reserved.
  - img "orangehrm-logo" [ref=f1e59]
```

# Test source

```ts
  1   | // Pruebas del login - OrangeHRM demo
  2   | const { test, expect } = require('@playwright/test');
  3   | 
  4   | const LOGIN = '/web/index.php/auth/login';
  5   | const VALID = { user: 'Admin', pass: 'admin123' };
  6   | 
  7   | const sel = {
  8   |   user: 'input[name="username"]',
  9   |   pass: 'input[name="password"]',
  10  |   submit: 'button[type="submit"]',
  11  |   alert: '.oxd-alert-content-text',
  12  |   fieldError: '.oxd-input-field-error-message',
  13  | };
  14  | 
  15  | async function goto(page) {
  16  |   await page.goto(LOGIN);
  17  |   await page.locator(sel.user).waitFor();
  18  | }
  19  | async function login(page, u, p) {
  20  |   await page.fill(sel.user, u);
  21  |   await page.fill(sel.pass, p);
  22  |   await page.click(sel.submit);
  23  | }
  24  | // Un intento fallido debe quedarse en login y NO entrar al dashboard.
  25  | async function expectNotLoggedIn(page) {
  26  |   await expect(page).not.toHaveURL(/dashboard/);
> 27  |   await expect(page.locator(sel.user)).toBeVisible();
      |                                        ^ Error: expect(locator).toBeVisible() failed
  28  | }
  29  | 
  30  | test.beforeEach(async ({ page }) => goto(page));
  31  | 
  32  | /* ------------------------------------------------------------------ */
  33  | /* 1. UI (15)                                                          */
  34  | /* ------------------------------------------------------------------ */
  35  | test.describe('UI', () => {
  36  |   test('UI-01 título de la pestaña', async ({ page }) => {
  37  |     await expect(page).toHaveTitle('OrangeHRM');
  38  |   });
  39  |   test('UI-02 encabezado "Login"', async ({ page }) => {
  40  |     await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  41  |   });
  42  |   test('UI-03 logo visible', async ({ page }) => {
  43  |     await expect(page.locator('.orangehrm-login-branding img')).toBeVisible();
  44  |   });
  45  |   test('UI-04 campo usuario visible y habilitado', async ({ page }) => {
  46  |     await expect(page.locator(sel.user)).toBeEnabled();
  47  |   });
  48  |   test('UI-05 campo contraseña visible y habilitado', async ({ page }) => {
  49  |     await expect(page.locator(sel.pass)).toBeEnabled();
  50  |   });
  51  |   test('UI-06 contraseña enmascarada (type=password)', async ({ page }) => {
  52  |     await expect(page.locator(sel.pass)).toHaveAttribute('type', 'password');
  53  |   });
  54  |   test('UI-07 placeholder usuario', async ({ page }) => {
  55  |     await expect(page.locator(sel.user)).toHaveAttribute('placeholder', 'Username');
  56  |   });
  57  |   test('UI-08 placeholder contraseña', async ({ page }) => {
  58  |     await expect(page.locator(sel.pass)).toHaveAttribute('placeholder', 'Password');
  59  |   });
  60  |   test('UI-09 botón Login visible', async ({ page }) => {
  61  |     await expect(page.locator(sel.submit)).toContainText('Login');
  62  |   });
  63  |   test('UI-10 enlace "Forgot your password?"', async ({ page }) => {
  64  |     await expect(page.getByText('Forgot your password?')).toBeVisible();
  65  |   });
  66  |   test('UI-11 se muestran credenciales de demo', async ({ page }) => {
  67  |     await expect(page.getByText('Username : Admin')).toBeVisible();
  68  |     await expect(page.getByText('Password : admin123')).toBeVisible();
  69  |   });
  70  |   test('UI-12 pie de página con versión', async ({ page }) => {
  71  |     await expect(page.locator('.orangehrm-copyright-wrapper')).toContainText('OrangeHRM OS');
  72  |   });
  73  |   test('UI-13 enlaces sociales (4)', async ({ page }) => {
  74  |     await expect(page.locator('.orangehrm-login-footer-sm a')).toHaveCount(4);
  75  |   });
  76  |   test('UI-14 campos vacíos al cargar', async ({ page }) => {
  77  |     await expect(page.locator(sel.user)).toHaveValue('');
  78  |     await expect(page.locator(sel.pass)).toHaveValue('');
  79  |   });
  80  |   test('UI-15 sin mensajes de error al cargar', async ({ page }) => {
  81  |     await expect(page.locator(sel.alert)).toHaveCount(0);
  82  |     await expect(page.locator(sel.fieldError)).toHaveCount(0);
  83  |   });
  84  | });
  85  | 
  86  | /* ------------------------------------------------------------------ */
  87  | /* 2. Login válido (6)                                                 */
  88  | /* ------------------------------------------------------------------ */
  89  | test.describe('Login válido', () => {
  90  |   test('OK-01 login con botón', async ({ page }) => {
  91  |     await login(page, VALID.user, VALID.pass);
  92  |     await expect(page).toHaveURL(/dashboard/);
  93  |   });
  94  |   test('OK-02 login con Enter en contraseña', async ({ page }) => {
  95  |     await page.fill(sel.user, VALID.user);
  96  |     await page.fill(sel.pass, VALID.pass);
  97  |     await page.press(sel.pass, 'Enter');
  98  |     await expect(page).toHaveURL(/dashboard/);
  99  |   });
  100 |   test('OK-03 login con Enter en usuario', async ({ page }) => {
  101 |     await page.fill(sel.pass, VALID.pass);
  102 |     await page.fill(sel.user, VALID.user);
  103 |     await page.press(sel.user, 'Enter');
  104 |     await expect(page).toHaveURL(/dashboard/);
  105 |   });
  106 |   test('OK-04 dashboard muestra encabezado', async ({ page }) => {
  107 |     await login(page, VALID.user, VALID.pass);
  108 |     await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  109 |   });
  110 |   test('OK-05 menú de usuario visible', async ({ page }) => {
  111 |     await login(page, VALID.user, VALID.pass);
  112 |     await expect(page.locator('.oxd-userdropdown')).toBeVisible();
  113 |   });
  114 |   test('OK-06 logout regresa al login', async ({ page }) => {
  115 |     await login(page, VALID.user, VALID.pass);
  116 |     await page.locator('.oxd-userdropdown').click();
  117 |     await page.getByRole('menuitem', { name: 'Logout' }).click();
  118 |     await expect(page).toHaveURL(/auth\/login/);
  119 |   });
  120 | });
  121 | 
  122 | /* ------------------------------------------------------------------ */
  123 | /* 3. Validación de campos vacíos (4)                                  */
  124 | /* ------------------------------------------------------------------ */
  125 | test.describe('Campos requeridos', () => {
  126 |   test('REQ-01 ambos vacíos', async ({ page }) => {
  127 |     await page.click(sel.submit);
```