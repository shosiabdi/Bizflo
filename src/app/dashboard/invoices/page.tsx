'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function InvoicesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*, customers(full_name, email)')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .eq('owner_id', userId)

    setInvoices(invoices || [])
    setCustomers(customers || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('invoices').update({
      status,
      paid_at: status === 'paid' ? new Date().toISOString() : null
    }).eq('id', id)
    fetchData(user.id)
  }

  const deleteInvoice = async (id: string) => {
    await supabase.from('invoices').delete().eq('id', id)
    fetchData(user.id)
  }

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0)
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0)

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
            { label: 'Invoices', href: '/dashboard/invoices', active: true },
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
          <h1 className="text-white font-medium text-sm">Invoices</h1>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-lg px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]"></div>
            <span className="text-white/40 text-xs">Auto-sending active</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-white/4 border border-white/6 rounded-xl p-4">
              <div className="text-white/40 text-xs mb-2">Collected</div>
              <div className="text-white text-2xl font-medium mb-1">${totalPaid.toLocaleString()}</div>
              <div className="text-[#1D9E75] text-xs">{invoices.filter(i => i.status === 'paid').length} paid</div>
            </div>
            <div className="bg-white/4 border border-white/6 rounded-xl p-4">
              <div className="text-white/40 text-xs mb-2">Pending</div>
              <div className="text-white text-2xl font-medium mb-1">${totalPending.toLocaleString()}</div>
              <div className="text-amber-400 text-xs">{invoices.filter(i => i.status === 'pending').length} awaiting payment</div>
            </div>
            <div className="bg-white/4 border border-white/6 rounded-xl p-4">
              <div className="text-white/40 text-xs mb-2">Overdue</div>
              <div className="text-white text-2xl font-medium mb-1">${totalOverdue.toLocaleString()}</div>
              <div className="text-red-400 text-xs">{invoices.filter(i => i.status === 'overdue').length} overdue</div>
            </div>
          </div>

          {/* Invoices list */}
          {invoices.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/20 text-sm mb-3">No invoices yet</p>
              <p className="text-white/10 text-xs">Add a customer to automatically create their first invoice</p>
            </div>
          ) : (
            <div className="bg-white/4 border border-white/6 rounded-xl overflow-hidden">
              <div className="grid grid-cols-5 text-white/30 text-xs font-medium px-4 py-3 border-b border-white/6">
                <span>Customer</span><span>Amount</span><span>Due date</span><span>Status</span><span>Actions</span>
              </div>
              {invoices.map(inv => (
                <div key={inv.id} className="grid grid-cols-5 px-4 py-3 border-b border-white/4 hover:bg-white/3 items-center">
                  <div>
                    <div className="text-white text-xs">{inv.customers?.full_name}</div>
                    <div className="text-white/30 text-xs">{inv.customers?.email}</div>
                  </div>
                  <span className="text-white text-xs font-medium">${inv.amount}</span>
                  <span className="text-white/40 text-xs">{inv.due_date}</span>
                  <span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      inv.status === 'paid' ? 'bg-[#1D9E75]/15 text-[#1D9E75]' :
                      inv.status === 'overdue' ? 'bg-red-500/15 text-red-400' :
                      'bg-amber-500/15 text-amber-400'
                    }`}>{inv.status}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {inv.status !== 'paid' && (
                      <button onClick={() => updateStatus(inv.id, 'paid')} className="text-[#1D9E75] text-xs hover:opacity-80">
                        Mark paid
                      </button>
                    )}
                    {inv.status === 'pending' && (
                      <button onClick={() => updateStatus(inv.id, 'overdue')} className="text-amber-400 text-xs hover:opacity-80">
                        Overdue
                      </button>
                    )}
                    <button onClick={() => deleteInvoice(inv.id)} className="text-white/20 hover:text-red-400 text-xs transition-colors">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}