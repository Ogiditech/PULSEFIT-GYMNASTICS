import { AnimatePresence } from 'framer-motion'
import { Component, useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { PROTECTED_ROUTES, useApp } from './context/AppContext'
import { PulseMark } from './components/Logo'
import { Login, Signup, rememberNext } from './pages/Auth'
import { BottomNav, Footer, Sidebar, TopBar } from './components/Shell'
import Toasts from './components/Toasts'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import LiveWorkout from './pages/LiveWorkout'
import Progress from './pages/Progress'
import Classes from './pages/Classes'
import Profile from './pages/Profile'

const PAGES = {
  dashboard: Dashboard,
  library: Library,
  workout: LiveWorkout,
  progress: Progress,
  classes: Classes,
  profile: Profile,
}

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-ember/15 text-ember">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-2xl font-bold">Whoops — we dropped the bar.</h2>
        <p className="mt-2 text-muted">
          Something went wrong loading this screen. Your progress is safe. Give it another rep?
        </p>
        <button className="btn-primary mt-6" onClick={() => this.setState({ error: null })}>
          <RotateCcw size={18} /> Try again
        </button>
      </div>
    )
  }
}

function BootSplash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-4">
        <PulseMark size={56} />
        <div className="h-1 w-32 overflow-hidden rounded-full bg-line/10">
          <div className="skeleton h-full w-full !rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { route, user, authLoading, navigate } = useApp()
  const needsLogin = PROTECTED_ROUTES.includes(route) && !user
  const authPage = route === 'login' || route === 'signup'

  useEffect(() => {
    if (authLoading) return
    if (needsLogin) {
      rememberNext(route)
      navigate('login')
    } else if (authPage && user) {
      navigate('dashboard')
    }
  }, [authLoading, needsLogin, authPage, user, route, navigate])

  if (route === 'home' || authPage) {
    const Screen = route === 'home' ? Landing : route === 'login' ? Login : Signup
    return (
      <>
        <Screen />
        <Toasts />
      </>
    )
  }

  if (authLoading || needsLogin) return <BootSplash />

  const PageComponent = PAGES[route]
  return (
    <div className="relative flex min-h-dvh">
      <div className="pointer-events-none fixed inset-0 bg-aurora" />
      <div className="pointer-events-none fixed inset-0 bg-grid" />
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar />
        <ErrorBoundary key={route}>
          <AnimatePresence mode="wait">
            <PageComponent key={route} />
          </AnimatePresence>
        </ErrorBoundary>
        <div className="mt-auto">
          <Footer compact />
        </div>
      </div>
      <BottomNav />
      <Toasts />
    </div>
  )
}
