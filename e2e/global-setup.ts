import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

export const OWNER_EMAIL = 'e2e-owner@test.edu.sg'
export const RENTER_EMAIL = 'e2e-renter@test.edu.sg'
const DATA_FILE = path.join(__dirname, '.test-data.json')

export default async function globalSetup() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Create or retrieve test users (admin.createUser fails if exists, that's fine)
  const [ownerResult, renterResult] = await Promise.all([
    admin.auth.admin.createUser({ email: OWNER_EMAIL, email_confirm: true }),
    admin.auth.admin.createUser({ email: RENTER_EMAIL, email_confirm: true }),
  ])

  // Get user IDs (createUser returns the user even if it already exists via error.message check)
  // If user exists, look them up by email
  const ownerId = ownerResult.data?.user?.id ?? (await getUserIdByEmail(admin, OWNER_EMAIL))
  const renterId = renterResult.data?.user?.id ?? (await getUserIdByEmail(admin, RENTER_EMAIL))

  if (!ownerId || !renterId) throw new Error('Failed to create/find test users')

  // Upsert owner profile with telegram handle so contact info works after acceptance
  await admin.from('profiles').upsert({
    id: ownerId,
    full_name: 'E2E Owner',
    telegram_handle: 'e2e_owner_test',
    university_name: 'NUS',
  })

  await admin.from('profiles').upsert({
    id: renterId,
    full_name: 'E2E Renter',
    telegram_handle: null,
    university_name: 'NTU',
  })

  // Delete any leftover E2E listings then create a fresh one
  await admin.from('listings').delete().eq('owner_id', ownerId)

  const { data: listing, error: listingError } = await admin
    .from('listings')
    .insert({
      owner_id: ownerId,
      title: '[E2E] Test Camera',
      description: 'E2E test listing — do not rent',
      daily_price: 25,
      category: 'Cameras',
      image_url: null,
      is_available: true,
    })
    .select('id')
    .single()

  if (listingError || !listing) throw new Error(`Failed to create test listing: ${listingError?.message}`)

  fs.writeFileSync(DATA_FILE, JSON.stringify({ ownerId, renterId, listingId: listing.id }))
  console.log(`[E2E setup] owner=${ownerId} renter=${renterId} listing=${listing.id}`)
}

async function getUserIdByEmail(admin: ReturnType<typeof createClient>, email: string) {
  // Supabase admin doesn't have a "get user by email" directly, but listUsers does
  const { data } = await admin.auth.admin.listUsers()
  return data?.users?.find((u) => u.email === email)?.id ?? null
}
