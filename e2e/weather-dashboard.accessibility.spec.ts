import { expect, test } from '@playwright/test'
import { resolve } from 'node:path'
import { mockApi, mockDashboard, searchCity } from './weather-dashboard.helpers.js'

function relativeLuminance(color: string): number {
  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? []
  const values = channels.map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2
  })
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722
}

function contrastRatio(foreground: string, background: string): number {
  const [darker, lighter] = [relativeLuminance(foreground), relativeLuminance(background)].sort((first, second) => first - second)
  return (lighter + 0.05) / (darker + 0.05)
}

test('E2E-09 (regression) CA-11 allows keyboard users to scroll the mobile forecast', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockDashboard(page)
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  const forecastRegion = page.getByRole('region', { name: 'Previsão das próximas seis horas' })
  await expect(forecastRegion.getByText('13:00')).toBeVisible()
  const dimensions = await forecastRegion.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }))
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth)
  await page.getByRole('button', { name: 'mph' }).focus()
  await page.keyboard.press('Tab')
  await expect(forecastRegion).toBeFocused()
  await page.keyboard.press('ArrowRight')
  expect(await forecastRegion.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
  for (let index = 0; index < 12; index += 1) await page.keyboard.press('ArrowRight')
  await expect(forecastRegion.getByText('18:00')).toBeInViewport()
  await page.screenshot({ path: resolve(process.cwd(), '../tasks/prd-painel-de-clima/evidences/11-previsao-mobile-teclado.png'), fullPage: true })
})

test('E2E-10 (regression) CA-11 keeps service error text at WCAG AA contrast', async ({ page }) => {
  await mockApi(page, '/api/geocode', 'geocode-single.json')
  await mockApi(page, '/api/weather', 'weather-error.json', 502)
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  const colors = await page.getByRole('alert').locator('p').evaluate((element) => ({
    foreground: getComputedStyle(element).color,
    background: getComputedStyle(document.querySelector('main') as HTMLElement).backgroundColor,
  }))
  expect(contrastRatio(colors.foreground, colors.background), `${colors.foreground} on ${colors.background}`).toBeGreaterThanOrEqual(4.5)
  await page.screenshot({ path: resolve(process.cwd(), '../tasks/prd-painel-de-clima/evidences/12-erro-contraste-final.png'), fullPage: true })
})
