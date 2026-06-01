'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useCRMTheme } from '@/app/providers'

export function ThemeToggle() {
  const { theme, toggleTheme } = useCRMTheme()

  const isDark = theme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      className="cf-icon-button"
      onClick={toggleTheme}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}