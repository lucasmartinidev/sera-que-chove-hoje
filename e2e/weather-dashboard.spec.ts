import { expect, test } from '@playwright/test'
import { mockApi, mockDashboard, readFixture, searchCity } from './weather-dashboard.helpers.js'

test('E2E-01 busca uma cidade e mostra clima atual e previsão de seis horas', async ({ page }) => {
  const externalRequests: string[] = []
  const browserErrors: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).hostname.endsWith('open-meteo.com')) externalRequests.push(request.url())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  await mockDashboard(page)
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  await expect(page.getByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
  await expect(page.getByText('20°C')).toHaveCount(2)
  await expect(page.getByText('Sensação térmica 21°C')).toBeVisible()
  await expect(page.locator('section[aria-labelledby="current-weather-title"]').getByText('Chuva fraca')).toBeVisible()
  await expect(page.getByText('56%')).toBeVisible()
  await expect(page.getByText('10 km/h S')).toBeVisible()
  await expect(page.getByText('1013 hPa')).toBeVisible()
  await expect(page.getByText(/Agora · horário local 12:00/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Próximas 6 horas' })).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveCount(6)
  expect(externalRequests).toEqual([])
  expect(browserErrors).toEqual([])
})

test('E2E-02 seleciona a cidade correta entre correspondências ambíguas', async ({ page }) => {
  await mockDashboard(page, 'geocode-multiple.json')
  const weatherRequest = page.waitForRequest('**/api/weather**')
  await page.goto('/')
  await searchCity(page, 'Vitória')
  await page.getByRole('button', { name: 'Vitória, Espírito Santo · Brasil' }).click()
  const request = await weatherRequest
  expect(new URL(request.url()).searchParams.get('lat')).toBe('-20.31944')
  await expect(page.getByRole('heading', { name: 'Vitória, Espírito Santo, Brasil' })).toBeVisible()
})

test('E2E-03 informa quando a busca não encontra cidades', async ({ page }) => {
  let attempts = 0
  await page.route('**/api/geocode**', async (route) => {
    attempts += 1
    const fixture = attempts === 1 ? 'geocode-empty.json' : 'geocode-single.json'
    await route.fulfill({ status: 200, contentType: 'application/json', body: await readFixture(fixture) })
  })
  await mockApi(page, '/api/weather', 'weather-ok.json')
  await page.goto('/')
  await searchCity(page, 'Cidade inventada')
  await expect(page.getByText('Nenhuma cidade encontrada. Tente outro nome.')).toBeVisible()
  await expect(page.getByRole('searchbox', { name: 'Cidade' })).toBeEnabled()
  await searchCity(page, 'Lisboa')
  await expect(page.getByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
})

test('E2E-04 oferece retry após falha temporária do serviço de clima', async ({ page }) => {
  await mockApi(page, '/api/geocode', 'geocode-single.json')
  let attempts = 0
  await page.route('**/api/weather**', async (route) => {
    attempts += 1
    const retrySucceeded = attempts > 1
    await route.fulfill({
      status: retrySucceeded ? 200 : 502,
      contentType: 'application/json',
      body: await readFixture(retrySucceeded ? 'weather-ok.json' : 'weather-error.json'),
    })
  })
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  await expect(page.getByRole('alert')).toContainText('Não foi possível obter os dados de clima agora.')
  await expect(page.getByRole('alert')).not.toContainText(/stack|open-meteo|https?:\/\//i)
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
  expect(attempts).toBe(2)
})

test('E2E-05 alterna unidades sem refazer a consulta', async ({ page }) => {
  let weatherRequests = 0
  await mockApi(page, '/api/geocode', 'geocode-single.json')
  await page.route('**/api/weather**', async (route) => {
    weatherRequests += 1
    await route.fulfill({ status: 200, contentType: 'application/json', body: await readFixture('weather-ok.json') })
  })
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  await expect(page.getByText('20°C')).toHaveCount(2)
  await page.getByRole('button', { name: '°F' }).click()
  await expect(page.getByText('68°F')).toHaveCount(2)
  await page.getByRole('button', { name: 'mph' }).click()
  await expect(page.getByText('6 mph S')).toBeVisible()
  expect(weatherRequests).toBe(1)
})

test('E2E-08 permite buscar e selecionar cidades usando somente o teclado', async ({ page }) => {
  await mockDashboard(page, 'geocode-multiple.json')
  const geocodeRequest = page.waitForRequest('**/api/geocode**')
  await page.goto('/')
  await page.getByRole('searchbox', { name: 'Cidade' }).focus()
  await page.keyboard.type('Vitória')
  await page.keyboard.press('Enter')
  const request = await geocodeRequest
  expect(new URL(request.url()).searchParams.get('city')).toBe('Vitória')
  const candidate = page.getByRole('button', { name: 'Vitória, Espírito Santo · Brasil' })
  await expect(candidate).toBeVisible()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(candidate).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Vitória, Espírito Santo, Brasil' })).toBeVisible()
})
