import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'
import { getTestData } from './helpers/data'

test.describe('Listings — public', () => {
  test('homepage shows the test listing', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('[E2E] Test Camera')).toBeVisible()
  })

  test('search filters by title', async ({ page }) => {
    await page.goto('/')
    await page.fill('[placeholder="Search items…"]', 'E2E')
    await expect(page.getByText('[E2E] Test Camera')).toBeVisible()

    await page.fill('[placeholder="Search items…"]', 'zzz-does-not-exist')
    await expect(page.getByText('No items match your search.')).toBeVisible()
  })

  test('category filter shows and hides listings', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Cameras' }).click()
    await expect(page.getByText('[E2E] Test Camera')).toBeVisible()

    await page.getByRole('button', { name: 'Gaming' }).click()
    await expect(page.getByText('No items match your search.')).toBeVisible()
  })

  test('listing detail page renders', async ({ page }) => {
    const { listingId } = getTestData()
    await page.goto(`/listings/${listingId}`)
    await expect(page.getByRole('heading', { name: '[E2E] Test Camera' })).toBeVisible()
    await expect(page.getByText('$25')).toBeVisible()
    await expect(page.getByText('Availability')).toBeVisible()
  })
})

test.describe('Listings — owner', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner')
  })

  test('owner sees owner controls on their listing', async ({ page }) => {
    const { listingId } = getTestData()
    await page.goto(`/listings/${listingId}`)
    await expect(page.getByText('This is your listing')).toBeVisible()
    // Owner controls banner should be present
    await expect(page.getByRole('link', { name: 'Edit' })).toBeVisible()
  })

  test('owner can create a listing and delete it', async ({ page }) => {
    await page.goto('/new')
    await page.fill('[placeholder="e.g. Sony A7III Camera"]', '[E2E] Temp Listing')
    await page.fill('[placeholder="0.00"]', '10')
    await page.getByRole('button', { name: 'Audio' }).click()
    await page.getByRole('button', { name: 'Post item' }).click()

    await page.waitForURL(/\/listings\/[a-z0-9-]+$/)
    await expect(page.getByRole('heading', { name: '[E2E] Temp Listing' })).toBeVisible()

    // Delete it via edit page
    const listingUrl = page.url()
    await page.goto(listingUrl + '/edit')
    await page.waitForLoadState('networkidle')
    page.on('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Delete listing' }).click()
    await page.waitForURL('/profile')
  })

  test('owner can edit a listing', async ({ page }) => {
    const { listingId } = getTestData()
    await page.goto(`/listings/${listingId}/edit`)
    await page.waitForLoadState('networkidle')
    await page.fill('input[type="text"]', '[E2E] Test Camera Edited')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await page.waitForURL(`/listings/${listingId}`)
    await expect(page.getByRole('heading', { name: '[E2E] Test Camera Edited' })).toBeVisible()

    // Restore original title
    await page.goto(`/listings/${listingId}/edit`)
    await page.fill('input[type="text"]', '[E2E] Test Camera')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await page.waitForURL(`/listings/${listingId}`)
  })

  test('owner can toggle availability', async ({ page }) => {
    const { listingId } = getTestData()
    await page.goto(`/listings/${listingId}`)

    // Use a structural selector so it stays stable after text changes
    const toggle = page.locator('[class*="amber-50"] button').first()
    const initialText = await toggle.textContent()
    await toggle.click()

    // Wait for text to change (Available ↔ Rented out)
    await expect(toggle).not.toHaveText(initialText!, { timeout: 5000 })

    // Toggle back
    await toggle.click()
    await expect(toggle).toHaveText(initialText!, { timeout: 5000 })
  })
})

test.describe('Listings — renter', () => {
  test('non-owner sees request form, not contact button', async ({ page }) => {
    await loginAs(page, 'renter')
    const { listingId } = getTestData()
    await page.goto(`/listings/${listingId}`)
    await expect(page.getByRole('button', { name: 'Request to Rent →' })).toBeVisible()
    await expect(page.getByText('This is your listing')).not.toBeVisible()
  })

  test('guest is prompted to login instead of seeing request form', async ({ page }) => {
    const { listingId } = getTestData()
    await page.goto(`/listings/${listingId}`)
    await expect(page.getByRole('link', { name: 'Login to request rental' })).toBeVisible()
  })
})
