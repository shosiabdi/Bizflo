'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile?.subscribed) {
        router.push('/pricing')
        return
      }

      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .eq('owner_id', user.id)

      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('owner_id', user.id)

      setCustomers(customers || [])
      setInvoices(invoices || [])
      setLoading(false)
    }
    getUser()
  }, [])

  const totalRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0)

  const overdueCount = invoices.filter(i => i.status === 'overdue').length

  if (loading) return (
    <div className="min-h-screen bg-[#111110] flex items-center justify-center">
      <div className="text-white/40 text-sm">Loading BizFlow...</div>
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
            { label: 'Dashboard', href: '/dashboard', active: true },
            { label: 'Customers', href: '/dashboard/customers' },
            { label: 'Invoices', href: '/dashboard/invoices' },
            { label: 'Email', href: '/dashboard/email' },
            { label: 'Grow', href: '/dashboard/grow' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors text-left ${
                item.active
                  ? 'bg-white/8 text-white font-medium'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/6">
          <div className="text-white/20 text-xs px-3 mb-2 truncate">{user?.email}</div>
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
          <span className="text-white font-medium text-sm">Dashboard</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-lg px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]"></div>
              <span className="text-white/40 text-xs">Synced</span>
            </div>
            <button
              onClick={() => router.push('/dashboard/customers')}
              className="bg-[#1D9E75] hover:opacity-90 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity"
            >
              + Add customer
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total customers', value: customers.length, change: 'All time', warn: false },
              { label: 'Revenue collected', value: `$${totalRevenue.toLocaleString()}`, change: 'Paid invoices', warn: false },
              { label: 'Unpaid invoices', value: invoices.filter(i => i.status === 'pending').length, change: `${overdueCount} overdue`, warn: overdueCount > 0 },
              { label: 'Active customers', value: customers.filter(c => c.status === 'active').length, change: 'Currently active', warn: false },
            ].map(stat => (
              <div key={stat.label} className="bg-white/4 border border-white/6 rounded-xl p-4">
                <div className="text-white/40 text-xs mb-2">{stat.label}</div>
                <div className="text-white text-2xl font-medium mb-1">{stat.value}</div>
                <div className={`text-xs ${stat.warn ? 'text-amber-400' : 'text-[#1D9E75]'}`}>{stat.change}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/4 border border-white/6 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                <h2 className="text-white text-sm font-medium">Recent customers</h2>
                <button onClick={() => router.push('/dashboard/customers')} className="text-[#1D9E75] text-xs hover:opacity-80">View all →</button>
              </div>
              {customers.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-white/20 text-sm mb-3">No customers yet</p>
                  <button onClick={() => router.push('/dashboard/customers')} className="bg-[#1D9E75] text-white text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90">Add first customer</button>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-4 text-white/30 text-xs font-medium px-4 py-2 border-b border-white/4">
                    <span>Name</span><span>Plan</span><span>Amount</span><span>Status</span>
                  </div>
                  {customers.slice(0, 5).map(c => (
                    <div key={c.id} className="grid grid-cols-4 px-4 py-2.5 hover:bg-white/3 items-center border-b border-white/4">
                      <span className="text-white text-xs truncate">{c.full_name}</span>
                      <span className="text-white/40 text-xs">{c.plan}</span>
                      <span className="text-white text-xs font-medium">${c.amount}/mo</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${c.status === 'active' ? 'bg-[#1D9E75]/15 text-[#1D9E75]' : 'bg-white/8 text-white/40'}`}>{c.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/4 border border-white/6 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                <h2 className="text-white text-sm font-medium">Recent invoices</h2>
                <button onClick={() => router.push('/dashboard/invoices')} className="text-[#1D9E75] text-xs hover:opacity-80">View all →</button>
              </div>
              {invoices.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-white/20 text-sm mb-3">No invoices yet</p>
                  <button onClick={() => router.push('/dashboard/invoices')} className="bg-[#1D9E75] text-white text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90">Create invoice</button>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-4 text-white/30 text-xs font-medium px-4 py-2 border-b border-white/4">
                    <span>Invoice</span><span>Amount</span><span>Due</span><span>Status</span>
                  </div>
                  {invoices.slice(0, 5).map(inv => (
                    <div key={inv.id} className="grid grid-cols-4 px-4 py-2.5 hover:bg-white/3 items-center border-b border-white/4">
                      <span className="text-white/40 text-xs">#{inv.id.slice(0, 6)}</span>
                      <span className="text-white text-xs font-medium">${inv.amount}</span>
                      <span className="text-white/40 text-xs">{inv.due_date}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${
                        inv.status === 'paid' ? 'bg-[#1D9E75]/15 text-[#1D9E75]' :
                        inv.status === 'overdue' ? 'bg-red-500/15 text-red-400' :
                        'bg-amber-500/15 text-amber-400'
                      }`}>{inv.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/4 border border-white/6 rounded-xl p-4">
            <h2 className="text-white text-sm font-medium mb-3">Quick actions</h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Add customer', icon: '👥', href: '/dashboard/customers' },
                { label: 'New invoice', icon: '📄', href: '/dashboard/invoices' },
                { label: 'Send email', icon: '✉️', href: '/dashboard/email' },
                { label: 'Launchpad', icon: '🚀', href: '/dashboard/launchpad' },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 transition-all"
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-white/40 text-xs">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}