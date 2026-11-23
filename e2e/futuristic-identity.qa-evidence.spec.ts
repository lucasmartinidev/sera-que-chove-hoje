import { expect, test } from '@playwright/test'
import { resolve } from 'node:path'
import { mockApi, mockDashboard, searchCity } from './weather-dashboard.helpers.js'

const EVIDENCE_DIRECTORY = resolve(process.cwd(), '../tasks/prd-identidade-futurista-reativa/evidences')

test('captura estados inicial e sucesso em desktop e celular', async ({ page }) => {
  await mockDashboard(page)
  await page.goto('/')
  await page.screenshot({ path: resolve(EVIDENCE_DIRECTORY, '01-estado-inicial-desktop.png'), fullPage: true })
  await searchCity(page, 'Lisboa')
  await expect(page.getByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
  await page.screenshot({ path: resolve(EVIDENCE_DIRECTORY, '02-sucesso-desktop.png'), fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: resolve(EVIDENCE_DIRECTORY, '03-sucesso-mobile.png'), fullPage: true })
})

test('captura erro, movimento reduzido e cores forçadas', async ({ page }) => {
  await mockApi(page, '/api/geocode', 'geocode-single.json')
  await mockApi(page, '/api/weather', 'weather-error.json', 502)
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  await expect(page.getByRole('alert')).toBeVisible()
  await page.screenshot({ path: resolve(EVIDENCE_DIRECTORY, '04-erro.png'), fullPage: true })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await searchCity(page, 'Lisboa')
  await page.screenshot({ path: resolve(EVIDENCE_DIRECTORY, '05-movimento-reduzido.png'), fullPage: true })
  await page.emulateMedia({ forcedColors: 'active' })
  await page.screenshot({ path: resolve(EVIDENCE_DIRECTORY, '06-cores-forcadas.png'), fullPage: true })
})

test('verifica contraste dos controles da primeira dobra sobre a atmosfera', async ({ page }) => {
  await mockDashboard(page)
  await page.goto('/')
  const colors = await page.evaluate(() => {
    const label = document.querySelector('label[for="city-search"]')
    const input = document.querySelector('#city-search')?.parentElement
    const location = document.querySelector('button[aria-label="Minha localização"]')
    return {
      label: label === null ? '' : getComputedStyle(label).color,
      input: input === undefined || input === null ? '' : getComputedStyle(input).backgroundColor,
      location: location === null ? '' : getComputedStyle(location).backgroundColor,
    }
  })
  expect(colors.label).not.toBe('rgb(89, 101, 119)')
  expect(colors.input).not.toBe('rgba(0, 0, 0, 0)')
  expect(colors.location).not.toBe('rgba(0, 0, 0, 0)')
  await page.screenshot({ path: resolve(EVIDENCE_DIRECTORY, '07-controles-contraste.png'), fullPage: true })
})

test('valida zoom responsivo, tons de cinza e tempo de consulta', async ({ page }) => {
  await mockDashboard(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const startedAt = Date.now()
  await searchCity(page, 'Lisboa')
  await expect(page.locator('section[aria-labelledby="current-weather-title"]')).toBeVisible()
  expect(Date.now() - startedAt).toBeLessThan(3000)
  await page.screenshot({ path: resolve(EVIDENCE_DIRECTORY, '08-responsivo-zoom-proxy.png'), fullPage: true })
  await page.addStyleTag({ content: 'html { filter: grayscale(1); }' })
  await page.screenshot({ path: resolve(EVIDENCE_DIRECTORY, '09-tons-de-cinza.png'), fullPage: true })
})
