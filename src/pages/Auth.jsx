import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, CalendarCheck, Eye, EyeOff, Flame, Loader2, Lock, Mail, Timer, TrendingUp, UserRound } from 'lucide-react'
import { useState } from 'react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { rise, stagger } from '../components/ui'
import { useApp } from '../context/AppContext'
import { api } from '../lib/api'

const NEXT_KEY = 'pulsefit-next'

export function rememberNext(route) {
  try {
    sessionStorage.setItem(NEXT_KEY, route)
  } catch {
    /* ignore */
  }
}

function takeNext() {
  try {
    const r = sessionStorage.getItem(NEXT_KEY)
    sessionStorage.removeItem(NEXT_KEY)
    return r
  } catch {
    return null
  }
}

const PERKS = [
  { Icon: Flame, text: 'Streaks that keep the fire lit' },
  { Icon: Timer, text: 'Live workout mode with smart rest timers' },
  { Icon: TrendingUp, text: 'Weekly rings that close as you train' },
  { Icon: CalendarCheck, text: 'Your plan, saved and synced' },
]

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-aurora" />
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <a href="#/" aria-label="PulseFit home" className="flex min-h-10 items-center">
          <Logo size={32} />
        </a>
        <ThemeToggle />
      </header>

      <main className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-4 md:grid-cols-2 md:px-8 md:pt-12">
        <motion.div variants={stagger} initial="hidden" animate="show" className="hidden md:block">
          <motion.h1 variants={rise} className="text-5xl font-bold leading-[1.02] lg:text-6xl">
            Train smarter.
            <br />
            <span className="text-gradient animate-shimmer">Get stronger.</span>
          </motion.h1>
          <div className="mt-10 flex items-center gap-8">
            <motion.ul variants={stagger} className="flex-1 space-y-4">
              {PERKS.map(({ Icon, text }) => (
                <motion.li key={text} variants={rise} className="flex items-center gap-4 text-lg text-muted">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lime/10 text-lime">
                    <Icon size={20} />
                  </span>
                  {text}
                </motion.li>
              ))}
            </motion.ul>
            <motion.img
              variants={rise}
              src="/images/auth.webp"
              alt="Athlete running on a treadmill"
              width="400"
              height="480"
              className="hidden w-44 shrink-0 animate-floaty rounded-3xl border border-line/10 shadow-glow lg:block"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative mx-auto w-full max-w-md overflow-hidden p-6 sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="mt-1.5 text-muted">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function Field({ icon: Icon, label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <span className="relative block">
        <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        {children}
      </span>
    </label>
  )
}

function PasswordInput({ value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <>
      <input
        type={show ? 'text' : 'password'}
        required
        minLength={autoComplete === 'new-password' ? 8 : undefined}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={autoComplete === 'new-password' ? 'At least 8 characters' : '••••••••'}
        className="field pl-11 pr-12"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:text-ink"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </>
  )
}

function FormError({ message }) {
  if (!message) return null
  return (
    <motion.p
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      className="flex items-start gap-2 rounded-2xl border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ember"
    >
      <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {message}
    </motion.p>
  )
}

function useAuthSubmit(path) {
  const { refreshUser, navigate, toast } = useApp()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (body, successToast) => {
    setBusy(true)
    setError('')
    try {
      await api(path, { method: 'POST', body })
      await refreshUser()
      toast(successToast)
      navigate(takeNext() || 'dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, submit }
}

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, submit } = useAuthSubmit('/auth/login')

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to pick up where you left off.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          submit({ email, password }, { title: 'Welcome back! 💪', message: 'Let’s get after it.' })
        }}
      >
        <Field icon={Mail} label="Email">
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="field pl-11" />
        </Field>
        <Field icon={Lock} label="Password">
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>
        <FormError message={error} />
        <button type="submit" disabled={busy} className="btn-primary w-full py-4 text-lg">
          {busy ? <Loader2 size={20} className="animate-spin" /> : <>Log in <ArrowRight size={20} /></>}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New to PulseFit?{' '}
        <a href="#/signup" className="font-semibold text-lime hover:underline">Create an account</a>
      </p>
    </AuthLayout>
  )
}

function GoalSlider({ label, value, onChange, min, max, step, format }) {
  return (
    <div className="rounded-2xl border border-line/10 bg-line/[0.03] p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-display text-xl font-bold text-lime tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[#C6FF3D]"
        aria-label={label}
      />
    </div>
  )
}

export function Signup() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', weekly_goal_workouts: 4, weekly_goal_minutes: 150 })
  const { busy, error, submit } = useAuthSubmit('/auth/signup')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }))

  return (
    <AuthLayout title="Create your account" subtitle="Set your weekly goals — we’ll help you hit them.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          submit(form, { title: `Welcome to PulseFit, ${form.full_name.split(' ')[0]}! 🎉`, message: 'Pick some exercises to build today’s workout.' })
        }}
      >
        <Field icon={UserRound} label="Full name">
          <input required autoComplete="name" value={form.full_name} onChange={set('full_name')} placeholder="Alex Rivera" className="field pl-11" />
        </Field>
        <Field icon={Mail} label="Email">
          <input type="email" required autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className="field pl-11" />
        </Field>
        <Field icon={Lock} label="Password">
          <PasswordInput value={form.password} onChange={set('password')} autoComplete="new-password" />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <GoalSlider
            label="Workouts / week"
            value={form.weekly_goal_workouts}
            onChange={set('weekly_goal_workouts')}
            min={1}
            max={7}
            step={1}
            format={(v) => v}
          />
          <GoalSlider
            label="Active minutes"
            value={form.weekly_goal_minutes}
            onChange={set('weekly_goal_minutes')}
            min={30}
            max={600}
            step={15}
            format={(v) => `${v}m`}
          />
        </div>

        <FormError message={error} />
        <button type="submit" disabled={busy} className="btn-primary w-full py-4 text-lg">
          {busy ? <Loader2 size={20} className="animate-spin" /> : <>Start training <ArrowRight size={20} /></>}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already a member?{' '}
        <a href="#/login" className="font-semibold text-lime hover:underline">Log in</a>
      </p>
    </AuthLayout>
  )
}
