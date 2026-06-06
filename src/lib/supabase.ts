import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Customer = {
  id: string
  owner_id: string
  full_name: string
  email: string
  plan: string
  amount: number
  billing_date: number
  status: string
  created_at: string
}

export type Invoice = {
  id: string
  owner_id: string
  customer_id: string
  amount: number
  status: string
  due_date: string
  paid_at: string
  created_at: string
}

export type Campaign = {
  id: string
  owner_id: string
  name: string
  subject: string
  body: string
  sent_at: string
  recipient_count: number
  created_at: string
}