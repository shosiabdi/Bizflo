'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { supabase } from '../../lib/supabase'

declare global {
  interface Window { paypal: any }
}

export default function PricingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const [count, setCount] = useState(312)

  const plans = [
    {
      name: 'Starter',
      price: '$25',
      period: 'per month',
      users: 'Up to 200 customers',
      planId: 'P-2PS252714Y9934132NIR3WZA',
      containerId: 'paypal-starter',
      features: [
        'Customer dashboard',
        'Manual + webhook entry',
        'Automated invoicing',
        'Email communication',
        'Growth playbook access',
      ]
    },
    {
      name: 'Builder',
      price: '$75',
      period: 'per month',
      users: 'Up to 2,000 customers',
      planId: 'P-7F400699YY592245UNIR32AQ',
      containerId: 'paypal-builder',
      featured: true,
      features: [
        'Everything in Starter',
        'Claude AI build guides',
        'Advanced email automation',
        'Churn prevention flows',
        'Deal pipeline',
        'Priority support',
      ]
    },
    {
      name: 'Scale',
      price: '$120',
      period: 'per month',
      users: 'Unlimited customers',
      planId: 'P-1UE02096SY6439521NIR33GI',
      containerId: 'paypal-scale',
      features: [
        'Everything in Builder',
        'White-label invoices',
        '5 team seats',
        'API access',
        'Full ads playbook',
        'Dedicated support',
      ]
    }
  ]

  const renderPayPalButton = (plan: typeof plans[0]) => {
    if (!window.paypal) return
    const container = document.getElementById(plan.containerId)
    if (!container || container.children.length > 0) return

    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'black',
        layout: 'vertical',
        label: 'subscribe'
      },
      createSubscription: function(_: any, actions: any) {
        return actions.subscription.create({ plan_id: plan.planId })
      },
      onApprove: async function(data: any) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('profiles').update({
            plan: plan.name.toLowerCase(),
            subscription_id: data.subscriptionID,
            subscribed: true
          }).eq('id', user.id)
        }
        router.push('/dashboard')
      }
    }).render(`#${plan.containerId}`)
  }

  useEffect(() => {
    if (sdkReady) {
      plans.forEach(plan => renderPayPalButton(plan))
    }
  }, [sdkReady, selectedPlan])

  return (
    <>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=AXz0nVodlQTZ4lKeyeG73UhBZEvOmqwfZM1WocXEAhiiCXd9GROh7nVprNnM1_RLRHRBBwjzveCoySAF&vault=true&intent=subscription`}
        onLoad={() => setSdkReady(true)}
      />

      <div className="min-h-screen bg-[#111110]">

        {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1D9E75] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 9 Q5 4 8 7 Q11 10 13 6 Q14 4 15 5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M2 12 Q5 8 8 10 Q11 13 13 9 Q14 7 15 8" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Biz<span className="text-[#1D9E75]">Flow</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')} className="text-white/40 text-sm hover:text-white transition-colors">Sign in</button>
            <button onClick={() => router.push('/login')} className="bg-white/8 border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/12 transition-colors">Get started</button>
          </div>
        </nav>

        {/* Hero */}
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-full px-4 py-2 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse"></div>
            <span className="text-[#1D9E75] text-xs font-medium">Early access open — 3 months free on all plans</span>
          </div>

          <h1 className="text-white text-5xl font-semibold tracking-tight leading-tight mb-5">
            From idea to<br/><span className="text-[#1D9E75]">paying customers</span><br/>in one place
          </h1>

          <p className="text-white/40 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Use Claude AI to build your SaaS. Connect it to BizFlow. Get customers, collect payments, and grow — all from one dashboard.
          </p>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex">
              {['#E6F1FB', '#EEEDFE', '#EAF3DE', '#FAEEDA'].map((bg, i) => (
                <div key={i} style={{ background: bg, marginLeft: i > 0 ? '-8px' : '0' }} className="w-8 h-8 rounded-full border-2 border-[#111110]"></div>
              ))}
            </div>
            <span className="text-white/40 text-sm"><strong className="text-white">{count}</strong> founders already on the waitlist</span>
          </div>
        </div>

        {/* What is BizFlow */}
        <div className="max-w-4xl mx-auto px-6 mb-16">
          <div className="grid grid-cols-3 gap-4">
            {[
              { emoji: '🤖', title: 'Build with Claude AI', desc: 'Use our ready-made prompts to build your SaaS product with Claude AI. No coding knowledge needed.' },
              { emoji: '🔌', title: 'Connect in seconds', desc: 'Paste one code snippet into your product. Every customer and payment syncs to BizFlow automatically.' },
              { emoji: '📈', title: 'Grow with confidence', desc: 'Full growth playbook inside BizFlow — posts, DMs, ads, and strategies specific to your product.' },
            ].map(item => (
              <div key={item.title} className="bg-white/4 border border-white/6 rounded-xl p-5">
                <div className="text-2xl mb-3">{item.emoji}</div>
                <div className="text-white font-medium text-sm mb-2">{item.title}</div>
                <div className="text-white/40 text-xs leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="text-center mb-10">
            <h2 className="text-white text-3xl font-semibold tracking-tight mb-3">Simple, honest pricing</h2>
            <p className="text-white/40 text-sm">Start today. Cancel anytime. First 3 months free on all plans.</p>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl overflow-hidden relative ${
                  plan.featured
                    ? 'border-2 border-[#1D9E75]'
                    : 'border border-white/8 bg-white/3'
                }`}
                style={plan.featured ? { background: 'rgba(29,158,117,0.05)' } : {}}
              >
                {plan.featured && (
                  <div className="bg-[#1D9E75] text-white text-xs font-medium text-center py-2">
                    Most popular
                  </div>
                )}

                <div className="p-6">
                  <div className="text-white/50 text-xs font-medium mb-2">{plan.name}</div>
                  <div className="text-white text-4xl font-semibold tracking-tight mb-1">{plan.price}</div>
                  <div className="text-white/30 text-xs mb-2">{plan.period}</div>
                  <div className="text-[#1D9E75] text-xs font-medium mb-5">{plan.users}</div>

                  <ul className="flex flex-col gap-2 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-white/50">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#1D9E75]/20 flex items-center justify-center flex-shrink-0">
                          <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                            <path d="M1 3.5l2 2L6 1.5" stroke="#1D9E75" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div id={plan.containerId}></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-white/20 text-xs mt-8">
            © 2026 BizFlow · Built for SaaS founders worldwide · Cancel anytime
          </p>
        </div>
      </div>
    </>
  )
}