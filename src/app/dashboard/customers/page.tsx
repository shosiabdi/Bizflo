'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function CustomersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    plan: '',
    amount: '',
    billing_date: '1',
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      fetchCustomers(user.id)
    }
    getUser()
  }, [])

  const fetchCustomers = async (userId: string) => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
    setCustomers(data || [])
    setLoading(false)
  }

  const addCustomer = async () => {
    setError('')
    if (!form.full_name) { setError('Please enter a name'); return }
    if (!form.email) { setError('Please enter an email'); return }
    if (!form.amount) { setError('Please enter an amount'); return }
    setSaving(true)

    // Step 1 — Create customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        owner_id: user.id,
        full_name: form.full_name,
        email: form.email,
        plan: form.plan || 'Starter',
        amount: parseFloat(form.amount),
        billing_date: parseInt(form.billing_date),
        status: 'active'
      })
      .select()
      .single()

    if (customerError) { setError(customerError.message); setSaving(false); return }

    // Step 2 — Create first invoice
    const dueDate = new Date()
    dueDate.setDate(parseInt(form.billing_date))
    if (dueDate < new Date()) dueDate.setMonth(dueDate.getMonth() + 1)

    await supabase.from('invoices').insert({
      owner_id: user.id,
      customer_id: customer.id,
      amount: parseFloat(form.amount),
      due_date: dueDate.toISOString().split('T')[0],
      status: 'pending'
    })

    // Step 3 — Send welcome email
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: form.email,
        subject: `Welcome, ${form.full_name}!`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fafaf8;border-radius:16px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
              <div style="width:32px;height:32px;background:#1D9E75;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                <span style="color:white;font-size:16px;">~</span>
              </div>
              <span style="font-size:18px;font-weight:600;color:#111110;">Biz<span style="color:#1D9E75;">Flow</span></span>
            </div>
            <h1 style="font-size:22px;color:#111110;margin-bottom:8px;font-weight:600;">Welcome, ${form.full_name}! 👋</h1>
            <p style="color:#6e6e65;font-size:15px;line-height:1.7;margin-bottom:16px;">
              You have been added to the platform on the <strong>${form.plan || 'Starter'}</strong> plan at <strong>$${form.amount}/month</strong>.
            </p>
            <p style="color:#6e6e65;font-size:15px;line-height:1.7;margin-bottom:24px;">
              Your first invoice will be sent on the <strong>${form.billing_date}${parseInt(form.billing_date) === 1 ? 'st' : parseInt(form.billing_date) === 2 ? 'nd' : parseInt(form.billing_date) === 3 ? 'rd' : 'th'}</strong> of every month.
            </p>
            <p style="color:#9a9a90;font-size:13px;">Questions? Just reply to this email.</p>
          </div>
        `
      })
    })

    setForm({ full_name: '', email: '', plan: '', amount: '', billing_date: '1' })
    setShowForm(false)
    setSaving(false)
    fetchCustomers(user.id)
  }

  const deleteCustomer = async (id: string) => {
    await supabase.from('customers').delete().eq('id', id)
    fetchCustomers(user.id)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#111110] flex items-center justify-center">
      <div className="text-white/40 text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#111110] flex">

      {/* Sidebar */}
      <div className="w-52 border-r border-white/6 flex flex-col bg-[#141412] flex-shrink-0">
        <div className="p-4 border-b border-white/6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1D9E75] rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 9 Q5 4 8 7 Q11 10 13 6 Q14 4 15 5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M2 12 Q5 8 8 10 Q11 13 13 9 Q14 7 15 8" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            <span className="text-white font-medium text-sm">Biz<span className="text-[#1D9E75]">Flow</span></span>
          </div>
        </div>
        <nav className="p-2 flex-1">
          {[
            { label: '🚀 Launchpad', href: '/dashboard/launchpad' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Customers', href: '/dashboard/customers', active: true },
            { label: 'Invoices', href: '/dashboard/invoices' },
            { label: 'Email', href: '/dashboard/email' },
            { label: 'Grow', href: '/dashboard/grow' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors text-left ${
                item.active ? 'bg-white/8 text-white font-medium' : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/6">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            className="w-full text-left px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
          <h1 className="text-white font-medium text-sm">Customers</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#1D9E75] hover:opacity-90 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity"
          >
            + Add customer
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {showForm && (
            <div className="bg-white/4 border border-white/8 rounded-xl p-5 mb-5">
              <h2 className="text-white text-sm font-medium mb-1">New customer</h2>
              <p className="text-white/30 text-xs mb-4">Adding a customer automatically creates their first invoice and sends a welcome email.</p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-white/40 text-xs mb-1.5 block">Full name *</label>
                  <input
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-[#1D9E75] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1.5 block">Email *</label>
                  <input
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-[#1D9E75] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1.5 block">Plan name</label>
                  <input
                    value={form.plan}
                    onChange={e => setForm({ ...form, plan: e.target.value })}
                    placeholder="e.g. Pro, Starter, Basic"
                    className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-[#1D9E75] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1.5 block">Monthly amount ($) *</label>
                  <input
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="75"
                    type="number"
                    className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-[#1D9E75] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1.5 block">Billing date</label>
                  <select
                    value={form.billing_date}
                    onChange={e => setForm({ ...form, billing_date: e.target.value })}
                    className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#1D9E75] transition-colors"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day} className="bg-[#111110]">
                        {day === 1 ? '1st' : day === 2 ? '2nd' : day === 3 ? '3rd' : `${day}th`} of every month
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-[#1D9E75]/8 border border-[#1D9E75]/20 rounded-lg px-4 py-3 mb-4">
                <p className="text-[#1D9E75] text-xs">✓ First invoice created automatically · ✓ Welcome email sent instantly</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addCustomer}
                  disabled={saving}
                  className="bg-[#1D9E75] disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {saving ? 'Adding customer...' : 'Add customer'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setError('') }}
                  className="bg-white/5 text-white/50 text-xs px-4 py-2 rounded-lg hover:bg-white/8"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {customers.length === 0 && !showForm ? (
            <div className="text-center py-20">
              <p className="text-white/20 text-sm mb-4">No customers yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#1D9E75] text-white text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90"
              >
                Add your first customer
              </button>
            </div>
          ) : customers.length > 0 ? (
            <div className="bg-white/4 border border-white/6 rounded-xl overflow-hidden">
              <div className="grid grid-cols-6 text-white/30 text-xs font-medium px-4 py-3 border-b border-white/6">
                <span>Name</span><span>Email</span><span>Plan</span><span>Amount</span><span>Billing</span><span>Status</span>
              </div>
              {customers.map(c => (
                <div key={c.id} className="grid grid-cols-6 px-4 py-3 border-b border-white/4 hover:bg-white/3 items-center">
                  <span className="text-white text-xs">{c.full_name}</span>
                  <span className="text-white/40 text-xs truncate">{c.email}</span>
                  <span className="text-white/50 text-xs">{c.plan}</span>
                  <span className="text-white text-xs font-medium">${c.amount}/mo</span>
                  <span className="text-white/40 text-xs">{c.billing_date}{c.billing_date === 1 ? 'st' : c.billing_date === 2 ? 'nd' : c.billing_date === 3 ? 'rd' : 'th'}</span>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-[#1D9E75]/15 text-[#1D9E75]' : 'bg-white/8 text-white/40'}`}>{c.status}</span>
                    <button onClick={() => deleteCustomer(c.id)} className="text-white/20 hover:text-red-400 text-xs transition-colors">✕</button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

        </div>
      </div>
    </div>
  )
}