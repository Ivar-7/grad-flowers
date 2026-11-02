import { useContext } from 'react'
import { ThemeContext } from './theme.context'
import type { ThemeContextValue } from './theme.types'
import { AppError } from '../errors/app-error'

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new AppError({
      code: 'THEME_CONTEXT_MISSING',
      userMessage: 'Theme setting failed to load.',
      technicalMessage: 'useTheme must be used within a ThemeProvider',
      statusCode: 500,
      severity: 'warning',
    })
  }
  return context
}
