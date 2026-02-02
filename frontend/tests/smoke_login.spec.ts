import { test, expect } from '@playwright/test';

test('Super Admin Login Smoke Test', async ({ page }) => {
  // 1. Go to Login Page
  try {
    await page.goto('http://localhost:3000/login');
    console.log('Navigated to login page');

    // Debug: Print page content if selector fails
    // await page.waitForSelector('input[type="text"]', { timeout: 5000 });

    // 2. Fill Credentials
    // Naive UI inputs are complex. They might be inside .n-input__input-el
    await page.getByPlaceholder('ej. usuario@empresa.com').fill('super@rickerp.com');
    console.log('Filled email');

    await page.getByPlaceholder('••••••••').fill('admin123');
    console.log('Filled password');

    // 3. Click Login
    await page.getByRole('button', { name: 'Ingresar al Sistema' }).click();
    console.log('Clicked login');

    // 4. Wait for Navigation (expect to be redirected to /admin/companies)
    await page.waitForURL('**/admin/companies', { timeout: 10000 });
    console.log('Redirected to admin');

    // 5. Verify Admin UI Element
    await expect(page.getByText('Gestión de Empresas')).toBeVisible();
    console.log('Verified Admin UI');

    // 6. Screenshot
    await page.screenshot({ path: 'smoke-login-success.png', fullPage: true });
  } catch (e) {
    console.error('Test failed', e);
    await page.screenshot({ path: 'smoke-login-failed.png', fullPage: true });
    // console.log(await page.content());
    throw e;
  }
});
