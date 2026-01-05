'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/useUserStore'
import { createClient } from '@/lib/supabase/client'

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser } = useUserStore()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    // Force a hard refresh to clear all state
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-blue-500/20">
      <div className="max-w-[1600px] mx-auto px-12">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white rounded-md px-2 py-1">
              <Image
                src="/infyra-logo.png"
                alt="Infyra.ai"
                width={120}
                height={36}
                className="h-8 w-auto"
                priority
              />
            </div>
            <div className="h-8 w-px bg-blue-400/30" />
            <span className="text-xl font-bold text-white">
              R2M Marketplace
            </span>
          </Link>

          {/* Navigation Links */}
          {!user ? (
            <div className="flex items-center gap-8 ml-auto mr-8">
              <Link
                href="/how-it-works"
                className={`text-base font-medium transition-colors hover:text-blue-400 ${
                  pathname === '/how-it-works'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-blue-100'
                }`}
              >
                How It Works
              </Link>
              <Link
                href="/pricing"
                className={`text-base font-medium transition-colors hover:text-blue-400 ${
                  pathname === '/pricing'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-blue-100'
                }`}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className={`text-base font-medium transition-colors hover:text-blue-400 ${
                  pathname === '/about'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-blue-100'
                }`}
              >
                About
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-8 ml-auto mr-8">
              {/* Innovator Menu */}
              {user.user_type === 'startup' || user.user_type === 'tto' || user.user_type === 'innovation_hub' ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`text-base font-medium transition-colors hover:text-blue-400 ${
                      pathname === '/dashboard'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-blue-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/analysis/search"
                    className={`text-base font-medium transition-colors hover:text-blue-400 ${
                      pathname === '/analysis/search'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-blue-100'
                    }`}
                  >
                    Analyze Research
                  </Link>
                  <Link
                    href="/deals"
                    className={`text-base font-medium transition-colors hover:text-blue-400 ${
                      pathname === '/deals'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-blue-100'
                    }`}
                  >
                    My Deals
                  </Link>
                </>
              ) : (
                /* Investor Menu */
                <>
                  <Link
                    href="/dashboard"
                    className={`text-base font-medium transition-colors hover:text-blue-400 ${
                      pathname === '/dashboard'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-blue-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/marketplace"
                    className={`text-base font-medium transition-colors hover:text-blue-400 ${
                      pathname === '/marketplace' || pathname.startsWith('/marketplace/')
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-blue-100'
                    }`}
                  >
                    Browse Opportunities
                  </Link>
                  <Link
                    href="/deals"
                    className={`text-base font-medium transition-colors hover:text-blue-400 ${
                      pathname === '/deals'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-blue-100'
                    }`}
                  >
                    My Investments
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <div className="relative group">
                  <Button
                    variant="ghost"
                    className="h-12 px-6 text-base font-semibold text-blue-100 hover:text-white hover:bg-blue-500/20"
                  >
                    Login
                  </Button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link href="/login/innovator">
                      <div className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b">
                        <p className="font-semibold text-blue-900">Innovator</p>
                        <p className="text-xs text-gray-600">Fresh Graduates & Startups</p>
                      </div>
                    </Link>
                    <Link href="/login/investor">
                      <div className="px-4 py-3 hover:bg-cyan-50 cursor-pointer border-b">
                        <p className="font-semibold text-cyan-900">Investor</p>
                        <p className="text-xs text-gray-600">VCs & Corporate Partners</p>
                      </div>
                    </Link>
                    <Link href="/login/researcher">
                      <div className="px-4 py-3 hover:bg-emerald-50 rounded-b-lg cursor-pointer">
                        <p className="font-semibold text-emerald-900">Researcher</p>
                        <p className="text-xs text-gray-600">Academics & Scientists</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-base font-medium text-blue-200">
                  {user.full_name || user.email}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="h-12 px-6 text-base font-medium bg-transparent text-blue-100 hover:text-white border-blue-400/50 hover:border-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
