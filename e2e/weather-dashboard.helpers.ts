import { readFile } from 'node:fs/promises'
import type { Page } from '@playwright/test'

const FIXTURE_DIRECTORY = new URL('./fixtures/', import.meta.url)
const SUCCESS_STATUS = 200
export const FRONTEND_ORIGIN = `http://127.0.0.1:${process.env.E2E_FRONTEND_PORT ?? '5101'}`

export async function readFixture(name: string): Promise<string> {
  return readFile(new URL(name, FIXTURE_DIRECTORY), 'utf8')
}

export async function mockApi(page: Page, path: string, fixture: string, status = SUCCESS_STATUS): Promise<void> {
  const body = await readFixture(fixture)
  await page.route(`**${path}**`, (route) => route.fulfill({ status, contentType: 'application/json', body }))
}

export async function mockDashboard(page: Page, geocode = 'geocode-single.json'): Promise<void> {
  await mockApi(page, '/api/geocode', geocode)
  await mockApi(page, '/api/weather', 'weather-ok.json')
}

export async function searchCity(page: Page, city: string): Promise<void> {
  await page.getByRole('searchbox', { name: 'Cidade' }).fill(city)
  await page.getByRole('button', { name: 'Buscar' }).click()
}
