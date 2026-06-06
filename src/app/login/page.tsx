'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#111110] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-9 h-9 bg-[#1D9E75] rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M2 9 Q5 4 8 7 Q11 10 13 6 Q14 4 15 5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M2 12 Q5 8 8 10 Q11 13 13 9 Q14 7 15 8" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">
            Biz<span className="text-[#1D9E75]">Flow</span>
          </span>
        </div>

        <div className="bg-[#1A1A18] border border-white/[0.08] rounded-2xl p-8">
          <h1 className="text-white font-semibold text-lg mb-1 tracking-tight">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-white/40 text-sm mb-7">
            {isSignUp ? 'Start managing your SaaS business' : 'Sign in to your BizFlow account'}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-white/50 text-xs font-medium mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-[#1D9E75]/60 transition-all"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-[#1D9E75]/60 transition-all"
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
              />
            </div>
          </div>

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full mt-6 bg-[#1D9E75] hover:bg-[#18875F] disabled:opacity-50 text-white font-semibold text-sm py-3.5 rounded-xl transition-all"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>

          <p className="text-center text-white/30 text-sm mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-[#1D9E75] font-medium">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        <p className="text-center text-white/15 text-xs mt-6">
          © 2026 BizFlow · Built for SaaS founders worldwide
        </p>
      </div>
    </div>
  )
}