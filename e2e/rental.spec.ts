import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'
import { getTestData, getAdminClient } from './helpers/data'

test.describe('Rental request flow', () => {
  // Clean up any lingering rental_requests before each test
  test.beforeEach(async () => {
    const { listingId } = getTestData()
    const admin = getAdminClient()
    await admin.from('rental_requests').delete().eq('listing_id', listingId)
  })

  test('renter submits a request and sees pending state', async ({ page }) => {
    await loginAs(page, 'renter')
    const { listingId } = getTestData()
    await page.goto(`/listings/${listingId}`)

    await page.locator('input[type="date"]').nth(0).fill('2026-05-01')
    await page.locator('input[type="date"]').nth(1).fill('2026-05-03')
    await page.fill('textarea', 'Hi, I would like to rent this for a project.')
    await page.getByRole('button', { name: 'Request to Rent →' }).click()

    await expect(page.getByText('Request sent — waiting for owner to respond')).toBeVisible()
  })

  test('pending request persists on page reload', async ({ page }) => {
    // Insert a pending request directly via admin
    const { listingId, ownerId, renterId } = getTestData()
    const admin = getAdminClient()
    await admin.from('rental_requests').insert({
      listing_id: listingId,
      renter_id: renterId,
      owner_id: ownerId,
      start_date: '2026-05-01',
      end_date: '2026-05-03',
      message: 'Test message',
      status: 'pending',
    })

    await loginAs(page, 'renter')
    await page.goto(`/listings/${listingId}`)
    await expect(page.getByText('Request sent — waiting for owner to respond')).toBeVisible()
    // Form should NOT be visible
    await expect(page.getByRole('button', { name: 'Request to Rent →' })).not.toBeVisible()
  })

  test('owner sees incoming request in profile', async ({ page }) => {
    const { listingId, ownerId, renterId } = getTestData()
    const admin = getAdminClient()
    await admin.from('rental_requests').insert({
      listing_id: listingId,
      renter_id: renterId,
      owner_id: ownerId,
      start_date: '2026-05-01',
      end_date: '2026-05-03',
      message: 'I would like to rent this',
      status: 'pending',
    })

    await loginAs(page, 'owner')
    await page.goto('/profile')
    await expect(page.getByText('Incoming requests')).toBeVisible()
    await expect(page.getByText('[E2E] Test Camera').first()).toBeVisible()
    await expect(page.getByText('2026-05-01 → 2026-05-03')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Decline' })).toBeVisible()
  })

  test('owner declining a request removes it from the list', async ({ page }) => {
    const { listingId, ownerId, renterId } = getTestData()
    const admin = getAdminClient()
    await admin.from('rental_requests').insert({
      listing_id: listingId,
      renter_id: renterId,
      owner_id: ownerId,
      start_date: '2026-05-10',
      end_date: '2026-05-12',
      status: 'pending',
    })

    await loginAs(page, 'owner')
    await page.goto('/profile')
    await page.getByRole('button', { name: 'Decline' }).click()
    await expect(page.getByText('No pending requests.')).toBeVisible()
  })

  test('overlap check blocks submission for already-booked dates', async ({ page }) => {
    const { listingId, ownerId } = getTestData()
    const admin = getAdminClient()

    // Insert an accepted booking for June 1–5 (use ownerId as renter so test renter still sees the form)
    await admin.from('rental_requests').insert({
      listing_id: listingId,
      renter_id: ownerId,
      owner_id: ownerId,
      start_date: '2026-06-01',
      end_date: '2026-06-05',
      status: 'accepted',
    })

    await loginAs(page, 'renter')
    await page.goto(`/listings/${listingId}`)

    // Try overlapping dates (June 3–7 overlaps June 1–5)
    await page.locator('input[type="date"]').nth(0).fill('2026-06-03')
    await page.locator('input[type="date"]').nth(1).fill('2026-06-07')
    await page.getByRole('button', { name: 'Request to Rent →' }).click()

    // Frontend guard catches it before even hitting the DB
    await expect(page.getByText('overlap with an existing booking')).toBeVisible()
    // Form stays open — button still present
    await expect(page.getByRole('button', { name: 'Request to Rent →' })).toBeVisible()
  })

  test('accepting a request auto-declines all overlapping pending requests', async ({ page }) => {
    const { listingId, ownerId, renterId } = getTestData()
    const admin = getAdminClient()

    // Two pending requests with overlapping dates:
    // Request A: renter (Jul 1–5), Request B: ownerId as second renter (Jul 3–7, overlaps A)
    await admin.from('rental_requests').insert([
      { listing_id: listingId, renter_id: renterId, owner_id: ownerId, start_date: '2026-07-01', end_date: '2026-07-05', status: 'pending' },
      { listing_id: listingId, renter_id: ownerId,  owner_id: ownerId, start_date: '2026-07-03', end_date: '2026-07-07', status: 'pending' },
    ])

    await loginAs(page, 'owner')
    await page.goto('/profile')
    await expect(page.getByRole('button', { name: 'Accept' })).toHaveCount(2)

    // Accept whichever comes first
    await page.getByRole('button', { name: 'Accept' }).first().click()

    // Both requests should be gone from the pending list (one accepted, one auto-declined)
    await expect(page.getByText('No pending requests.')).toBeVisible()

    // Verify DB state: exactly one accepted, one declined
    const { data } = await admin
      .from('rental_requests')
      .select('status')
      .eq('listing_id', listingId)
    const statuses = data!.map((r) => r.status).sort()
    expect(statuses).toEqual(['accepted', 'declined'])
  })

  test('declined renter sees message and can re-request different dates', async ({ page }) => {
    const { listingId, ownerId, renterId } = getTestData()
    const admin = getAdminClient()

    // Insert a declined request for August dates
    await admin.from('rental_requests').insert({
      listing_id: listingId,
      renter_id: renterId,
      owner_id: ownerId,
      start_date: '2026-08-01',
      end_date: '2026-08-03',
      status: 'declined',
    })

    await loginAs(page, 'renter')
    await page.goto(`/listings/${listingId}`)

    // Declined banner visible
    await expect(page.getByText('Your previous request was declined')).toBeVisible()
    // Form is still shown so they can re-request
    await expect(page.getByRole('button', { name: 'Request to Rent →' })).toBeVisible()

    // Re-request with non-overlapping dates (September)
    await page.locator('input[type="date"]').nth(0).fill('2026-09-01')
    await page.locator('input[type="date"]').nth(1).fill('2026-09-03')
    await page.getByRole('button', { name: 'Request to Rent →' }).click()
    await expect(page.getByText('Request sent — waiting for owner to respond')).toBeVisible()
  })

  test('full flow: owner accepts → renter sees contact info → calendar blocks dates', async ({ browser }) => {
    const { listingId, ownerId, renterId } = getTestData()
    const admin = getAdminClient()
    await admin.from('rental_requests').insert({
      listing_id: listingId,
      renter_id: renterId,
      owner_id: ownerId,
      start_date: '2026-05-20',
      end_date: '2026-05-22',
      status: 'pending',
    })

    // Owner accepts
    const ownerCtx = await browser.newContext()
    const ownerPage = await ownerCtx.newPage()
    await loginAs(ownerPage, 'owner')
    await ownerPage.goto('/profile')
    await ownerPage.getByRole('button', { name: 'Accept' }).click()
    await expect(ownerPage.getByText('No pending requests.')).toBeVisible()
    await ownerCtx.close()

    // Renter sees contact info
    const renterCtx = await browser.newContext()
    const renterPage = await renterCtx.newPage()
    await loginAs(renterPage, 'renter')
    await renterPage.goto(`/listings/${listingId}`)
    await expect(renterPage.getByText('Owner accepted!')).toBeVisible()
    await expect(renterPage.getByText('e2e_owner_test')).toBeVisible()
    await renterCtx.close()

    // Calendar shows the dates as booked (navigate to May 2026)
    const guestCtx = await browser.newContext()
    const guestPage = await guestCtx.newPage()
    await guestPage.goto(`/listings/${listingId}`)
    // Navigate to May 2026 if not already there
    const monthLabel = guestPage.locator('text=May 2026')
    while (!(await monthLabel.isVisible())) {
      await guestPage.getByLabel('Next month').click()
    }
    // Day 20 should have line-through (booked)
    const day20 = guestPage.locator('.line-through').filter({ hasText: '20' })
    await expect(day20).toBeVisible()
    await guestCtx.close()
  })
})
