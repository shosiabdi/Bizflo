'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function GrowPage() {
  const router = useRouter()

  const sections = [
    {
      id: 'linkedin',
      emoji: '💼',
      title: 'LinkedIn',
      color: '#185FA5',
      bg: 'rgba(24,95,165,0.08)',
      border: 'rgba(24,95,165,0.15)',
      items: [
        { label: 'Best posting times', value: '8am–10am and 5pm–7pm weekdays' },
        { label: 'Post frequency', value: '3–5 times per week' },
        { label: 'Best days', value: 'Tuesday, Wednesday, Thursday' },
        { label: 'Content mix', value: '40% founder story · 30% problem posts · 30% engagement questions' },
        { label: 'Link rule', value: 'Always put your link in the COMMENTS — never in the post body' },
        { label: 'Key hashtags', value: '#BuildInPublic #SaaS #SaaSFounder #Startups #B2B #MRR #IndieHackers #Entrepreneur #ProductHunt #FounderLife' },
        { label: 'Pro tip', value: 'Reply to every comment in the first 60 minutes — the algorithm rewards early engagement' },
      ]
    },
    {
      id: 'reddit',
      emoji: '🔴',
      title: 'Reddit',
      color: '#FF4500',
      bg: 'rgba(255,69,0,0.08)',
      border: 'rgba(255,69,0,0.15)',
      items: [
        { label: 'Best subreddits', value: 'r/SaaS · r/startups · r/Entrepreneur · r/indiehackers · r/webdev' },
        { label: 'Best posting times', value: '9am–12pm EST on weekdays' },
        { label: 'Post frequency', value: '1 post per subreddit per week — do not spam' },
        { label: 'What works', value: '"I built this" posts asking for genuine feedback — never pitch directly' },
        { label: 'What kills you', value: 'Sounding salesy or dropping links without context' },
        { label: 'Title formula', value: '"I built [PRODUCT] to fix [PROBLEM] — looking for honest feedback"' },
        { label: 'Pro tip', value: 'Reply to every comment within 30 minutes — Reddit rewards active threads' },
      ]
    },
    {
      id: 'facebook',
      emoji: '📘',
      title: 'Facebook Groups',
      color: '#1877F2',
      bg: 'rgba(24,119,242,0.08)',
      border: 'rgba(24,119,242,0.15)',
      items: [
        { label: 'Best groups', value: 'SaaS founders · Entrepreneur groups · Online business · Digital nomads · Startup communities' },
        { label: 'Best posting times', value: '12pm–3pm your local time' },
        { label: 'Post frequency', value: 'Once per group per week — rotate between groups daily' },
        { label: 'Best post type', value: 'Engagement post — ask a question, get comments, reply to all, drop link naturally' },
        { label: 'Hashtags to use', value: '#SaaS #Entrepreneur #B2B #BuildInPublic #SaaSFounder #OnlineBusiness #Startups' },
        { label: 'Link rule', value: 'Put your link IN the post — unlike LinkedIn, Facebook shows it fine' },
        { label: 'Pro tip', value: 'Join 10+ groups and rotate — never post the same thing to the same group twice in a week' },
      ]
    },
    {
      id: 'twitter',
      emoji: '🐦',
      title: 'Twitter / X',
      color: '#000000',
      bg: 'rgba(255,255,255,0.04)',
      border: 'rgba(255,255,255,0.08)',
      items: [
        { label: 'Best posting times', value: '8am–10am and 6pm–9pm EST' },
        { label: 'Post frequency', value: '2–3 tweets per day' },
        { label: 'Content mix', value: '50% insights · 30% build in public updates · 20% engagement' },
        { label: 'Warm lead hack', value: 'Search "HubSpot too expensive" · "Mailchimp alternative" · "hate QuickBooks" — DM everyone who shows up' },
        { label: 'Key hashtags', value: '#SaaS #BuildInPublic #IndieHackers #Startups #SaaSFounder #MRR' },
        { label: 'Thread rule', value: 'Threads get 10x more reach than single tweets — turn every post into a thread' },
        { label: 'Pro tip', value: 'Reply to big accounts in your niche daily — their followers will find you' },
      ]
    },
    {
      id: 'producthunt',
      emoji: '🚀',
      title: 'Product Hunt',
      color: '#DA552F',
      bg: 'rgba(218,85,47,0.08)',
      border: 'rgba(218,85,47,0.15)',
      items: [
        { label: 'Best launch day', value: 'Tuesday or Wednesday — highest traffic days' },
        { label: 'Launch time', value: '12:01am PST — start the day with maximum time for upvotes' },
        { label: 'Prep time needed', value: 'At least 2 weeks of preparation before launch' },
        { label: 'What you need', value: 'Tagline · Description · Screenshots · Demo video · First comment ready' },
        { label: 'Upvote strategy', value: 'Build a list of 50 people who will upvote on launch day — message them the day before' },
        { label: 'First comment', value: 'Post a personal story in the first comment explaining why you built this — do it within the first minute of launch' },
        { label: 'Pro tip', value: 'A top 5 Product Hunt launch can get you 500+ signups in 24 hours — treat it like a product launch event' },
      ]
    },
    {
      id: 'directories',
      emoji: '📂',
      title: 'Directories',
      color: '#1D9E75',
      bg: 'rgba(29,158,117,0.08)',
      border: 'rgba(29,158,117,0.15)',
      items: [
        { label: 'Submit to these', value: 'Product Hunt · AlternativeTo · G2 · Capterra · SaaSHub · Futurepedia · There\'s An AI For That · GetApp' },
        { label: 'Time investment', value: '2–3 hours total — one time setup, permanent traffic forever' },
        { label: 'AlternativeTo tip', value: 'List as alternative to HubSpot, QuickBooks, Mailchimp, Salesforce — people searching those will find you' },
        { label: 'G2 tip', value: 'Ask your first 5 customers to leave a review — even 3 reviews puts you on the map' },
        { label: 'Best description', value: 'Lead with the problem you solve, not the features — "Stop paying $1,000/mo for 3 tools" beats "All-in-one CRM"' },
        { label: 'Pro tip', value: 'Submit to all directories in week 1 — they take time to index and show up in Google' },
      ]
    },
    {
      id: 'partnerships',
      emoji: '🤝',
      title: 'Partnerships',
      color: '#534AB7',
      bg: 'rgba(83,74,183,0.08)',
      border: 'rgba(83,74,183,0.15)',
      items: [
        { label: 'Target influencer size', value: '5k–50k followers — big enough to matter, small enough to say yes' },
        { label: 'Best platforms', value: 'LinkedIn and newsletters — highest quality SaaS audience' },
        { label: 'Commission to offer', value: '40% recurring forever — they post once, earn every month' },
        { label: 'What to offer', value: 'Free lifetime access + 40% recurring commission + featured on your site' },
        { label: 'Skool communities', value: 'Find Skool communities with SaaS founders — one post to 5,000 engaged members converts better than cold ads' },
        { label: 'Rev share deal', value: 'Offer community admins 20–30% of revenue from their members — they become your sales team' },
        { label: 'Pro tip', value: 'One right partnership beats months of manual outreach — focus on finding that one person who already has your audience' },
      ]
    },
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
            { label: '🚀 Launchpad', href: '/dashboard/launchpad' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Customers', href: '/dashboard/customers' },
            { label: 'Invoices', href: '/dashboard/invoices' },
            { label: 'Email', href: '/dashboard/email' },
            { label: 'Grow', href: '/dashboard/grow', active: true },
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
          <h1 className="text-white font-medium text-sm">📈 Grow</h1>
          <p className="text-white/30 text-xs mt-0.5">Your complete marketing playbook — channels, timing, hashtags and strategy</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {sections.map(section => (
              <div
                key={section.id}
                style={{ background: section.bg, border: `1px solid ${section.border}` }}
                className="rounded-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: section.border }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{section.emoji}</span>
                    <span className="text-white font-medium text-sm">{section.title}</span>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  {section.items.map((item, i) => (
                    <div key={i} className="bg-black/20 rounded-lg p-3">
                      <div className="text-white/50 text-xs mb-1">{item.label}</div>
                      <div className="text-white text-xs leading-relaxed">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}