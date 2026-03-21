import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const DATA_FILE = path.join(__dirname, '.test-data.json')

export default async function globalTeardown() {
  if (!fs.existsSync(DATA_FILE)) return

  const { ownerId, renterId } = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  fs.unlinkSync(DATA_FILE)

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Deleting users cascades to profiles, listings, and rental_requests
  await Promise.all([
    admin.auth.admin.deleteUser(ownerId),
    admin.auth.admin.deleteUser(renterId),
  ])

  console.log('[E2E teardown] test users and data deleted')
}
