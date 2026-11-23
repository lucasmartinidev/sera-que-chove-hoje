import { expect, test } from '@playwright/test'
import { FRONTEND_ORIGIN, mockApi, mockDashboard, searchCity } from './weather-dashboard.helpers.js'

test('E2E-06 (CA-03) carrega o clima e identifica a consulta como Minha localização', async ({ page, context }) => {
  await context.grantPermissions(['geolocation'], { origin: FRONTEND_ORIGIN })
  await context.setGeolocation({ latitude: -20.3, longitude: -40.3 })
  await mockApi(page, '/api/weather', 'weather-ok.json')
  const weatherRequest = page.waitForRequest('**/api/weather**')
  await page.goto('/')
  await page.getByRole('button', { name: 'Minha localização' }).click()
  const request = await weatherRequest
  expect(new URL(request.url()).searchParams.get('lat')).toBe('-20.3')
  expect(new URL(request.url()).searchParams.get('lon')).toBe('-40.3')
  await expect(page.getByRole('heading', { name: 'Minha localização' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Atualizar localização' })).toBeVisible()
})

test('E2E-07 mantém a busca manual após negar geolocalização', async ({ page, context }) => {
  await context.grantPermissions([], { origin: FRONTEND_ORIGIN })
  await mockDashboard(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Minha localização' }).click()
  await expect(page.getByText(/Permissão de localização negada/)).toBeVisible()
  await searchCity(page, 'Lisboa')
  await expect(page.getByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
})
