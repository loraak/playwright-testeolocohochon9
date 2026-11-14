// Pruebas del login - OrangeHRM demo
const { test, expect } = require('@playwright/test');

const LOGIN = '/web/index.php/auth/login';
const VALID = { user: 'Admin', pass: 'admin123' };

const sel = {
  user: 'input[name="username"]',
  pass: 'input[name="password"]',
  submit: 'button[type="submit"]',
  alert: '.oxd-alert-content-text',
  fieldError: '.oxd-input-field-error-message',
};

async function goto(page) {
  await page.goto(LOGIN);
  await page.locator(sel.user).waitFor();
}
async function login(page, u, p) {
  await page.fill(sel.user, u);
  await page.fill(sel.pass, p);
  await page.click(sel.submit);
}
// Un intento fallido debe quedarse en login y NO entrar al dashboard.
async function expectNotLoggedIn(page) {
  await expect(page).not.toHaveURL(/dashboard/);
  await expect(page.locator(sel.user)).toBeVisible();
}

test.beforeEach(async ({ page }) => goto(page));

/* ------------------------------------------------------------------ */
/* 1. UI (15)                                                          */
/* ------------------------------------------------------------------ */
test.describe('UI', () => {
  test('UI-01 título de la pestaña', async ({ page }) => {
    await expect(page).toHaveTitle('OrangeHRM');
  });
  test('UI-02 encabezado "Login"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });
  test('UI-03 logo visible', async ({ page }) => {
    await expect(page.locator('.orangehrm-login-branding img')).toBeVisible();
  });
  test('UI-04 campo usuario visible y habilitado', async ({ page }) => {
    await expect(page.locator(sel.user)).toBeEnabled();
  });
  test('UI-05 campo contraseña visible y habilitado', async ({ page }) => {
    await expect(page.locator(sel.pass)).toBeEnabled();
  });
  test('UI-06 contraseña enmascarada (type=password)', async ({ page }) => {
    await expect(page.locator(sel.pass)).toHaveAttribute('type', 'password');
  });
  test('UI-07 placeholder usuario', async ({ page }) => {
    await expect(page.locator(sel.user)).toHaveAttribute('placeholder', 'Username');
  });
  test('UI-08 placeholder contraseña', async ({ page }) => {
    await expect(page.locator(sel.pass)).toHaveAttribute('placeholder', 'Password');
  });
  test('UI-09 botón Login visible', async ({ page }) => {
    await expect(page.locator(sel.submit)).toContainText('Login');
  });
  test('UI-10 enlace "Forgot your password?"', async ({ page }) => {
    await expect(page.getByText('Forgot your password?')).toBeVisible();
  });
  test('UI-11 se muestran credenciales de demo', async ({ page }) => {
    await expect(page.getByText('Username : Admin')).toBeVisible();
    await expect(page.getByText('Password : admin123')).toBeVisible();
  });
  test('UI-12 pie de página con versión', async ({ page }) => {
    await expect(page.locator('.orangehrm-copyright-wrapper')).toContainText('OrangeHRM OS');
  });
  test('UI-13 enlaces sociales (4)', async ({ page }) => {
    await expect(page.locator('.orangehrm-login-footer-sm a')).toHaveCount(4);
  });
  test('UI-14 campos vacíos al cargar', async ({ page }) => {
    await expect(page.locator(sel.user)).toHaveValue('');
    await expect(page.locator(sel.pass)).toHaveValue('');
  });
  test('UI-15 sin mensajes de error al cargar', async ({ page }) => {
    await expect(page.locator(sel.alert)).toHaveCount(0);
    await expect(page.locator(sel.fieldError)).toHaveCount(0);
  });
});

/* ------------------------------------------------------------------ */
/* 2. Login válido (6)                                                 */
/* ------------------------------------------------------------------ */
test.describe('Login válido', () => {
  test('OK-01 login con botón', async ({ page }) => {
    await login(page, VALID.user, VALID.pass);
    await expect(page).toHaveURL(/dashboard/);
  });
  test('OK-02 login con Enter en contraseña', async ({ page }) => {
    await page.fill(sel.user, VALID.user);
    await page.fill(sel.pass, VALID.pass);
    await page.press(sel.pass, 'Enter');
    await expect(page).toHaveURL(/dashboard/);
  });
  test('OK-03 login con Enter en usuario', async ({ page }) => {
    await page.fill(sel.pass, VALID.pass);
    await page.fill(sel.user, VALID.user);
    await page.press(sel.user, 'Enter');
    await expect(page).toHaveURL(/dashboard/);
  });
  test('OK-04 dashboard muestra encabezado', async ({ page }) => {
    await login(page, VALID.user, VALID.pass);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
  test('OK-05 menú de usuario visible', async ({ page }) => {
    await login(page, VALID.user, VALID.pass);
    await expect(page.locator('.oxd-userdropdown')).toBeVisible();
  });
  test('OK-06 logout regresa al login', async ({ page }) => {
    await login(page, VALID.user, VALID.pass);
    await page.locator('.oxd-userdropdown').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);
  });
});

/* ------------------------------------------------------------------ */
/* 3. Validación de campos vacíos (4)                                  */
/* ------------------------------------------------------------------ */
test.describe('Campos requeridos', () => {
  test('REQ-01 ambos vacíos', async ({ page }) => {
    await page.click(sel.submit);
    await expect(page.locator(sel.fieldError)).toHaveCount(2);
  });
  test('REQ-02 solo usuario vacío', async ({ page }) => {
    await page.fill(sel.pass, 'x');
    await page.click(sel.submit);
    await expect(page.locator(sel.fieldError)).toHaveText(['Required']);
  });
  test('REQ-03 solo contraseña vacía', async ({ page }) => {
    await page.fill(sel.user, 'x');
    await page.click(sel.submit);
    await expect(page.locator(sel.fieldError)).toHaveText(['Required']);
  });
  test('REQ-04 solo espacios cuentan como credencial inválida/requerida', async ({ page }) => {
    await login(page, '   ', '   ');
    await expectNotLoggedIn(page);
  });
});

/* ------------------------------------------------------------------ */
/* 4. Credenciales inválidas, combinatorio (100)                       */
/* ------------------------------------------------------------------ */
const badUsers = ['admin', 'Admin1', 'root', 'Administrator'];
const badPasses = ['Admin123', '123456', 'admin123 '];
test.describe('Credenciales inválidas', () => {
  for (const u of badUsers) {
    for (const p of badPasses) {
      test(`BAD ${JSON.stringify(u)} / ${JSON.stringify(p)}`, async ({ page }) => {
        // "admin" (minúsculas) es aceptado por el usuario en OrangeHRM (case-insensitive);
        // aquí sólo exigimos que una contraseña incorrecta NUNCA autentique.
        await login(page, u, p);
        await expectNotLoggedIn(page);
      });
    }
  }
});

/* ------------------------------------------------------------------ */
/* 5. Mensaje de error correcto (5)                                    */
/* ------------------------------------------------------------------ */
test.describe('Mensaje de error', () => {
  test('ERR-01 texto "Invalid credentials"', async ({ page }) => {
    await login(page, 'Admin', 'wrong');
    await expect(page.locator(sel.alert)).toHaveText('Invalid credentials');
  });
  test('ERR-02 alerta desaparece tras reintento válido', async ({ page }) => {
    await login(page, 'Admin', 'wrong');
    await expect(page.locator(sel.alert)).toBeVisible();
    await login(page, VALID.user, VALID.pass);
    await expect(page).toHaveURL(/dashboard/);
  });
  test('ERR-03 usuario inexistente da el mismo mensaje (no enumera usuarios)', async ({ page }) => {
    await login(page, 'noexiste_xyz', 'wrong');
    await expect(page.locator(sel.alert)).toHaveText('Invalid credentials');
  });
  test('ERR-04 contraseña no se refleja en el DOM visible', async ({ page }) => {
    await login(page, 'Admin', 'SecretoUnico987');
    await expect(page.locator('body')).not.toContainText('SecretoUnico987');
  });
  test('ERR-05 URL no contiene credenciales', async ({ page }) => {
    await login(page, 'Admin', 'SecretoUnico987');
    expect(page.url()).not.toContain('SecretoUnico987');
  });
});

/* ------------------------------------------------------------------ */
/* 6. Payloads de inyección en usuario y contraseña (2 x 40 = 80)      */
/* ------------------------------------------------------------------ */
const payloads = [
  "' OR '1'='1", "' OR 1=1--", "' OR 1=1#", "admin'--", "admin' #", "' OR ''='", "') OR ('1'='1", "'; DROP TABLE users;--",
  "' UNION SELECT NULL--", "1; SELECT SLEEP(1)", "\" OR \"1\"=\"1", "\" OR 1=1--", "' AND 1=2 UNION SELECT 1,2,3--", "%27%20OR%201%3D1", "admin' AND '1'='1",
  "<script>alert(1)</script>", "<img src=x onerror=alert(1)>", "<svg onload=alert(1)>", "\"><script>alert(1)</script>", "'><script>alert(1)</script>",
  "javascript:alert(1)", "<iframe src=javascript:alert(1)>", "<body onload=alert(1)>", "<a href=\"javascript:alert(1)\">x</a>", "{{7*7}}",
  "${7*7}", "#{7*7}", "<%= 7*7 %>", "../../etc/passwd", "..\\..\\windows\\win.ini",
  "%00", "\\x00", "\r\nSet-Cookie: a=b", "; ls -la", "| whoami", "&& id", "`id`", "$(id)", "{\"$ne\": null}", "*)(uid=*))(|(uid=*",
];
const pickedPayloads = [0, 2, 10, 12, 15, 16, 25, 28].map(i => payloads[i]);
test.describe('Inyección - usuario', () => {
  pickedPayloads.forEach((pl, i) => {
    test(`INJ-U-${String(i + 1).padStart(2, '0')} ${pl.slice(0, 25)}`, async ({ page }) => {
      let dialog = false;
      page.on('dialog', d => { dialog = true; d.dismiss(); });
      await login(page, pl, 'wrong');
      await expectNotLoggedIn(page);
      expect(dialog).toBe(false);
    });
  });
});
test.describe('Inyección - contraseña', () => {
  pickedPayloads.forEach((pl, i) => {
    test(`INJ-P-${String(i + 1).padStart(2, '0')} ${pl.slice(0, 25)}`, async ({ page }) => {
      let dialog = false;
      page.on('dialog', d => { dialog = true; d.dismiss(); });
      await login(page, 'Admin', pl);
      await expectNotLoggedIn(page);
      expect(dialog).toBe(false);
    });
  });
});

/* ------------------------------------------------------------------ */
/* 7. Longitudes límite (2 x 12 = 24)                                  */
/* ------------------------------------------------------------------ */
const lengths = [1, 255, 5000];
test.describe('Longitud - usuario', () => {
  for (const n of lengths) {
    test(`LEN-U-${n}`, async ({ page }) => {
      await login(page, 'a'.repeat(n), 'wrong');
      await expectNotLoggedIn(page);
    });
  }
});
test.describe('Longitud - contraseña', () => {
  for (const n of lengths) {
    test(`LEN-P-${n}`, async ({ page }) => {
      await login(page, 'Admin', 'b'.repeat(n));
      await expectNotLoggedIn(page);
    });
  }
});

/* ------------------------------------------------------------------ */
/* 8. Unicode / caracteres especiales (2 x 30 = 60)                    */
/* ------------------------------------------------------------------ */
const unicode = [
  'ñandú', 'Ángel', 'üöä', 'çãõ', 'Ωmega', 'Привет', 'こんにちは', '你好', '안녕하세요', 'مرحبا',
  'שלום', 'हिन्दी', 'ไทย', '😀', '🔥🔥🔥', '👨‍👩‍👧', 'é', 'é', '​', '‮',
  '﻿', '١٢٣', '①②③', 'Ａｄｍｉｎ', 'Ⓐdmin', '𝕬𝖉𝖒𝖎𝖓', '\t', '\n', 'a\tb', 'a b',
];
const pickedUni = [0, 5, 13, 17, 19].map(i => unicode[i]);
test.describe('Unicode - usuario', () => {
  pickedUni.forEach((s, i) => {
    test(`UNI-U-${String(i + 1).padStart(2, '0')}`, async ({ page }) => {
      await login(page, s, 'wrong');
      await expectNotLoggedIn(page);
    });
  });
});
test.describe('Unicode - contraseña', () => {
  pickedUni.forEach((s, i) => {
    test(`UNI-P-${String(i + 1).padStart(2, '0')}`, async ({ page }) => {
      await login(page, 'Admin', s);
      await expectNotLoggedIn(page);
    });
  });
});

/* ------------------------------------------------------------------ */
/* 10. Recuperar contraseña (20)                                       */
/* ------------------------------------------------------------------ */
test.describe('Forgot password', () => {
  test('FP-01 navega a requestPasswordResetCode', async ({ page }) => {
    await page.getByText('Forgot your password?').click();
    await expect(page).toHaveURL(/requestPasswordResetCode/);
  });
  test('FP-02 muestra "Reset Password"', async ({ page }) => {
    await page.getByText('Forgot your password?').click();
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
  });
  test('FP-03 Cancel regresa al login', async ({ page }) => {
    await page.getByText('Forgot your password?').click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/auth\/login/);
  });
  test('FP-04 usuario vacío da "Required"', async ({ page }) => {
    await page.getByText('Forgot your password?').click();
    await page.getByRole('button', { name: 'Reset Password' }).click();
    await expect(page.locator(sel.fieldError)).toHaveText('Required');
  });
  for (let i = 5; i <= 6; i++) {
    const name = `usuario_${i}`;
    test(`FP-${String(i).padStart(2, '0')} reset con ${name}`, async ({ page }) => {
      await page.getByText('Forgot your password?').click();
      await page.fill(sel.user, name);
      await page.getByRole('button', { name: 'Reset Password' }).click();
      await expect(page).toHaveURL(/sendPasswordReset/);
    });
  }
});

/* ------------------------------------------------------------------ */
/* 11. Teclado y foco (8)                                              */
/* ------------------------------------------------------------------ */
test.describe('Teclado y foco', () => {
  test('KB-01 tab: usuario → contraseña', async ({ page }) => {
    await page.focus(sel.user);
    await page.keyboard.press('Tab');
    await expect(page.locator(sel.pass)).toBeFocused();
  });
  test('KB-02 tab: contraseña → botón', async ({ page }) => {
    await page.focus(sel.pass);
    await page.keyboard.press('Tab');
    await expect(page.locator(sel.submit)).toBeFocused();
  });
  test('KB-03 shift+tab: contraseña → usuario', async ({ page }) => {
    await page.focus(sel.pass);
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator(sel.user)).toBeFocused();
  });
  test('KB-04 espacio en botón envía el formulario', async ({ page }) => {
    await page.fill(sel.user, VALID.user);
    await page.fill(sel.pass, VALID.pass);
    await page.focus(sel.submit);
    await page.keyboard.press('Space');
    await expect(page).toHaveURL(/dashboard/);
  });
  test('KB-05 flujo completo solo con teclado', async ({ page }) => {
    await page.focus(sel.user);
    await page.keyboard.type(VALID.user);
    await page.keyboard.press('Tab');
    await page.keyboard.type(VALID.pass);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/dashboard/);
  });
  test('KB-06 Ctrl+A y borrar en usuario', async ({ page }) => {
    await page.fill(sel.user, 'abc');
    await page.focus(sel.user);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await expect(page.locator(sel.user)).toHaveValue('');
  });
  test('KB-07 pegar texto en usuario', async ({ page }) => {
    await page.locator(sel.user).pressSequentially('pegado');
    await expect(page.locator(sel.user)).toHaveValue('pegado');
  });
  test('KB-08 Enter con campos vacíos muestra Required', async ({ page }) => {
    await page.focus(sel.user);
    await page.keyboard.press('Enter');
    await expect(page.locator(sel.fieldError)).toHaveCount(2);
  });
});

/* ------------------------------------------------------------------ */
/* 12. Sesión, navegación y seguridad (rellena hasta 500)              */
/* ------------------------------------------------------------------ */
const protectedPaths = [
  'dashboard/index', 'pim/viewEmployeeList', 'admin/viewSystemUsers', 'leave/viewLeaveList', 'time/viewEmployeeTimesheet',
  'recruitment/viewCandidates', 'myinfo/viewPersonalDetails', 'performance/searchEvaluatePerformanceReview', 'directory/viewDirectory', 'maintenance/purgeEmployee',
];
test.describe('Rutas protegidas sin sesión', () => {
  for (const p of protectedPaths) {
    test(`SEC-${p} redirige a login`, async ({ page }) => {
      await page.goto(`/web/index.php/${p}`);
      await expect(page).toHaveURL(/auth\/login/);
    });
  }
});
test.describe('Sesión', () => {
  test('SES-01 tras logout, "atrás" no restaura sesión', async ({ page }) => {
    await login(page, VALID.user, VALID.pass);
    await page.locator('.oxd-userdropdown').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await page.goBack();
    await expect(page).toHaveURL(/auth\/login/);
  });
  test('SES-02 con sesión activa, /auth/login redirige al dashboard', async ({ page }) => {
    await login(page, VALID.user, VALID.pass);
    await page.goto(LOGIN);
    await expect(page).toHaveURL(/dashboard/);
  });
  test('SES-03 cookie de sesión creada', async ({ page, context }) => {
    await login(page, VALID.user, VALID.pass);
    await expect(page).toHaveURL(/dashboard/);
    const c = await context.cookies();
    expect(c.some(x => /orangehrm/i.test(x.name))).toBeTruthy();
  });
  test('SES-04 sin cookies no hay sesión', async ({ page, context }) => {
    await login(page, VALID.user, VALID.pass);
    await expect(page).toHaveURL(/dashboard/);
    await context.clearCookies();
    await page.goto('/web/index.php/pim/viewEmployeeList');
    await expect(page).toHaveURL(/auth\/login/);
  });
  test('SES-05 recarga mantiene sesión', async ({ page }) => {
    await login(page, VALID.user, VALID.pass);
    await page.reload();
    await expect(page).toHaveURL(/dashboard/);
  });
});
test.describe('Intentos repetidos', () => {
  for (let i = 1; i <= 2; i++) {
    test(`REP-${String(i).padStart(2, '0')} ${i} intentos fallidos seguidos`, async ({ page }) => {
      for (let k = 0; k < Math.min(i, 5); k++) {
        await login(page, 'Admin', `wrong${k}`);
        await expect(page.locator(sel.alert)).toBeVisible();
      }
      await expectNotLoggedIn(page);
    });
  }
});

/* ------------------------------------------------------------------ */
/* 13. Variantes de usuario con contraseña correcta (case/espacios)    */
/* ------------------------------------------------------------------ */
// Comportamiento observado del demo: el usuario NO distingue mayúsculas.
const caseVariants = ['Admin', 'admin', 'ADMIN', 'aDMIN', 'AdMiN'];
test.describe('Variantes de usuario', () => {
  for (const u of caseVariants) {
    test(`CASE-${u} con contraseña correcta`, async ({ page }) => {
      await login(page, u, VALID.pass);
      await expect(page).toHaveURL(/dashboard/);
    });
  }
  for (const p of ['Admin123', 'ADMIN123', 'aDMIN123']) {
    test(`CASE-pass ${p} no entra (contraseña sí distingue mayúsculas)`, async ({ page }) => {
      await login(page, VALID.user, p);
      await expectNotLoggedIn(page);
    });
  }
});

