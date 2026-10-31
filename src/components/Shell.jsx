import { motion } from 'framer-motion'
import { CalendarDays, Dumbbell, Flame, Heart, LayoutDashboard, LogIn, LogOut, Play, TrendingUp, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

export const NAV = [
  { id: 'dashboard', label: 'Dashboard', short: 'Home', Icon: LayoutDashboard },
  { id: 'library', label: 'Workout Library', short: 'Library', Icon: Dumbbell },
  { id: 'workout', label: 'Live Workout', short: 'Train', Icon: Play },
  { id: 'progress', label: 'Progress', short: 'Progress', Icon: TrendingUp },
  { id: 'classes', label: 'Class Booking', short: 'Classes', Icon: CalendarDays },
  { id: 'profile', label: 'Profile', short: 'Profile', Icon: UserRound },
]

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts.at(-1)[0] : '')).toUpperCase() || '🙂'
}

function Avatar({ size = 'h-10 w-10', text = 'text-sm' }) {
  const { user } = useApp()
  return (
    <span className={`relative grid ${size} shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#C6FF3D] to-[#22E4FF] font-display font-bold text-[#0A0D12] ${text}`}>
      {initials(user?.full_name)}
    </span>
  )
}

function LogoutButton({ className = '' }) {
  const { logout } = useApp()
  return (
    <button
      onClick={logout}
      aria-label="Log out"
      title="Log out"
      className={`grid h-10 w-10 place-items-center rounded-2xl border border-line/10 bg-line/5 text-muted transition hover:border-ember/30 hover:bg-ember/10 hover:text-ember ${className}`}
    >
      <LogOut size={17} />
    </button>
  )
}

function LoginLinks({ compact = false }) {
  const { navigate } = useApp()
  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'w-full'}`}>
      <button onClick={() => navigate('login')} className={`btn-ghost !py-2.5 text-sm ${compact ? '' : 'flex-1'}`}>
        <LogIn size={16} /> Log in
      </button>
      {!compact && (
        <button onClick={() => navigate('signup')} className="btn-primary flex-1 !py-2.5 text-sm">
          Sign up
        </button>
      )}
    </div>
  )
}

export function Sidebar() {
  const { route, navigate, user, userStats } = useApp()
  const streak = userStats?.streak ?? 0
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line/10 bg-surface/40 p-5 backdrop-blur-xl md:flex">
      <button onClick={() => navigate('home')} className="mb-10 mt-1 self-start" aria-label="PulseFit home">
        <Logo size={34} />
      </button>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ id, label, Icon }) => {
          const active = route === id
          return (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active ? 'text-ink' : 'text-muted hover:bg-line/5 hover:text-ink'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-2xl border border-lime/25 bg-lime/10"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <Icon size={19} className={`relative ${active ? 'text-lime' : ''}`} />
              <span className="relative">{label}</span>
              {id === 'workout' && (
                <span className="relative ml-auto h-2 w-2 rounded-full bg-lime shadow-glow" />
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto space-y-4">
        {user ? (
          <>
            <div className="glass !rounded-2xl p-4">
              <div className="flex items-center gap-2 text-ember">
                <Flame size={18} className="fill-ember/30" />
                <span className="font-display text-lg font-bold">{streak}-day streak</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {streak ? 'Train today to keep it alive.' : 'Finish a workout to start one.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('profile')} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 text-left hover:bg-line/5">
                <Avatar />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{user.full_name}</span>
                  <span className="block truncate text-xs text-muted">{user.email}</span>
                </span>
              </button>
              <ThemeToggle />
              <LogoutButton />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <LoginLinks />
            <ThemeToggle />
          </div>
        )}
      </div>
    </aside>
  )
}

export function TopBar() {
  const { navigate, user } = useApp()
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-line/10 bg-bg/70 px-4 py-3 backdrop-blur-xl md:hidden">
      <button onClick={() => navigate('home')} aria-label="PulseFit home" className="flex min-h-10 shrink-0 items-center">
        <Logo size={28} />
      </button>
      <div className="flex min-w-0 items-center gap-2">
        {user ? (
          <>
            <button onClick={() => navigate('profile')} aria-label="Profile" className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-semibold">{user.full_name.split(' ')[0]}</span>
              <Avatar text="text-xs" />
            </button>
            <ThemeToggle />
            <LogoutButton />
          </>
        ) : (
          <>
            <ThemeToggle />
            <LoginLinks compact />
          </>
        )}
      </div>
    </header>
  )
}

export function BottomNav() {
  const { route, navigate } = useApp()
  const items = NAV.filter((n) => n.id !== 'profile')
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line/10 bg-bg/80 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-end justify-around px-2 pt-2">
        {items.map(({ id, short, Icon }) => {
          const active = route === id
          if (id === 'workout') {
            return (
              <button key={id} onClick={() => navigate(id)} className="-mt-7 flex flex-col items-center gap-1 pb-2" aria-label="Start live workout">
                <motion.span
                  whileTap={{ scale: 0.9 }}
                  className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#C6FF3D] to-[#22E4FF] text-[#0A0D12] shadow-glow ring-4 ring-bg"
                >
                  <Icon size={24} className="fill-current" />
                </motion.span>
                <span className={`text-[11px] font-semibold ${active ? 'text-lime' : 'text-muted'}`}>{short}</span>
              </button>
            )
          }
          return (
            <button key={id} onClick={() => navigate(id)} className="relative flex w-16 flex-col items-center gap-1 pb-2 pt-1">
              {active && (
                <motion.span layoutId="bottom-active" className="absolute -top-2 h-1 w-8 rounded-full bg-lime shadow-glow" />
              )}
              <Icon size={22} className={active ? 'text-lime' : 'text-muted'} />
              <span className={`text-[11px] font-semibold ${active ? 'text-ink' : 'text-muted'}`}>{short}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function Footer({ compact = false }) {
  const { navigate } = useApp()
  return (
    <footer className={`border-t border-line/10 ${compact ? 'mb-24 md:mb-0' : ''}`}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted md:flex-row md:px-8">
        <button onClick={() => navigate('home')} aria-label="PulseFit home" className="flex min-h-10 items-center">
          <Logo size={26} />
        </button>
        <p className="text-center">
          © {new Date().getFullYear()} PulseFit. Built with{' '}
          <Heart size={14} className="inline -mt-0.5 fill-ember text-ember" /> for people who show up.
        </p>
        <div className="flex gap-5">
          <a href="#/classes" className="py-2.5 hover:text-ink">Classes</a>
          <a href="#/library" className="py-2.5 hover:text-ink">Workouts</a>
          <a href="#/profile" className="py-2.5 hover:text-ink">Account</a>
        </div>
      </div>
    </footer>
  )
}

export { Avatar }
