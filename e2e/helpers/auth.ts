import type { Page } from '@playwright/test'
import { OWNER_EMAIL, RENTER_EMAIL } from '../global-setup'

export async function loginAs(page: Page, role: 'owner' | 'renter') {
  const email = role === 'owner' ? OWNER_EMAIL : RENTER_EMAIL
  await page.goto(`/api/e2e/login?email=${encodeURIComponent(email)}&next=/`)
  await page.waitForURL('/')
}
