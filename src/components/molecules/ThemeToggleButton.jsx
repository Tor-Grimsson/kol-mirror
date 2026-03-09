import { useState, useEffect } from 'react'
import Icon from '../icons/Icon'

/**
 * ThemeToggleButton Component
 *
 * Simple icon button that toggles between light and dark mode
 * Sets data-theme attribute on document root and persists to localStorage
 */
export default function ThemeToggleButton({ className = '' }) {
  const [isDark, setIsDark] = useState(false)

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const initialIsDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setIsDark(initialIsDark)

    document.documentElement.setAttribute('data-theme', initialIsDark ? 'dark' : 'light')
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    document.documentElement.setAttribute('data-theme', newIsDark ? 'dark' : 'light')
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`kol-btn kol-btn-control ${className}`}
      style={{
        width: '48px',
        height: '48px',
        padding: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          transition: 'transform 0.3s ease',
          transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)'
        }}
      >
        <Icon name="theme-toggle" size={24} />
      </span>
    </button>
  )
}
