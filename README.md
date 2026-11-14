# Pruebas Playwright - OrangeHRM demo (500 tests + 1 setup)
npm install && npx playwright install chromium
npx playwright test                    # todo
npx playwright test --project=login    # 113 pruebas de login
npx playwright test --project=app      # 387 pruebas autenticadas (Admin/admin123)
npx playwright show-report
