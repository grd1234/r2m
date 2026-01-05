'use client'

import { useState, forwardRef } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input } from './input'
import { cn } from '@/lib/utils'

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showIcon?: boolean
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showIcon = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="relative">
        {showIcon && (
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
        )}
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn(
            showIcon ? 'pl-12' : '',
            'pr-12',
            className
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none z-10"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
