import { expect, test } from '@playwright/test'
import { mockApi, mockDashboard, readFixture, searchCity } from './weather-dashboard.helpers.js'

const DESKTOP_VIEWPORT = { width: 1440, height: 900 }
const MOBILE_VIEWPORT = { width: 390, height: 844 }
const MAX_TRANSITION_MS = 600

test('E2E-09 exibe cidade, condição, temperatura e chuva na primeira dobra', async ({ page }) => {
  await mockDashboard(page)
  for (const viewport of [DESKTOP_VIEWPORT, MOBILE_VIEWPORT]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await searchCity(page, 'Lisboa')
    const current = page.locator('section[aria-labelledby="current-weather-title"]')
    for (const locator of [page.getByRole('heading', { name: 'Lisboa, Portugal' }), current.getByText('Chuva fraca'), current.getByText('20°C'), current.getByText('Ameno'), current.getByText('Chance de chuva')]) {
      await expect(locator).toBeVisible()
      const box = await locator.boundingBox()
      expect(box?.y).toBeLessThan(viewport.height)
    }
  }
})

test('E2E-10 representa trovoada noturna e céu limpo diurno', async ({ page }) => {
  await mockApi(page, '/api/geocode', 'geocode-single.json')
  await mockApi(page, '/api/weather', 'weather-thunder-night.json')
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  await expect(page.locator('main')).toHaveAttribute('data-atmosphere', 'thunderstorm')
  await expect(page.locator('main')).toHaveAttribute('data-period', 'night')
  await expect(page.getByTestId('thunder-layer')).toBeVisible()
  await page.reload()
  await page.unroute('**/api/weather**')
  await mockApi(page, '/api/weather', 'weather-clear-day.json')
  await searchCity(page, 'Lisboa')
  await expect(page.locator('main')).toHaveAttribute('data-atmosphere', 'clear')
  await expect(page.locator('main')).toHaveAttribute('data-period', 'day')
})

test('E2E-11 mantém a mesma faixa para cidades com a mesma temperatura', async ({ page }) => {
  await page.route('**/api/geocode**', async (route) => {
    const city = new URL(route.request().url()).searchParams.get('city')
    const fixture = await readFixture('geocode-single.json')
    const body = city === 'Porto' ? fixture.replaceAll('Lisboa', 'Porto') : fixture
    await route.fulfill({ status: 200, contentType: 'application/json', body })
  })
  await mockApi(page, '/api/weather', 'weather-clear-day.json')
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  await expect(page.getByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
  const firstBand = await page.locator('main').getAttribute('data-band')
  if (firstBand === null) throw new Error('A primeira faixa não foi renderizada')
  await searchCity(page, 'Porto')
  await expect(page.locator('main')).toHaveAttribute('data-band', await firstBand)
  await expect(page.getByText('Ameno').first()).toBeVisible()
})

test('E2E-13 faz apenas requisições HTTP locais durante a consulta', async ({ page }) => {
  const remoteRequests: string[] = []
  page.on('request', (request) => {
    if (/^https?:/.test(request.url()) && !request.url().includes('127.0.0.1')) remoteRequests.push(request.url())
  })
  await mockDashboard(page)
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  await expect(page.getByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
  expect(remoteRequests).toEqual([])
})

test('E2E-14 limita a transição a 600 ms sem bloquear unidade', async ({ page }) => {
  await mockDashboard(page)
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  const transition = await page.getByTestId('sky-layer').locator('[data-sky-layer="current"]').evaluate((element) => getComputedStyle(element).transitionDuration)
  expect(Number.parseFloat(transition) * 1000).toBeLessThanOrEqual(MAX_TRANSITION_MS)
  await page.getByRole('button', { name: '°F' }).click()
  await expect(page.getByText('68°F').first()).toBeVisible()
})

test('E2E-15 alterna unidades sem alterar data-band ou refazer clima', async ({ page }) => {
  let weatherRequests = 0
  await mockApi(page, '/api/geocode', 'geocode-single.json')
  await page.route('**/api/weather**', async (route) => {
    weatherRequests += 1
    await route.fulfill({ status: 200, contentType: 'application/json', body: await readFixture('weather-ok.json') })
  })
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  const main = page.locator('main')
  await expect(main).toHaveAttribute('data-band', 'mild')
  await page.getByRole('button', { name: '°F' }).click()
  await expect(main).toHaveAttribute('data-band', 'mild')
  expect(weatherRequests).toBe(1)
})

test('E2E-16 mantém atmosfera neutra e status semântico em erro', async ({ page }) => {
  await mockApi(page, '/api/geocode', 'geocode-single.json')
  await mockApi(page, '/api/weather', 'weather-error.json', 502)
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  await expect(page.locator('main')).toHaveAttribute('data-atmosphere', 'neutral')
  await expect(page.locator('main')).not.toHaveAttribute('data-band')
  await expect(page.getByRole('alert')).toBeVisible()
  await page.unroute('**/api/weather**')
  await mockApi(page, '/api/weather', 'weather-null-temperature.json')
  await page.reload()
  await searchCity(page, 'Lisboa')
  await expect(page.locator('main')).toHaveAttribute('data-atmosphere', 'rain')
  await expect(page.locator('main')).not.toHaveAttribute('data-band')
  await expect(page.locator('section[aria-labelledby="current-weather-title"]').getByText('—').first()).toBeVisible()
})

test('E2E-18 mantém fundo fora da árvore focável e controles navegáveis', async ({ page }) => {
  await mockDashboard(page, 'geocode-multiple.json')
  await page.goto('/')
  await searchCity(page, 'Vitória')
  const background = page.getByTestId('atmospheric-background')
  await expect(background).toHaveAttribute('aria-hidden', 'true')
  expect(await background.locator('[tabindex]').count()).toBe(0)
  await page.getByRole('searchbox', { name: 'Cidade' }).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeFocused()
})
