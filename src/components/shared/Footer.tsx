'use client'

import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-blue-500/20 py-12">
      <div className="max-w-[1600px] mx-auto px-12">
        {/* Powered By Infyra.ai - Centered */}
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm text-gray-400 mb-4 font-medium">
            Powered by
          </p>
          <div className="relative">
            <Image
              src="/logo_infyra_ai_withTextRight_Lowercase_i.png"
              alt="Infyra.ai"
              width={250}
              height={80}
              className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} R2M Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
