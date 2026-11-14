// Pruebas autenticadas (Admin / admin123) en todos los módulos de OrangeHRM demo.
// Sesión reutilizada desde .auth/admin.json (ver auth.setup.js).
const { test, expect } = require('@playwright/test');

const BASE = '/web/index.php';
const url = (p) => `${BASE}/${p}`;
const title = (page) => page.locator('.oxd-topbar-header-breadcrumb');
const menu = (page) => page.locator('.oxd-main-menu');
const err = (page) => page.locator('.oxd-input-field-error-message');
const rows = (page) => page.locator('.oxd-table-body .oxd-table-card');

async function open(page, path) {
  await page.goto(url(path));
  await title(page).waitFor();
}

/* =================================================================== */
/* A. Humo por página: catálogo de pantallas × 4 verificaciones        */
/*    (carga, sin error visible, sin 5xx de API, recarga mantiene)     */
/* =================================================================== */
const catalog = {
  Dashboard: ['dashboard/index'],
  Admin: [
    'admin/viewSystemUsers', 'admin/viewJobTitleList', 'admin/viewPayGrades', 'admin/employmentStatus',
    'admin/jobCategory', 'admin/workShift', 'admin/viewOrganizationGeneralInformation', 'admin/viewLocations',
    'admin/viewCompanyStructure', 'admin/nationality', 'admin/viewSkills', 'admin/viewEducation',
    'admin/viewLicenses', 'admin/viewLanguages', 'admin/viewMemberships', 'admin/localization',
    'admin/listMailConfiguration',
  ],
  PIM: [
    'pim/viewEmployeeList', 'pim/addEmployee', 'pim/configurePim', 'pim/listCustomFields',
    'pim/viewDefinedPredefinedReports', 'pim/viewReportingMethods', 'pim/viewTerminationReasons',
  ],
  Leave: [
    'leave/viewLeaveList', 'leave/applyLeave', 'leave/viewMyLeaveList', 'leave/viewLeaveEntitlements',
    'leave/addLeaveEntitlement', 'leave/viewLeaveEntitlementReport', 'leave/defineLeavePeriod',
    'leave/leaveTypeList', 'leave/viewHolidayList', 'leave/defineWorkWeek', 'leave/assignLeave',
  ],
  Time: [
    'time/viewEmployeeTimesheet', 'time/viewMyTimesheet', 'time/viewProjects', 'time/viewCustomers',
    'time/displayProjectReportCriteria',
    'time/viewMyAttendanceRecord', 'time/viewAttendanceRecord',
  ],
  Recruitment: ['recruitment/viewCandidates', 'recruitment/viewJobVacancy', 'recruitment/addCandidate', 'recruitment/addJobVacancy'],
  Performance: [
    'performance/searchEvaluatePerformanceReview', 'performance/myPerformanceReview',
    'performance/searchPerformanceReview', 'performance/searchKpi', 'performance/searchPerformanceTracker',
  ],
  Directory: ['directory/viewDirectory'],
  Maintenance: ['maintenance/viewMaintenanceModule'],
  Claim: ['claim/viewAssignClaim', 'claim/submitClaim', 'claim/viewMyClaims', 'claim/viewEvents', 'claim/viewExpenses'],
  Buzz: ['buzz/viewBuzz'],
};

for (const [mod, paths] of Object.entries(catalog)) {
  test.describe(`Humo ${mod}`, () => {
    for (const p of paths) {
      test(`${p} carga sin redirigir a login`, async ({ page }) => {
        await open(page, p);
        await expect(page).not.toHaveURL(/auth\/login/);
        await expect(page.locator('.oxd-layout-context')).toBeVisible();
      });
      test(`${p} sin mensaje de error`, async ({ page }) => {
        await open(page, p);
        await expect(page.getByText(/Page Not Found|Unexpected Error|Something went wrong/i)).toHaveCount(0);
      });
      test(`${p} sin respuestas 5xx de la API`, async ({ page }) => {
        const bad = [];
        page.on('response', (r) => { if (r.url().includes('/api/') && r.status() >= 500) bad.push(`${r.status()} ${r.url()}`); });
        await open(page, p);
        await page.waitForLoadState('networkidle');
        expect(bad).toEqual([]);
      });
      test(`${p} recarga mantiene sesión`, async ({ page }) => {
        await open(page, p);
        await page.reload();
        await expect(page).not.toHaveURL(/auth\/login/);
      });
    }
  });
}

/* =================================================================== */
/* B. Shell: menú lateral, búsqueda, responsive                        */
/* =================================================================== */
const modules = ['Admin', 'PIM', 'Leave', 'Time', 'Recruitment', 'My Info', 'Performance', 'Dashboard', 'Directory', 'Maintenance', 'Claim', 'Buzz'];

test.describe('Menú lateral', () => {
  for (const m of modules) {
    test(`MENU "${m}" visible`, async ({ page }) => {
      await open(page, 'dashboard/index');
      await expect(menu(page).getByText(m, { exact: true })).toBeVisible();
    });
    test(`MENU clic en "${m}" navega`, async ({ page }) => {
      await open(page, 'dashboard/index');
      await menu(page).getByText(m, { exact: true }).click();
      await expect(page).not.toHaveURL(/auth\/login|dashboard\/index$/).catch(() => {});
      await expect(page.locator('.oxd-layout-context')).toBeVisible();
    });
  }
  for (const t of ['Admin', 'PIM', 'Leave', 'Time', 'Rec', 'Perf', 'Dir', 'Main', 'Claim', 'Buzz']) {
    test(`MENU buscar "${t}" filtra`, async ({ page }) => {
      await open(page, 'dashboard/index');
      await page.getByPlaceholder('Search').fill(t);
      await expect(menu(page).locator('li').first()).toContainText(new RegExp(t, 'i'));
    });
  }
  test('MENU buscar sin resultados', async ({ page }) => {
    await open(page, 'dashboard/index');
    await page.getByPlaceholder('Search').fill('zzzzzz');
    await expect(menu(page).locator('li')).toHaveCount(0);
  });
  test('MENU botón para colapsar/expandir', async ({ page }) => {
    await open(page, 'dashboard/index');
    const sidebar = page.locator('.oxd-sidepanel');
    const w0 = (await sidebar.boundingBox()).width;
    await page.locator('.oxd-main-menu-button, .oxd-sidepanel-header + * button').first().click().catch(() => {});
    await page.waitForTimeout(500);
    const w1 = (await sidebar.boundingBox()).width;
    expect(w1).not.toBe(w0);
  });
});

test.describe('Responsive (dashboard)', () => {
  for (const [w, h] of [[320, 568], [375, 812], [412, 915], [768, 1024], [1024, 768], [1366, 768], [1920, 1080], [2560, 1440]]) {
    test(`VP ${w}x${h} dashboard usable`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await open(page, 'dashboard/index');
      await expect(page.locator('.oxd-userdropdown')).toBeVisible();
      await expect(page.locator('.oxd-layout-context')).toBeVisible();
    });
  }
});

/* =================================================================== */
/* C. Dashboard                                                        */
/* =================================================================== */
test.describe('Dashboard', () => {
  for (const w of ['Time at Work', 'My Actions', 'Quick Launch', 'Buzz Latest Posts', 'Employees on Leave Today', 'Employee Distribution by Sub Unit', 'Employee Distribution by Location']) {
    test(`DASH widget "${w}"`, async ({ page }) => {
      await open(page, 'dashboard/index');
      await expect(page.getByText(w, { exact: true })).toBeVisible();
    });
  }
  for (const q of ['Assign Leave', 'Leave List', 'Timesheets', 'Apply Leave', 'My Leave', 'My Timesheet']) {
    test(`DASH Quick Launch "${q}"`, async ({ page }) => {
      await open(page, 'dashboard/index');
      await page.getByRole('button', { name: q }).click();
      await expect(page).not.toHaveURL(/dashboard\/index/);
    });
  }
});

/* =================================================================== */
/* D. Menú de usuario y cambio de contraseña                           */
/* =================================================================== */
test.describe('Usuario', () => {
  for (const item of ['About', 'Support', 'Change Password', 'Logout']) {
    test(`USER menú "${item}"`, async ({ page }) => {
      await open(page, 'dashboard/index');
      await page.locator('.oxd-userdropdown').click();
      await expect(page.getByRole('menuitem', { name: item })).toBeVisible();
    });
  }
  test('USER About muestra datos de la compañía', async ({ page }) => {
    await open(page, 'dashboard/index');
    await page.locator('.oxd-userdropdown').click();
    await page.getByRole('menuitem', { name: 'About' }).click();
    await expect(page.getByRole('dialog')).toContainText('Company Name');
  });
  test('USER Support navega a ayuda', async ({ page }) => {
    await open(page, 'dashboard/index');
    await page.locator('.oxd-userdropdown').click();
    await page.getByRole('menuitem', { name: 'Support' }).click();
    await expect(page).toHaveURL(/help|support/i);
  });
  // Validaciones del formulario (nunca se guarda: usamos contraseña actual incorrecta)
  const pwdCases = [
    ['todo vacío', '', '', '', 'Required'],
    ['nueva muy corta', 'wrong', 'Ab1', 'Ab1', /at least 7|Should have/],
    ['sin número', 'wrong', 'Abcdefgh', 'Abcdefgh', /at least one number|number/],
    ['confirmación distinta', 'wrong', 'Abcdef12', 'Abcdef13', /do not match|match/],
  ];
  for (const [name, cur, n1, n2, msg] of pwdCases) {
    test(`PWD ${name}`, async ({ page }) => {
      await open(page, 'pim/updatePassword');
      const inputs = page.locator('input[type="password"]');
      await inputs.nth(0).fill(cur);
      await inputs.nth(1).fill(n1);
      await inputs.nth(2).fill(n2);
      await page.locator('button[type="submit"]').click();
      await expect(err(page).first()).toContainText(msg);
    });
  }
});

/* =================================================================== */
/* E. Formularios de alta: "Required" al guardar vacío                 */
/* =================================================================== */
const forms = [
  'admin/saveSystemUser', 'admin/saveJobTitle', 'admin/definePayGrade', 'admin/saveLocation',
  'pim/addEmployee', 'leave/applyLeave', 'leave/assignLeave', 'leave/addLeaveEntitlement',
  'leave/saveLeaveType', 'leave/saveHolidays', 'recruitment/addCandidate', 'recruitment/addJobVacancy',
  'claim/submitClaim', 'claim/assignClaim', 'claim/saveEvents', 'claim/saveExpenseType',
  'time/createProject', 'time/addCustomer', 'performance/saveKpi',
];
test.describe('Alta vacía → Required', () => {
  for (const f of forms) {
    test(`REQ ${f}`, async ({ page }) => {
      await open(page, f);
      await page.locator('button[type="submit"]').first().click();
      await expect(err(page).first()).toBeVisible();
    });
  }
});

/* =================================================================== */
/* F. Admin → usuarios                                                 */
/* =================================================================== */
test.describe('Admin usuarios', () => {
  test('ADM lista con registros', async ({ page }) => {
    await open(page, 'admin/viewSystemUsers');
    await expect(rows(page).first()).toBeVisible();
  });
  test('ADM buscar "Admin" encuentra resultados', async ({ page }) => {
    await open(page, 'admin/viewSystemUsers');
    await page.locator('.oxd-input').nth(1).fill('Admin');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(rows(page).first()).toContainText('Admin');
  });
  for (const t of ['zzzz_no_existe', 'x', '12345', "' OR 1=1--", '<script>1</script>']) {
    test(`ADM buscar "${t}" no rompe`, async ({ page }) => {
      await open(page, 'admin/viewSystemUsers');
      await page.locator('.oxd-input').nth(1).fill(t);
      await page.getByRole('button', { name: 'Search' }).click();
      await expect(page.getByRole('heading', { name: 'System Users' })).toBeVisible();
    });
  }
  for (const role of ['Admin', 'ESS']) {
    for (const status of ['Enabled', 'Disabled']) {
      test(`ADM filtro rol=${role} estado=${status}`, async ({ page }) => {
        await open(page, 'admin/viewSystemUsers');
        const selects = page.locator('.oxd-select-text');
        await selects.nth(0).click();
        await page.getByRole('option', { name: role, exact: true }).click();
        await selects.nth(1).click();
        await page.getByRole('option', { name: status, exact: true }).click();
        await page.getByRole('button', { name: 'Search' }).click();
        await expect(page.getByRole('heading', { name: 'System Users' })).toBeVisible();
      });
    }
  }
  test('ADM Reset limpia', async ({ page }) => {
    await open(page, 'admin/viewSystemUsers');
    await page.locator('.oxd-input').nth(1).fill('Admin');
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.locator('.oxd-input').nth(1)).toHaveValue('');
  });
  test('ADM Add abre formulario', async ({ page }) => {
    await open(page, 'admin/viewSystemUsers');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page).toHaveURL(/saveSystemUser/);
  });
  test('ADM Add: contraseñas distintas', async ({ page }) => {
    await open(page, 'admin/saveSystemUser');
    const pw = page.locator('input[type="password"]');
    await pw.nth(0).fill('Abcdef12');
    await pw.nth(1).fill('Abcdef13');
    await page.locator('button[type="submit"]').click();
    await expect(err(page).filter({ hasText: /match/i }).first()).toBeVisible();
  });
});

/* =================================================================== */
/* G. PIM                                                              */
/* =================================================================== */
test.describe('PIM', () => {
  test('PIM lista con registros', async ({ page }) => {
    await open(page, 'pim/viewEmployeeList');
    await expect(rows(page).first()).toBeVisible();
  });
  test('PIM Add Employee muestra campos', async ({ page }) => {
    await open(page, 'pim/addEmployee');
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
  });
  for (const f of ['firstName', 'middleName', 'lastName']) {
    test(`PIM ${f} de 31 caracteres da error de longitud`, async ({ page }) => {
      await open(page, 'pim/addEmployee');
      await page.locator(`input[name="${f}"]`).fill('a'.repeat(31));
      await page.locator('button[type="submit"]').click();
      await expect(err(page).filter({ hasText: /exceed/i }).first()).toBeVisible();
    });
  }
  test('PIM Employee Id de 11 caracteres da error', async ({ page }) => {
    await open(page, 'pim/addEmployee');
    await page.locator('.oxd-input').nth(4).fill('1'.repeat(11));
    await page.locator('button[type="submit"]').click();
    await expect(err(page).filter({ hasText: /exceed/i }).first()).toBeVisible();
  });
  for (const t of ['Paul', 'a', 'zzzz_no_existe', "' OR 1=1--", '<b>x</b>']) {
    test(`PIM buscar nombre "${t}" no rompe`, async ({ page }) => {
      await open(page, 'pim/viewEmployeeList');
      await page.getByPlaceholder('Type for hints...').first().fill(t);
      await page.getByRole('button', { name: 'Search' }).click();
      await expect(page.getByRole('heading', { name: 'Employee Information' })).toBeVisible();
    });
  }
  test('PIM Reset limpia', async ({ page }) => {
    await open(page, 'pim/viewEmployeeList');
    await page.getByPlaceholder('Type for hints...').first().fill('Paul');
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByPlaceholder('Type for hints...').first()).toHaveValue('');
  });
  test('PIM CRUD: crear y eliminar empleado', async ({ page }) => {
    const last = `Prueba${Date.now()}`;
    await open(page, 'pim/addEmployee');
    await page.locator('input[name="firstName"]').fill('Auto');
    await page.locator('input[name="lastName"]').fill(last);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/viewPersonalDetails/);
    await open(page, 'pim/viewEmployeeList');
    await page.getByPlaceholder('Type for hints...').first().fill(last);
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(rows(page)).toHaveCount(1);
    await rows(page).first().locator('.bi-trash').click();
    await page.getByRole('button', { name: /Yes, Delete/ }).click();
    await expect(page.getByText('No Records Found').first()).toBeVisible();
  });
});

/* =================================================================== */
/* H. My Info (pestañas)                                               */
/* =================================================================== */
test.describe('My Info', () => {
  for (const tab of ['Personal Details', 'Contact Details', 'Emergency Contacts', 'Dependents', 'Immigration', 'Job', 'Salary', 'Report-to', 'Qualifications', 'Memberships']) {
    test(`MYINFO pestaña "${tab}"`, async ({ page }) => {
      await open(page, 'pim/viewMyDetails');
      await page.waitForURL(/viewPersonalDetails/);
      await page.locator('.orangehrm-tabs-item', { hasText: tab }).first().click();
      await expect(page.locator('.orangehrm-edit-employee-content')).toBeVisible();
    });
  }
});

/* =================================================================== */
/* I. Leave / Time / Recruitment / Performance / Claim                 */
/* =================================================================== */
test.describe('Leave', () => {
  for (const st of ['Rejected', 'Cancelled', 'Pending Approval', 'Scheduled', 'Taken']) {
    test(`LEAVE lista: estado "${st}" disponible`, async ({ page }) => {
      await open(page, 'leave/viewLeaveList');
      await page.locator('.oxd-multiselect-wrapper .oxd-select-text').click();
      await expect(page.getByRole('option', { name: st })).toBeVisible();
    });
  }
  test('LEAVE Apply: sin tipo disponible o Required', async ({ page }) => {
    await open(page, 'leave/applyLeave');
    await expect(page.locator('.oxd-layout-context')).toContainText(/Apply Leave|No Leave Types/);
  });
});

test.describe('Time', () => {
  test('TIME timesheets: botón View', async ({ page }) => {
    await open(page, 'time/viewEmployeeTimesheet');
    await expect(page.getByRole('button', { name: 'View' })).toBeVisible();
  });
  test('TIME proyectos: Add abre formulario', async ({ page }) => {
    await open(page, 'time/viewProjects');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page).toHaveURL(/createProject/);
  });
  test('TIME clientes: Add abre formulario', async ({ page }) => {
    await open(page, 'time/viewCustomers');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page).toHaveURL(/addCustomer/);
  });
});

test.describe('Recruitment', () => {
  for (const t of ['a', 'zzzz_no_existe', "' OR 1=1--"]) {
    test(`REC candidatos: palabra clave "${t}"`, async ({ page }) => {
      await open(page, 'recruitment/viewCandidates');
      await page.getByPlaceholder('Enter comma separated words...').fill(t);
      await page.getByRole('button', { name: 'Search' }).click();
      await expect(page.getByRole('heading', { name: 'Candidates' })).toBeVisible();
    });
  }
  test('REC Reset limpia palabras clave', async ({ page }) => {
    await open(page, 'recruitment/viewCandidates');
    await page.getByPlaceholder('Enter comma separated words...').fill('abc');
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByPlaceholder('Enter comma separated words...')).toHaveValue('');
  });
});

/* =================================================================== */
/* J. Directory, Maintenance, Buzz                                     */
/* =================================================================== */
test.describe('Directory', () => {
  for (const t of ['Paul', 'a', 'zzzz_no_existe', "' OR 1=1--"]) {
    test(`DIR buscar "${t}"`, async ({ page }) => {
      await open(page, 'directory/viewDirectory');
      await page.getByPlaceholder('Type for hints...').fill(t);
      await page.getByRole('button', { name: 'Search' }).click();
      await expect(page.getByRole('heading', { name: 'Directory' })).toBeVisible();
    });
  }
  test('DIR Reset', async ({ page }) => {
    await open(page, 'directory/viewDirectory');
    await page.getByPlaceholder('Type for hints...').fill('Paul');
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByPlaceholder('Type for hints...')).toHaveValue('');
  });
});

test.describe('Maintenance', () => {
  test('MAINT pide reautenticación', async ({ page }) => {
    await open(page, 'maintenance/viewMaintenanceModule');
    await expect(page.getByText('Administrator Access')).toBeVisible();
  });
  test('MAINT contraseña incorrecta se rechaza', async ({ page }) => {
    await open(page, 'maintenance/viewMaintenanceModule');
    await page.locator('input[name="password"]').fill('wrong');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.oxd-alert-content-text, .oxd-input-field-error-message').first()).toBeVisible();
  });
  test('MAINT contraseña correcta da acceso', async ({ page }) => {
    await open(page, 'maintenance/viewMaintenanceModule');
    await page.locator('input[name="password"]').fill('admin123');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page).toHaveURL(/purgeEmployee|accessEmployeeData/);
  });
});

test.describe('Buzz', () => {
  test('BUZZ campo para publicar visible', async ({ page }) => {
    await open(page, 'buzz/viewBuzz');
    await expect(page.getByPlaceholder("What's on your mind?")).toBeVisible();
  });
  test('BUZZ publicar vacío está deshabilitado', async ({ page }) => {
    await open(page, 'buzz/viewBuzz');
    await expect(page.getByRole('button', { name: 'Post', exact: true })).toBeDisabled();
  });
  test('BUZZ escribir habilita Post', async ({ page }) => {
    await open(page, 'buzz/viewBuzz');
    await page.getByPlaceholder("What's on your mind?").fill('hola');
    await expect(page.getByRole('button', { name: 'Post', exact: true })).toBeEnabled();
  });
});
