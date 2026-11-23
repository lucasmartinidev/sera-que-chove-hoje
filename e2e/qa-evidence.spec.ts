import { expect, test } from '@playwright/test'
import { resolve } from 'node:path'
import type { Page } from '@playwright/test'
import { mockApi, mockDashboard, readFixture, searchCity } from './weather-dashboard.helpers.js'

const EVIDENCE_DIRECTORY = resolve(process.cwd(), '../tasks/prd-painel-de-clima/evidences')

async function capture(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: resolve(EVIDENCE_DIRECTORY, name), fullPage: true })
}

test('captura os estados inicial, sucesso, ambiguidade, vazio, erro e unidades', async ({ page }) => {
  await mockDashboard(page)
  await page.goto('/')
  await capture(page, '01-estado-inicial-desktop.png')
  await searchCity(page, 'Lisboa')
  await expect(page.getByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
  await capture(page, '02-clima-atual-e-previsao-desktop.png')
  await page.getByRole('button', { name: '°F' }).click()
  await page.getByRole('button', { name: 'mph' }).click()
  await capture(page, '03-unidades-imperiais.png')
  await mockApi(page, '/api/geocode', 'geocode-multiple.json')
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Vitória')
  await page.getByRole('button', { name: 'Buscar' }).click()
  const candidate = page.getByRole('button', { name: 'Vitória, Espírito Santo · Brasil' })
  await expect(candidate).toBeVisible()
  await capture(page, '04-selecao-cidade-ambigua.png')
  await candidate.click()
  await expect(page.getByRole('heading', { name: 'Vitória, Espírito Santo, Brasil' })).toBeVisible()
  await capture(page, '04b-cidade-selecionada.png')
  await mockApi(page, '/api/geocode', 'geocode-empty.json')
  await searchCity(page, 'Cidade inventada')
  await expect(page.getByText('Nenhuma cidade encontrada. Tente outro nome.')).toBeVisible()
  await capture(page, '05-cidade-nao-encontrada.png')
})

test('captura erro do serviço e estado de recuperação', async ({ page }) => {
  await mockApi(page, '/api/geocode', 'geocode-single.json')
  let attempts = 0
  await page.route('**/api/weather**', async (route) => {
    attempts += 1
    const recovered = attempts > 1
    await route.fulfill({ status: recovered ? 200 : 502, contentType: 'application/json', body: await readFixture(recovered ? 'weather-ok.json' : 'weather-error.json') })
  })
  await page.goto('/')
  await searchCity(page, 'Lisboa')
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible()
  await capture(page, '06-erro-do-servico-com-retry.png')
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
  await capture(page, '06b-retry-recuperado.png')
})

test('captura geolocalização concedida', async ({ page, context }) => {
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: -20.3, longitude: -40.3 })
  await mockApi(page, '/api/weather', 'weather-ok.json')
  await page.goto('/')
  await page.getByRole('button', { name: 'Minha localização' }).click()
  await expect(page.getByRole('heading', { name: 'Minha localização' })).toBeVisible()
  await capture(page, '07-geolocalizacao-concedida.png')
})

test('captura recusa de geolocalização e busca manual', async ({ page, context }) => {
  await context.grantPermissions([])
  await mockDashboard(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Minha localização' }).click()
  await expect(page.getByText(/Permissão de localização negada/)).toBeVisible()
  await capture(page, '10-geolocalizacao-negada.png')
  await searchCity(page, 'Lisboa')
  await expect(page.getByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
  await capture(page, '10b-busca-manual-apos-recusa.png')
})

test('captura busca acessível por teclado e layout responsivo', async ({ page }) => {
  await mockDashboard(page, 'geocode-multiple.json')
  await page.goto('/')
  const cityInput = page.getByRole('searchbox', { name: 'Cidade' })
  await expect(cityInput).toBeVisible()
  await cityInput.focus()
  await page.keyboard.type('Vitória')
  await page.keyboard.press('Enter')
  const candidate = page.getByRole('button', { name: 'Vitória, Espírito Santo · Brasil' })
  await expect(candidate).toBeVisible()
  await candidate.focus()
  await capture(page, '08-candidato-focado-por-teclado.png')
  await page.keyboard.press('Escape')
  await expect(candidate).toBeVisible()
  await candidate.press('Enter')
  await expect(page.getByRole('heading', { name: 'Vitória, Espírito Santo, Brasil' })).toBeVisible()
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1280, height: 900 }]) {
    await page.setViewportSize(viewport)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await capture(page, `09-clima-${viewport.width}px.png`)
  }
})
