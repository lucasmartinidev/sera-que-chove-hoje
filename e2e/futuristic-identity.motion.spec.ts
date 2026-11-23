import { expect, test } from '@playwright/test'
import { mockDashboard, searchCity } from './weather-dashboard.helpers.js'

test('E2E-12 respeita movimento reduzido com composição estática', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await mockDashboard(page)
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  await expect(page.locator('main')).toHaveAttribute('data-motion', 'reduced')
  await expect(page.locator('section[aria-labelledby="current-weather-title"]').getByText('Ameno')).toBeVisible()
  const animatedStyles = await page.locator('[data-atmosphere] [style*="animation"]').evaluateAll((elements) => elements.map((element) => getComputedStyle(element).animationName))
  expect(animatedStyles.every((animationName) => animationName === 'none')).toBe(true)
})

test('E2E-17 mantém conteúdo visível com cores forçadas', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await mockDashboard(page)
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  await expect(page.getByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
  await expect(page.getByTestId('atmospheric-background')).toBeHidden()
  await expect(page.getByRole('button', { name: '°F' })).toBeEnabled()
})
