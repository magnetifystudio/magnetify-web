import { createBrowserClient } from '@supabase/ssr'

let client: any;

export function createClient() {
  // If a client already exists, return that one instead of making a new one
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  return client;
}