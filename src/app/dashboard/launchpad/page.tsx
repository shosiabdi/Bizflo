'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LaunchpadPage() {
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)
  const [webhookKey, setWebhookKey] = useState<string>('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('webhook_key')
        .eq('id', user.id)
        .single()

      if (profile?.webhook_key) setWebhookKey(profile.webhook_key)
    }
    getUser()
  }, [])

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bizflow.app'

  const claudePrompt = `I want to build a SaaS web application. Here is my idea: [describe your idea here].

Please build me a complete working web app with:
- A clean modern UI that looks professional
- User authentication (login and signup)
- The core feature of my product
- A dashboard for users to manage their account
- Mobile responsive design

Use Next.js, Tailwind CSS, and Supabase for the database.
Give me all the code files I need step by step, starting with the project setup.`

  const connectPrompt = `I have a SaaS application and I want to connect it to BizFlow to automatically manage my customers, invoices and emails.

Please add this webhook to my code so it fires automatically every time a new user signs up successfully:

fetch('${appUrl}/api/webhook/${webhookKey}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'user.created',
    email: user.email,
    name: user.name || user.email,
    plan: 'starter',
    amount: 25
  })
})

Also add this when a payment is received:

fetch('${appUrl}/api/webhook/${webhookKey}', {
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'payment.received',
    email: user.email,
    amount: paymentAmount
  })
})

Find the right places in my code and add these calls there. Do not break anything else. Show me exactly what changed.

Here is my current code: [paste your code here]`

  const steps = [
    {
      num: '01',
      emoji: '💡',
      title: 'Define your SaaS idea',
      color: '#1D9E75',
      bg: 'rgba(29,158,117,0.08)',
      border: 'rgba(29,158,117,0.15)',
      content: (
        <div className="space-y-3">
          <p className="text-white/50 text-xs leading-relaxed">Before building anything — answer these three questions. They define your entire product.</p>
          {[
            { q: 'Who is your customer?', a: 'Be specific. "SaaS founders" is better than "businesses"' },
            { q: 'What problem do they have?', a: 'One painful, specific problem. Not five general ones.' },
            { q: 'How does your product fix it?', a: "In one sentence. If you can't say it simply — simplify the product." },
          ].map((item, i) => (
            <div key={i} className="bg-black/20 rounded-lg p-3">
              <div className="text-white text-xs font-medium mb-1">{item.q}</div>
              <div className="text-white/30 text-xs">{item.a}</div>
            </div>
          ))}
        </div>
      )
    },
    {
      num: '02',
      emoji: '🤖',
      title: 'Build your product with Claude AI',
      color: '#534AB7',
      bg: 'rgba(83,74,183,0.08)',
      border: 'rgba(83,74,183,0.15)',
      content: (
        <div className="space-y-3">
          <p className="text-white/50 text-xs leading-relaxed">Go to <strong className="text-white">claude.ai</strong> → paste this prompt → describe your idea where it says to → Claude builds your entire product.</p>
          <div className="relative">
            <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-white/50 leading-relaxed whitespace-pre-wrap">{claudePrompt}</div>
            <button
              onClick={() => copy(claudePrompt, 'claude')}
              className="absolute top-3 right-3 bg-[#534AB7] text-white text-xs px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              {copied === 'claude' ? '✓ Copied!' : 'Copy prompt'}
            </button>
          </div>
          <div className="bg-[#534AB7]/10 border border-[#534AB7]/20 rounded-lg p-3">
            <p className="text-[#AFA9EC] text-xs">💡 Be as specific as possible about your idea — the more detail you give Claude, the better the product it builds.</p>
          </div>
        </div>
      )
    },
    {
      num: '03',
      emoji: '🔌',
      title: 'Connect your product to BizFlow',
      color: '#BA7517',
      bg: 'rgba(186,117,23,0.08)',
      border: 'rgba(186,117,23,0.15)',
      content: (
        <div className="space-y-3">
          <p className="text-white/50 text-xs leading-relaxed">Once Claude has built your product — go back to Claude, paste your code AND this prompt. Claude will connect everything automatically.</p>

          <div className="bg-[#BA7517]/10 border border-[#BA7517]/20 rounded-lg p-3 mb-2">
            <p className="text-[#FAC775] text-xs font-medium mb-1">🔑 Your unique BizFlow key is already inside this prompt</p>
            <p className="text-[#FAC775]/60 text-xs">Just copy → paste into Claude → paste your code at the bottom → done</p>
          </div>

          <div className="relative">
            <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-white/50 leading-relaxed whitespace-pre-wrap">{connectPrompt}</div>
            <button
              onClick={() => copy(connectPrompt, 'connect')}
              className="absolute top-3 right-3 bg-[#BA7517] text-white text-xs px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              {copied === 'connect' ? '✓ Copied!' : 'Copy prompt'}
            </button>
          </div>

          <div className="bg-black/20 rounded-lg p-3">
            <p className="text-white text-xs font-medium mb-2">After connecting — every time someone signs up on your product:</p>
            {[
              '✅ They appear in your BizFlow customers list automatically',
              '✅ Their first invoice is created automatically',
              '✅ They receive a welcome email automatically',
            ].map((item, i) => (
              <p key={i} className="text-white/40 text-xs mb-1">{item}</p>
            ))}
          </div>
        </div>
      )
    },
    {
      num: '04',
      emoji: '💰',
      title: 'Start collecting payments',
      color: '#185FA5',
      bg: 'rgba(24,95,165,0.08)',
      border: 'rgba(24,95,165,0.15)',
      content: (
        <div className="space-y-3">
          <p className="text-white/50 text-xs leading-relaxed">BizFlow handles invoicing automatically. Here is the full payment flow:</p>
          {[
            'Customer signs up → Welcome email sent instantly',
            'Billing date hits → Invoice email sent with Pay Now button',
            'Customer pays → Invoice marked paid, next cycle starts',
            'Not paid after 3 days → Reminder email fires automatically',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-black/20 rounded-lg p-3">
              <div className="w-5 h-5 rounded-full bg-[#185FA5] flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">{i + 1}</div>
              <div className="text-white/50 text-xs leading-relaxed">{item}</div>
            </div>
          ))}
        </div>
      )
    },
    {
      num: '05',
      emoji: '📈',
      title: 'Get your first customers',
      color: '#993C1D',
      bg: 'rgba(153,60,29,0.08)',
      border: 'rgba(153,60,29,0.15)',
      content: (
        <div className="space-y-3">
          <p className="text-white/50 text-xs leading-relaxed">The fastest path to your first 10 customers — no ads needed.</p>
          {[
            { platform: 'Reddit', action: 'Post in r/SaaS and r/startups — genuine "I built this" posts work best' },
            { platform: 'LinkedIn', action: 'Tell your founder story 3x per week — personal posts get 10x more reach' },
            { platform: 'Twitter/X', action: 'Search "HubSpot too expensive" and DM everyone who shows up' },
            { platform: 'Product Hunt', action: 'Launch your product — one good launch = 500+ signups in a day' },
            { platform: 'Partnerships', action: 'Find one influencer — offer 40% recurring commission forever' },
          ].map(item => (
            <div key={item.platform} className="flex items-start gap-3 bg-black/20 rounded-lg p-3">
              <div className="text-white text-xs font-medium w-20 flex-shrink-0">{item.platform}</div>
              <div className="text-white/40 text-xs leading-relaxed">{item.action}</div>
            </div>
          ))}
          <button
            onClick={() => router.push('/dashboard/grow')}
            className="w-full bg-[#993C1D]/20 border border-[#993C1D]/30 text-[#F0997B] text-xs font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            View full growth playbook in Grow →
          </button>
        </div>
      )
    }
  ]

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
            { label: '🚀 Launchpad', href: '/dashboard/launchpad', active: true },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Customers', href: '/dashboard/customers' },
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
        <div className="px-6 py-4 border-b border-white/6">
          <h1 className="text-white font-medium text-sm">🚀 Launchpad</h1>
          <p className="text-white/30 text-xs mt-0.5">Your step by step guide from idea to paying customers</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl flex flex-col gap-4">
            {steps.map(step => (
              <div
                key={step.num}
                style={{ background: step.bg, border: `1px solid ${step.border}` }}
                className="rounded-xl overflow-hidden"
              >
                <div className="px-5 py-4 border-b" style={{ borderColor: step.border }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{step.emoji}</span>
                    <div>
                      <div className="text-xs font-medium mb-0.5" style={{ color: step.color }}>Step {step.num}</div>
                      <div className="text-white font-medium text-sm">{step.title}</div>
                    </div>
                  </div>
                </div>
                <div className="p-5">{step.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}