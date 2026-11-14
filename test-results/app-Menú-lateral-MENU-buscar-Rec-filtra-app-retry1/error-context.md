# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\app.spec.js >> Menú lateral >> MENU buscar "Rec" filtra
- Location: tests\app.spec.js:102:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.waitFor: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('.oxd-topbar-header-breadcrumb') to be visible

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e6]:
    - img "company-branding" [ref=e8]
    - generic [ref=e9]:
      - heading "Login" [level=5] [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e13]:
          - paragraph [ref=e14]: "Username : Admin"
          - paragraph [ref=e15]: "Password : admin123"
        - generic [ref=e16]:
          - generic [ref=e18]:
            - generic [ref=e19]:
              - generic [ref=e20]: 
              - generic [ref=e21]: Username
            - textbox "Username" [active] [ref=e23]
          - generic [ref=e25]:
            - generic [ref=e26]:
              - generic [ref=e27]: 
              - generic [ref=e28]: Password
            - textbox "Password" [ref=e30]
          - button "Login" [ref=e32] [cursor=pointer]
          - paragraph [ref=e34] [cursor=pointer]: Forgot your password?
      - generic [ref=e35]:
        - generic [ref=e36]:
          - link [ref=e37] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/orangehrm/mycompany/
          - link [ref=e40] [cursor=pointer]:
            - /url: https://www.facebook.com/OrangeHRM/
          - link [ref=e43] [cursor=pointer]:
            - /url: https://twitter.com/orangehrm?lang=en
          - link [ref=e46] [cursor=pointer]:
            - /url: https://www.youtube.com/c/OrangeHRMInc
        - generic [ref=e49]:
          - paragraph [ref=e50]: OrangeHRM OS 5.9
          - paragraph [ref=e51]:
            - text: © 2005 - 2026
            - link "OrangeHRM, Inc" [ref=e52] [cursor=pointer]:
              - /url: http://www.orangehrm.com
            - text: . All rights reserved.
  - img "orangehrm-logo" [ref=e54]
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
> 14  |   await title(page).waitFor();
      |                     ^ Error: locator.waitFor: Test timeout of 60000ms exceeded.
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
  98  |       await expect(page.locator('.oxd-layout-context')).toBeVisible();
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
```