# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\app.spec.js >> Menú lateral >> MENU clic en "Recruitment" navega
- Location: tests\app.spec.js:94:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.oxd-layout-context')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.oxd-layout-context') with timeout 5000ms
  - waiting for locator('.oxd-layout-context')

```

# Test source

```ts
  1   | // Pruebas autenticadas (Admin / admin123) en todos los módulos de OrangeHRM demo.
  2   | // Sesión reutilizada desde .auth/admin.json (ver auth.setup.js).
  3   | const { test, expect } = require('@playwright/test');
  4   | 
  5   | const BASE = '/web/index.php';
  6   | const url = (p) => `${BASE}/${p}`;
  7   | const title = (page) => page.locator('.oxd-topbar-header-breadcrumb');
  8   | const menu = (page) => page.locator('.oxd-main-menu');
  9   | const err = (page) => page.locator('.oxd-input-field-error-message');
  10  | const rows = (page) => page.locator('.oxd-table-body .oxd-table-card');
  11  | 
  12  | async function open(page, path) {
  13  |   await page.goto(url(path));
  14  |   await title(page).waitFor();
  15  | }
  16  | 
  17  | /* =================================================================== */
  18  | /* A. Humo por página: catálogo de pantallas × 4 verificaciones        */
  19  | /*    (carga, sin error visible, sin 5xx de API, recarga mantiene)     */
  20  | /* =================================================================== */
  21  | const catalog = {
  22  |   Dashboard: ['dashboard/index'],
  23  |   Admin: [
  24  |     'admin/viewSystemUsers', 'admin/viewJobTitleList', 'admin/viewPayGrades', 'admin/employmentStatus',
  25  |     'admin/jobCategory', 'admin/workShift', 'admin/viewOrganizationGeneralInformation', 'admin/viewLocations',
  26  |     'admin/viewCompanyStructure', 'admin/nationality', 'admin/viewSkills', 'admin/viewEducation',
  27  |     'admin/viewLicenses', 'admin/viewLanguages', 'admin/viewMemberships', 'admin/localization',
  28  |     'admin/listMailConfiguration',
  29  |   ],
  30  |   PIM: [
  31  |     'pim/viewEmployeeList', 'pim/addEmployee', 'pim/configurePim', 'pim/listCustomFields',
  32  |     'pim/viewDefinedPredefinedReports', 'pim/viewReportingMethods', 'pim/viewTerminationReasons',
  33  |   ],
  34  |   Leave: [
  35  |     'leave/viewLeaveList', 'leave/applyLeave', 'leave/viewMyLeaveList', 'leave/viewLeaveEntitlements',
  36  |     'leave/addLeaveEntitlement', 'leave/viewLeaveEntitlementReport', 'leave/defineLeavePeriod',
  37  |     'leave/leaveTypeList', 'leave/viewHolidayList', 'leave/defineWorkWeek', 'leave/assignLeave',
  38  |   ],
  39  |   Time: [
  40  |     'time/viewEmployeeTimesheet', 'time/viewMyTimesheet', 'time/viewProjects', 'time/viewCustomers',
  41  |     'time/displayProjectReportCriteria',
  42  |     'time/viewMyAttendanceRecord', 'time/viewAttendanceRecord',
  43  |   ],
  44  |   Recruitment: ['recruitment/viewCandidates', 'recruitment/viewJobVacancy', 'recruitment/addCandidate', 'recruitment/addJobVacancy'],
  45  |   Performance: [
  46  |     'performance/searchEvaluatePerformanceReview', 'performance/myPerformanceReview',
  47  |     'performance/searchPerformanceReview', 'performance/searchKpi', 'performance/searchPerformanceTracker',
  48  |   ],
  49  |   Directory: ['directory/viewDirectory'],
  50  |   Maintenance: ['maintenance/viewMaintenanceModule'],
  51  |   Claim: ['claim/viewAssignClaim', 'claim/submitClaim', 'claim/viewMyClaims', 'claim/viewEvents', 'claim/viewExpenses'],
  52  |   Buzz: ['buzz/viewBuzz'],
  53  | };
  54  | 
  55  | for (const [mod, paths] of Object.entries(catalog)) {
  56  |   test.describe(`Humo ${mod}`, () => {
  57  |     for (const p of paths) {
  58  |       test(`${p} carga sin redirigir a login`, async ({ page }) => {
  59  |         await open(page, p);
  60  |         await expect(page).not.toHaveURL(/auth\/login/);
  61  |         await expect(page.locator('.oxd-layout-context')).toBeVisible();
  62  |       });
  63  |       test(`${p} sin mensaje de error`, async ({ page }) => {
  64  |         await open(page, p);
  65  |         await expect(page.getByText(/Page Not Found|Unexpected Error|Something went wrong/i)).toHaveCount(0);
  66  |       });
  67  |       test(`${p} sin respuestas 5xx de la API`, async ({ page }) => {
  68  |         const bad = [];
  69  |         page.on('response', (r) => { if (r.url().includes('/api/') && r.status() >= 500) bad.push(`${r.status()} ${r.url()}`); });
  70  |         await open(page, p);
  71  |         await page.waitForLoadState('networkidle');
  72  |         expect(bad).toEqual([]);
  73  |       });
  74  |       test(`${p} recarga mantiene sesión`, async ({ page }) => {
  75  |         await open(page, p);
  76  |         await page.reload();
  77  |         await expect(page).not.toHaveURL(/auth\/login/);
  78  |       });
  79  |     }
  80  |   });
  81  | }
  82  | 
  83  | /* =================================================================== */
  84  | /* B. Shell: menú lateral, búsqueda, responsive                        */
  85  | /* =================================================================== */
  86  | const modules = ['Admin', 'PIM', 'Leave', 'Time', 'Recruitment', 'My Info', 'Performance', 'Dashboard', 'Directory', 'Maintenance', 'Claim', 'Buzz'];
  87  | 
  88  | test.describe('Menú lateral', () => {
  89  |   for (const m of modules) {
  90  |     test(`MENU "${m}" visible`, async ({ page }) => {
  91  |       await open(page, 'dashboard/index');
  92  |       await expect(menu(page).getByText(m, { exact: true })).toBeVisible();
  93  |     });
  94  |     test(`MENU clic en "${m}" navega`, async ({ page }) => {
  95  |       await open(page, 'dashboard/index');
  96  |       await menu(page).getByText(m, { exact: true }).click();
  97  |       await expect(page).not.toHaveURL(/auth\/login|dashboard\/index$/).catch(() => {});
> 98  |       await expect(page.locator('.oxd-layout-context')).toBeVisible();
      |                                                         ^ Error: expect(locator).toBeVisible() failed
  99  |     });
  100 |   }
  101 |   for (const t of ['Admin', 'PIM', 'Leave', 'Time', 'Rec', 'Perf', 'Dir', 'Main', 'Claim', 'Buzz']) {
  102 |     test(`MENU buscar "${t}" filtra`, async ({ page }) => {
  103 |       await open(page, 'dashboard/index');
  104 |       await page.getByPlaceholder('Search').fill(t);
  105 |       await expect(menu(page).locator('li').first()).toContainText(new RegExp(t, 'i'));
  106 |     });
  107 |   }
  108 |   test('MENU buscar sin resultados', async ({ page }) => {
  109 |     await open(page, 'dashboard/index');
  110 |     await page.getByPlaceholder('Search').fill('zzzzzz');
  111 |     await expect(menu(page).locator('li')).toHaveCount(0);
  112 |   });
  113 |   test('MENU botón para colapsar/expandir', async ({ page }) => {
  114 |     await open(page, 'dashboard/index');
  115 |     const sidebar = page.locator('.oxd-sidepanel');
  116 |     const w0 = (await sidebar.boundingBox()).width;
  117 |     await page.locator('.oxd-main-menu-button, .oxd-sidepanel-header + * button').first().click().catch(() => {});
  118 |     await page.waitForTimeout(500);
  119 |     const w1 = (await sidebar.boundingBox()).width;
  120 |     expect(w1).not.toBe(w0);
  121 |   });
  122 | });
  123 | 
  124 | test.describe('Responsive (dashboard)', () => {
  125 |   for (const [w, h] of [[320, 568], [375, 812], [412, 915], [768, 1024], [1024, 768], [1366, 768], [1920, 1080], [2560, 1440]]) {
  126 |     test(`VP ${w}x${h} dashboard usable`, async ({ page }) => {
  127 |       await page.setViewportSize({ width: w, height: h });
  128 |       await open(page, 'dashboard/index');
  129 |       await expect(page.locator('.oxd-userdropdown')).toBeVisible();
  130 |       await expect(page.locator('.oxd-layout-context')).toBeVisible();
  131 |     });
  132 |   }
  133 | });
  134 | 
  135 | /* =================================================================== */
  136 | /* C. Dashboard                                                        */
  137 | /* =================================================================== */
  138 | test.describe('Dashboard', () => {
  139 |   for (const w of ['Time at Work', 'My Actions', 'Quick Launch', 'Buzz Latest Posts', 'Employees on Leave Today', 'Employee Distribution by Sub Unit', 'Employee Distribution by Location']) {
  140 |     test(`DASH widget "${w}"`, async ({ page }) => {
  141 |       await open(page, 'dashboard/index');
  142 |       await expect(page.getByText(w, { exact: true })).toBeVisible();
  143 |     });
  144 |   }
  145 |   for (const q of ['Assign Leave', 'Leave List', 'Timesheets', 'Apply Leave', 'My Leave', 'My Timesheet']) {
  146 |     test(`DASH Quick Launch "${q}"`, async ({ page }) => {
  147 |       await open(page, 'dashboard/index');
  148 |       await page.getByRole('button', { name: q }).click();
  149 |       await expect(page).not.toHaveURL(/dashboard\/index/);
  150 |     });
  151 |   }
  152 | });
  153 | 
  154 | /* =================================================================== */
  155 | /* D. Menú de usuario y cambio de contraseña                           */
  156 | /* =================================================================== */
  157 | test.describe('Usuario', () => {
  158 |   for (const item of ['About', 'Support', 'Change Password', 'Logout']) {
  159 |     test(`USER menú "${item}"`, async ({ page }) => {
  160 |       await open(page, 'dashboard/index');
  161 |       await page.locator('.oxd-userdropdown').click();
  162 |       await expect(page.getByRole('menuitem', { name: item })).toBeVisible();
  163 |     });
  164 |   }
  165 |   test('USER About muestra datos de la compañía', async ({ page }) => {
  166 |     await open(page, 'dashboard/index');
  167 |     await page.locator('.oxd-userdropdown').click();
  168 |     await page.getByRole('menuitem', { name: 'About' }).click();
  169 |     await expect(page.getByRole('dialog')).toContainText('Company Name');
  170 |   });
  171 |   test('USER Support navega a ayuda', async ({ page }) => {
  172 |     await open(page, 'dashboard/index');
  173 |     await page.locator('.oxd-userdropdown').click();
  174 |     await page.getByRole('menuitem', { name: 'Support' }).click();
  175 |     await expect(page).toHaveURL(/help|support/i);
  176 |   });
  177 |   // Validaciones del formulario (nunca se guarda: usamos contraseña actual incorrecta)
  178 |   const pwdCases = [
  179 |     ['todo vacío', '', '', '', 'Required'],
  180 |     ['nueva muy corta', 'wrong', 'Ab1', 'Ab1', /at least 7|Should have/],
  181 |     ['sin número', 'wrong', 'Abcdefgh', 'Abcdefgh', /at least one number|number/],
  182 |     ['confirmación distinta', 'wrong', 'Abcdef12', 'Abcdef13', /do not match|match/],
  183 |   ];
  184 |   for (const [name, cur, n1, n2, msg] of pwdCases) {
  185 |     test(`PWD ${name}`, async ({ page }) => {
  186 |       await open(page, 'pim/updatePassword');
  187 |       const inputs = page.locator('input[type="password"]');
  188 |       await inputs.nth(0).fill(cur);
  189 |       await inputs.nth(1).fill(n1);
  190 |       await inputs.nth(2).fill(n2);
  191 |       await page.locator('button[type="submit"]').click();
  192 |       await expect(err(page).first()).toContainText(msg);
  193 |     });
  194 |   }
  195 | });
  196 | 
  197 | /* =================================================================== */
  198 | /* E. Formularios de alta: "Required" al guardar vacío                 */
```