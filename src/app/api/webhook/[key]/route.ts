import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key: webhookKey } = await params
    const body = await req.json()
    const { event, email, name, plan, amount } = body

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('webhook_key', webhookKey)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Invalid webhook key' }, { status: 401 })
    }

    if (event === 'user.created') {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          owner_id: profile.id,
          full_name: name || email,
          email: email,
          plan: plan || 'Starter',
          amount: amount || 0,
          billing_date: 1,
          status: 'active'
        })
        .select()
        .single()

      if (customerError) {
        return NextResponse.json({ error: customerError.message }, { status: 500 })
      }

      const dueDate = new Date()
      dueDate.setMonth(dueDate.getMonth() + 1)
      dueDate.setDate(1)

      await supabase.from('invoices').insert({
        owner_id: profile.id,
        customer_id: customer.id,
        amount: amount || 0,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending'
      })

      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `Welcome ${name || ''}!`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fafaf8;border-radius:16px;">
              <span style="font-size:18px;font-weight:600;color:#111110;">Biz</span>
              <span style="font-size:18px;font-weight:600;color:#1D9E75;">Flow</span>
              <h1 style="font-size:22px;color:#111110;margin:24px 0 8px;">Welcome, ${name || email}! 👋</h1>
              <p style="color:#6e6e65;font-size:15px;line-height:1.7;">You have been added on the <strong>${plan || 'Starter'}</strong> plan at <strong>$${amount}/month</strong>.</p>
            </div>
          `
        })
      })

      return NextResponse.json({ success: true, customer_id: customer.id })
    }

    if (event === 'payment.received') {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('owner_id', profile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

      if (invoices && invoices.length > 0) {
        await supabase.from('invoices').update({
          status: 'paid',
          paid_at: new Date().toISOString()
        }).eq('id', invoices[0].id)
      }

      return NextResponse.json({ success: true })
    }

    if (event === 'subscription.cancelled') {
      await supabase
        .from('customers')
        .update({ status: 'cancelled' })
        .eq('owner_id', profile.id)
        .eq('email', email)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true, message: 'Event received' })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}