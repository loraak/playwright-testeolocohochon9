# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\login.spec.js >> Rutas protegidas sin sesión >> SEC-myinfo/viewPersonalDetails redirige a login
- Location: tests\login.spec.js:368:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /auth\/login/
Received string:  "https://opensource-demo.orangehrmlive.com/web/index.php/myinfo/viewPersonalDetails"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × locator resolved to <html>…</html>
       - unexpected value "https://opensource-demo.orangehrmlive.com/web/index.php/myinfo/viewPersonalDetails"

```

# Test source

```ts
  270 |     });
  271 |   });
  272 | });
  273 | 
  274 | /* ------------------------------------------------------------------ */
  275 | /* 10. Recuperar contraseña (20)                                       */
  276 | /* ------------------------------------------------------------------ */
  277 | test.describe('Forgot password', () => {
  278 |   test('FP-01 navega a requestPasswordResetCode', async ({ page }) => {
  279 |     await page.getByText('Forgot your password?').click();
  280 |     await expect(page).toHaveURL(/requestPasswordResetCode/);
  281 |   });
  282 |   test('FP-02 muestra "Reset Password"', async ({ page }) => {
  283 |     await page.getByText('Forgot your password?').click();
  284 |     await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
  285 |   });
  286 |   test('FP-03 Cancel regresa al login', async ({ page }) => {
  287 |     await page.getByText('Forgot your password?').click();
  288 |     await page.getByRole('button', { name: 'Cancel' }).click();
  289 |     await expect(page).toHaveURL(/auth\/login/);
  290 |   });
  291 |   test('FP-04 usuario vacío da "Required"', async ({ page }) => {
  292 |     await page.getByText('Forgot your password?').click();
  293 |     await page.getByRole('button', { name: 'Reset Password' }).click();
  294 |     await expect(page.locator(sel.fieldError)).toHaveText('Required');
  295 |   });
  296 |   for (let i = 5; i <= 6; i++) {
  297 |     const name = `usuario_${i}`;
  298 |     test(`FP-${String(i).padStart(2, '0')} reset con ${name}`, async ({ page }) => {
  299 |       await page.getByText('Forgot your password?').click();
  300 |       await page.fill(sel.user, name);
  301 |       await page.getByRole('button', { name: 'Reset Password' }).click();
  302 |       await expect(page).toHaveURL(/sendPasswordReset/);
  303 |     });
  304 |   }
  305 | });
  306 | 
  307 | /* ------------------------------------------------------------------ */
  308 | /* 11. Teclado y foco (8)                                              */
  309 | /* ------------------------------------------------------------------ */
  310 | test.describe('Teclado y foco', () => {
  311 |   test('KB-01 tab: usuario → contraseña', async ({ page }) => {
  312 |     await page.focus(sel.user);
  313 |     await page.keyboard.press('Tab');
  314 |     await expect(page.locator(sel.pass)).toBeFocused();
  315 |   });
  316 |   test('KB-02 tab: contraseña → botón', async ({ page }) => {
  317 |     await page.focus(sel.pass);
  318 |     await page.keyboard.press('Tab');
  319 |     await expect(page.locator(sel.submit)).toBeFocused();
  320 |   });
  321 |   test('KB-03 shift+tab: contraseña → usuario', async ({ page }) => {
  322 |     await page.focus(sel.pass);
  323 |     await page.keyboard.press('Shift+Tab');
  324 |     await expect(page.locator(sel.user)).toBeFocused();
  325 |   });
  326 |   test('KB-04 espacio en botón envía el formulario', async ({ page }) => {
  327 |     await page.fill(sel.user, VALID.user);
  328 |     await page.fill(sel.pass, VALID.pass);
  329 |     await page.focus(sel.submit);
  330 |     await page.keyboard.press('Space');
  331 |     await expect(page).toHaveURL(/dashboard/);
  332 |   });
  333 |   test('KB-05 flujo completo solo con teclado', async ({ page }) => {
  334 |     await page.focus(sel.user);
  335 |     await page.keyboard.type(VALID.user);
  336 |     await page.keyboard.press('Tab');
  337 |     await page.keyboard.type(VALID.pass);
  338 |     await page.keyboard.press('Enter');
  339 |     await expect(page).toHaveURL(/dashboard/);
  340 |   });
  341 |   test('KB-06 Ctrl+A y borrar en usuario', async ({ page }) => {
  342 |     await page.fill(sel.user, 'abc');
  343 |     await page.focus(sel.user);
  344 |     await page.keyboard.press('Control+A');
  345 |     await page.keyboard.press('Backspace');
  346 |     await expect(page.locator(sel.user)).toHaveValue('');
  347 |   });
  348 |   test('KB-07 pegar texto en usuario', async ({ page }) => {
  349 |     await page.locator(sel.user).pressSequentially('pegado');
  350 |     await expect(page.locator(sel.user)).toHaveValue('pegado');
  351 |   });
  352 |   test('KB-08 Enter con campos vacíos muestra Required', async ({ page }) => {
  353 |     await page.focus(sel.user);
  354 |     await page.keyboard.press('Enter');
  355 |     await expect(page.locator(sel.fieldError)).toHaveCount(2);
  356 |   });
  357 | });
  358 | 
  359 | /* ------------------------------------------------------------------ */
  360 | /* 12. Sesión, navegación y seguridad (rellena hasta 500)              */
  361 | /* ------------------------------------------------------------------ */
  362 | const protectedPaths = [
  363 |   'dashboard/index', 'pim/viewEmployeeList', 'admin/viewSystemUsers', 'leave/viewLeaveList', 'time/viewEmployeeTimesheet',
  364 |   'recruitment/viewCandidates', 'myinfo/viewPersonalDetails', 'performance/searchEvaluatePerformanceReview', 'directory/viewDirectory', 'maintenance/purgeEmployee',
  365 | ];
  366 | test.describe('Rutas protegidas sin sesión', () => {
  367 |   for (const p of protectedPaths) {
  368 |     test(`SEC-${p} redirige a login`, async ({ page }) => {
  369 |       await page.goto(`/web/index.php/${p}`);
> 370 |       await expect(page).toHaveURL(/auth\/login/);
      |                          ^ Error: expect(page).toHaveURL(expected) failed
  371 |     });
  372 |   }
  373 | });
  374 | test.describe('Sesión', () => {
  375 |   test('SES-01 tras logout, "atrás" no restaura sesión', async ({ page }) => {
  376 |     await login(page, VALID.user, VALID.pass);
  377 |     await page.locator('.oxd-userdropdown').click();
  378 |     await page.getByRole('menuitem', { name: 'Logout' }).click();
  379 |     await page.goBack();
  380 |     await expect(page).toHaveURL(/auth\/login/);
  381 |   });
  382 |   test('SES-02 con sesión activa, /auth/login redirige al dashboard', async ({ page }) => {
  383 |     await login(page, VALID.user, VALID.pass);
  384 |     await page.goto(LOGIN);
  385 |     await expect(page).toHaveURL(/dashboard/);
  386 |   });
  387 |   test('SES-03 cookie de sesión creada', async ({ page, context }) => {
  388 |     await login(page, VALID.user, VALID.pass);
  389 |     await expect(page).toHaveURL(/dashboard/);
  390 |     const c = await context.cookies();
  391 |     expect(c.some(x => /orangehrm/i.test(x.name))).toBeTruthy();
  392 |   });
  393 |   test('SES-04 sin cookies no hay sesión', async ({ page, context }) => {
  394 |     await login(page, VALID.user, VALID.pass);
  395 |     await expect(page).toHaveURL(/dashboard/);
  396 |     await context.clearCookies();
  397 |     await page.goto('/web/index.php/pim/viewEmployeeList');
  398 |     await expect(page).toHaveURL(/auth\/login/);
  399 |   });
  400 |   test('SES-05 recarga mantiene sesión', async ({ page }) => {
  401 |     await login(page, VALID.user, VALID.pass);
  402 |     await page.reload();
  403 |     await expect(page).toHaveURL(/dashboard/);
  404 |   });
  405 | });
  406 | test.describe('Intentos repetidos', () => {
  407 |   for (let i = 1; i <= 2; i++) {
  408 |     test(`REP-${String(i).padStart(2, '0')} ${i} intentos fallidos seguidos`, async ({ page }) => {
  409 |       for (let k = 0; k < Math.min(i, 5); k++) {
  410 |         await login(page, 'Admin', `wrong${k}`);
  411 |         await expect(page.locator(sel.alert)).toBeVisible();
  412 |       }
  413 |       await expectNotLoggedIn(page);
  414 |     });
  415 |   }
  416 | });
  417 | 
  418 | /* ------------------------------------------------------------------ */
  419 | /* 13. Variantes de usuario con contraseña correcta (case/espacios)    */
  420 | /* ------------------------------------------------------------------ */
  421 | // Comportamiento observado del demo: el usuario NO distingue mayúsculas.
  422 | const caseVariants = ['Admin', 'admin', 'ADMIN', 'aDMIN', 'AdMiN'];
  423 | test.describe('Variantes de usuario', () => {
  424 |   for (const u of caseVariants) {
  425 |     test(`CASE-${u} con contraseña correcta`, async ({ page }) => {
  426 |       await login(page, u, VALID.pass);
  427 |       await expect(page).toHaveURL(/dashboard/);
  428 |     });
  429 |   }
  430 |   for (const p of ['Admin123', 'ADMIN123', 'aDMIN123']) {
  431 |     test(`CASE-pass ${p} no entra (contraseña sí distingue mayúsculas)`, async ({ page }) => {
  432 |       await login(page, VALID.user, p);
  433 |       await expectNotLoggedIn(page);
  434 |     });
  435 |   }
  436 | });
  437 | 
  438 | 
```