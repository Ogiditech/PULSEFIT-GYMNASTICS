import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const AppContext = createContext(null)

export const ROUTES = ['home', 'login', 'signup', 'dashboard', 'library', 'workout', 'progress', 'classes', 'profile']
export const PROTECTED_ROUTES = ['dashboard', 'library', 'workout', 'profile']

function readRoute() {
  const r = window.location.hash.replace('#/', '').replace('#', '')
  return ROUTES.includes(r) ? r : 'home'
}

function readStored(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable — state just won't persist */
  }
}

export function AppProvider({ children }) {
  const [route, setRoute] = useState(readRoute)
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )
  const [toasts, setToasts] = useState([])
  const [bookings, setBookings] = useState(() => readStored('pulsefit-bookings', []))
  const [auth, setAuth] = useState({ user: null, stats: null, loading: true, error: null })

  const refreshUser = useCallback(async () => {
    try {
      const d = await api('/auth/me')
      setAuth({ user: d.user, stats: d.stats ?? null, loading: false, error: null })
      return d.user
    } catch (error) {
      setAuth({ user: null, stats: null, loading: false, error })
      return null
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  useEffect(() => {
    const onHash = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#080A0E' : '#F3F5F0')
    try {
      localStorage.setItem('pulsefit-theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => writeStored('pulsefit-bookings', bookings), [bookings])

  const navigate = useCallback((to) => {
    window.location.hash = `/${to}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const toast = useCallback((t) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((all) => [...all, { id, type: 'success', ...t }])
    setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), t.duration ?? 3800)
  }, [])

  const dismissToast = useCallback((id) => setToasts((all) => all.filter((x) => x.id !== id)), [])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      /* the cookie is httpOnly; if the server is down we still drop local state */
    }
    setAuth({ user: null, stats: null, loading: false, error: null })
    toast({ type: 'info', title: 'Logged out', message: 'See you at your next session 👋' })
    navigate('home')
  }, [toast, navigate])

  const value = useMemo(
    () => ({
      route,
      navigate,
      theme,
      toggleTheme,
      toasts,
      toast,
      dismissToast,
      bookings,
      setBookings,
      user: auth.user,
      userStats: auth.stats,
      authLoading: auth.loading,
      authError: auth.error,
      refreshUser,
      logout,
    }),
    [route, navigate, theme, toggleTheme, toasts, toast, dismissToast, bookings, auth, refreshUser, logout],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}

// Recharts needs concrete colors, so resolve the theme tokens here.
// `series` is the categorical palette for multi-line charts, validated per theme
// (lightness band, CVD separation, contrast) against the card surface.
export function useChartColors() {
  const { theme } = useApp()
  return theme === 'dark'
    ? {
        lime: '#C6FF3D', cyan: '#22E4FF', grid: 'rgba(255,255,255,0.06)', axis: '#94A0AF', surface: '#161B23',
        series: ['#6E9F10', '#1A9FC0', '#9B7BF5'],
      }
    : {
        lime: '#58A000', cyan: '#0891B2', grid: 'rgba(15,23,42,0.07)', axis: '#5C6674', surface: '#FFFFFF',
        series: ['#58A000', '#0891B2', '#7C3AED'],
      }
}
