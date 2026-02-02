import { test, expect } from '@playwright/test';

test('Smoke Test: User Login', async ({ page }) => {
  // 1. Ir a la página de login
  await page.goto('http://localhost:3000/login');

  // 2. Verificar que se cargó el formulario
  await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();

  // 3. Llenar credenciales
  await page.getByPlaceholder('ej. usuario@empresa.com').fill('super@rickerp.com');
  await page.getByPlaceholder('••••••••').fill('admin123');

  // 4. Click en ingresar
  await page.getByRole('button', { name: 'Ingresar al Sistema' }).click();

  // 5. Esperar navegación al dashboard o admin
  // Super Admin redirige a /admin/companies
  await page.waitForURL('**/admin/companies');

  // 6. Verificar elemento clave del dashboard
  await expect(page.getByText('Gestión de Empresas')).toBeVisible();
});
