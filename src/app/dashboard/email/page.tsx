'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function EmailPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      fetchData(user.id)
    }
    getUser()
  }, [])

  const fetchData = async (userId: string) => {
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    setCustomers(customers || [])
    setCampaigns(campaigns || [])
    setSelected((customers || []).map((c: any) => c.id))
    setLoading(false)
  }

  const toggleCustomer = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const sendEmails = async () => {
    setError('')
    if (!subject) { setError('Please enter a subject'); return }
    if (!message) { setError('Please write a message'); return }
    if (selected.length === 0) { setError('Please select at least one customer'); return }

    setSending(true)
    const selectedCustomers = customers.filter(c => selected.includes(c.id))
    let successCount = 0

    for (const customer of selectedCustomers) {
      try {
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customer.email,
            subject,
            html: `
              <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fafaf8;border-radius:16px;">
                <div style="margin-bottom:24px;">
                  <span style="font-size:18px;font-weight:600;color:#111110;">Biz</span>
                  <span style="font-size:18px;font-weight:600;color:#1D9E75;">Flow</span>
                </div>
                <p style="color:#111110;font-size:15px;line-height:1.7;white-space:pre-line;">${message}</p>
                <hr style="border:none;border-top:1px solid #e8e8e3;margin:24px 0;"/>
                <p style="color:#9a9a90;font-size:12px;">Reply to unsubscribe.</p>
              </div>
            `
          })
        })
        if (res.ok) successCount++
      } catch (e) {
        console.error('Failed to send to', customer.email)
      }
    }

    await supabase.from('campaigns').insert({
      owner_id: user.id,
      name: subject,
      subject,
      body: message,
      sent_at: new Date().toISOString(),
      recipient_count: successCount
    })

    setSending(false)
    setSent(true)
    setSubject('')
    setMessage('')
    fetchData(user.id)
    setTimeout(() => setSent(false), 4000)
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
            { label: 'Customers', href: '/dashboard/customers' },
            { label: 'Invoices', href: '/dashboard/invoices' },
            { label: 'Email', href: '/dashboard/email', active: true },
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
          <h1 className="text-white font-medium text-sm">Email</h1>
          <div className="text-white/30 text-xs">{selected.length} of {customers.length} selected</div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-5">

            {/* Customer selector */}
            <div className="col-span-1">
              <div className="bg-white/4 border border-white/6 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
                  <span className="text-white text-xs font-medium">Recipients</span>
                  <div className="flex gap-2">
                    <button onClick={() => setSelected(customers.map(c => c.id))} className="text-[#1D9E75] text-xs hover:opacity-80">All</button>
                    <span className="text-white/20 text-xs">·</span>
                    <button onClick={() => setSelected([])} className="text-white/30 text-xs hover:opacity-80">None</button>
                  </div>
                </div>
                {customers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/20 text-xs">No customers yet</p>
                  </div>
                ) : (
                  customers.map(c => (
                    <div
                      key={c.id}
                      onClick={() => toggleCustomer(c.id)}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-white/4 cursor-pointer transition-colors ${
                        selected.includes(c.id) ? 'bg-[#1D9E75]/8' : 'hover:bg-white/3'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        selected.includes(c.id) ? 'bg-[#1D9E75] border-[#1D9E75]' : 'border-white/20'
                      }`}>
                        {selected.includes(c.id) && (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-white text-xs">{c.full_name}</div>
                        <div className="text-white/30 text-xs">{c.email}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Compose */}
            <div className="col-span-2 flex flex-col gap-4">
              <div className="bg-white/4 border border-white/6 rounded-xl p-5">
                <h2 className="text-white text-sm font-medium mb-4">Compose email</h2>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                {sent && (
                  <div className="bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-lg px-4 py-3 mb-4">
                    <p className="text-[#1D9E75] text-xs">✅ Emails sent successfully!</p>
                  </div>
                )}

                <div className="mb-3">
                  <label className="text-white/40 text-xs mb-1.5 block">Subject</label>
                  <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Important update from us"
                    className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-[#1D9E75] transition-colors"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-white/40 text-xs mb-1.5 block">Message</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    rows={8}
                    className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-[#1D9E75] transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={sendEmails}
                  disabled={sending || selected.length === 0}
                  className="w-full bg-[#1D9E75] disabled:opacity-50 text-white text-sm font-medium py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {sending ? `Sending to ${selected.length} customers...` : `Send to ${selected.length} customer${selected.length !== 1 ? 's' : ''}`}
                </button>
              </div>

              {campaigns.length > 0 && (
                <div className="bg-white/4 border border-white/6 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/6">
                    <span className="text-white text-xs font-medium">Past campaigns</span>
                  </div>
                  {campaigns.map(c => (
                    <div key={c.id} className="px-4 py-3 border-b border-white/4 hover:bg-white/3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-xs font-medium">{c.name}</span>
                        <span className="text-white/30 text-xs">{new Date(c.sent_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white/40 text-xs">{c.recipient_count} recipients</span>
                        <span className="text-[#1D9E75] text-xs">Sent ✓</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}