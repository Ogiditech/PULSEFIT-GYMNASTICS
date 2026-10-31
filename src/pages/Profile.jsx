import { motion } from 'framer-motion'
import {
  Bell,
  CalendarCheck,
  Crown,
  Dumbbell,
  Flame,
  Lock,
  LogOut,
  Medal,
  Moon,
  Rocket,
  Sunrise,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import AnimatedCounter from '../components/AnimatedCounter'
import ProgressRing from '../components/ProgressRing'
import { Card, Page, stagger } from '../components/ui'
import { useApp } from '../context/AppContext'
import { ACHIEVEMENTS } from '../data'
import { initials } from '../components/Shell'

const ICONS = { Zap, Flame, Dumbbell, Trophy, Sunrise, CalendarCheck, Medal, Rocket }

function Switch({ on, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="grid h-10 w-14 shrink-0 place-items-center rounded-full"
    >
      <span className={`relative h-7 w-12 rounded-full transition ${on ? 'bg-lime' : 'bg-line/15'}`}>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${on ? 'right-1' : 'left-1'}`}
        />
      </span>
    </button>
  )
}

export default function Profile() {
  const { theme, toggleTheme, logout, user, userStats } = useApp()
  const name = user?.full_name ?? ''
  const memberSince = user ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : ''
  const [reminders, setReminders] = useState(true)
  const [classAlerts, setClassAlerts] = useState(true)
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked).length

  return (
    <Page>
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 lg:grid-cols-3">
        {/* Identity */}
        <Card className="relative overflow-hidden lg:col-span-2">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-lime/25 via-cyan/20 to-violet/25" />
          <div className="relative flex flex-col items-center gap-5 pt-8 text-center sm:flex-row sm:items-end sm:text-left">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-1.5 rounded-[2rem] bg-[conic-gradient(from_0deg,#C6FF3D,#22E4FF,#A78BFA,#C6FF3D)] opacity-90 blur-[2px]"
              />
              <div className="relative grid h-28 w-28 place-items-center rounded-[1.75rem] border-4 border-bg bg-gradient-to-br from-[#1B2330] to-[#0A0D12] font-display text-4xl font-bold text-white">
                {initials(name)}
              </div>
              <span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-xl border-4 border-bg bg-lime text-[#0A0D12]">
                <Crown size={16} />
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{name}</h1>
              <p className="text-muted">{user?.email} · Member since {memberSince}</p>
              <span className="chip mt-3 bg-gradient-to-r from-[#C6FF3D] to-[#22E4FF] px-3 py-1.5 text-[#0A0D12]">
                <Crown size={14} /> Pulse Member
              </span>
            </div>
          </div>
          <div className="relative mt-6 grid grid-cols-3 gap-2">
            {[
              { label: 'Workouts', to: userStats?.totalWorkouts ?? 0, Icon: Dumbbell, c: 'text-lime' },
              { label: 'Hours', to: Math.round((userStats?.totalMinutes ?? 0) / 60), Icon: Timer, c: 'text-cyan' },
              { label: 'Best streak', to: userStats?.bestStreak ?? 0, Icon: Flame, c: 'text-ember' },
            ].map(({ label, to, Icon, c }) => (
              <div key={label} className="rounded-2xl bg-line/5 p-3 text-center sm:p-4">
                <Icon size={18} className={`mx-auto ${c}`} />
                <p className="mt-1 font-display text-2xl font-bold">
                  <AnimatedCounter to={to} duration={1.5} />
                </p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Membership card */}
        <Card className="flex flex-col">
          <p className="label mb-3">Membership</p>
          <motion.div
            whileHover={{ rotateX: 6, rotateY: -8, scale: 1.02 }}
            style={{ transformPerspective: 800 }}
            className="relative aspect-[1.6] overflow-hidden rounded-2xl bg-[#0A0D12] p-5 text-white shadow-glow"
          >
            <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[#C6FF3D]/40 blur-3xl" />
            <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-[#22E4FF]/30 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold">
                  Pulse<span className="bg-gradient-to-r from-[#C6FF3D] to-[#22E4FF] bg-clip-text text-transparent">Fit</span>
                </span>
                <Crown size={20} className="text-[#C6FF3D]" />
              </div>
              <div>
                <p className="font-display text-xl font-bold tracking-wide">ELITE</p>
                <p className="font-mono text-sm tracking-[0.2em] text-white/60">•••• 0424</p>
              </div>
              <div className="flex justify-between text-xs text-white/70">
                <span>{name.toUpperCase()}</span>
                <span>Renews Mar ’27</span>
              </div>
            </div>
          </motion.div>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li className="flex items-center gap-2"><Zap size={14} className="text-lime" /> Goal: {user?.weekly_goal_workouts} workouts · {user?.weekly_goal_minutes} min / week</li>
            <li className="flex items-center gap-2"><CalendarCheck size={14} className="text-lime" /> 5 classes / week</li>
            <li className="flex items-center gap-2"><Trophy size={14} className="text-lime" /> Monthly coach check-in</li>
          </ul>
        </Card>

        {/* Achievements */}
        <Card className="lg:col-span-2">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold">Achievements</h2>
              <p className="text-sm text-muted">{unlocked} of {ACHIEVEMENTS.length} unlocked</p>
            </div>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-line/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(unlocked / ACHIEVEMENTS.length) * 100}%` }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-[#C6FF3D] to-[#22E4FF]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ACHIEVEMENTS.map((a, i) => {
              const Icon = ICONS[a.icon]
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                  whileHover={{ y: -4 }}
                  title={a.desc}
                  className={`flex flex-col items-center rounded-2xl border p-4 text-center ${
                    a.unlocked ? 'border-lime/20 bg-lime/[0.06]' : 'border-line/10 bg-line/[0.03]'
                  }`}
                >
                  {a.unlocked ? (
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#C6FF3D] to-[#22E4FF] text-[#0A0D12] shadow-glow">
                      <Icon size={24} />
                    </div>
                  ) : (
                    <ProgressRing value={a.progress} size={56} stroke={5} delay={0.4}>
                      <Lock size={18} className="text-muted" />
                    </ProgressRing>
                  )}
                  <p className={`mt-3 text-sm font-semibold ${a.unlocked ? '' : 'text-muted'}`}>{a.name}</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-muted">
                    {a.unlocked ? a.desc : `${Math.round(a.progress * 100)}% · ${a.desc}`}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </Card>

        {/* Settings */}
        <Card>
          <h2 className="mb-4 text-xl font-bold">Settings</h2>
          <div className="divide-y divide-line/10">
            {[
              { Icon: Moon, label: 'Dark mode', on: theme === 'dark', set: toggleTheme },
              { Icon: Bell, label: 'Workout reminders', on: reminders, set: setReminders },
              { Icon: CalendarCheck, label: 'Class alerts', on: classAlerts, set: setClassAlerts },
            ].map(({ Icon, label, on, set }) => (
              <div key={label} className="flex items-center gap-3 py-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-line/5 text-muted">
                  <Icon size={17} />
                </span>
                <span className="flex-1 text-sm font-medium">{label}</span>
                <Switch on={on} onChange={set} label={label} />
              </div>
            ))}
          </div>
          <button
            onClick={logout}
            className="btn-ghost mt-4 w-full text-ember"
          >
            <LogOut size={17} /> Sign out
          </button>
        </Card>
      </motion.div>
    </Page>
  )
}
