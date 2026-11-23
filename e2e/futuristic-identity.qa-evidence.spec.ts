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
