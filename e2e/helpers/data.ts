import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const DATA_FILE = path.join(__dirname, '../.test-data.json')

export function getTestData(): { ownerId: string; renterId: string; listingId: string } {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
}

export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
