import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  LogOut,
  CalendarDays,
  Dumbbell,
  Flame,
  HeartPulse,
  Play,
  Sparkles,
  Timer,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import { useRef } from 'react'
import AnimatedCounter from '../components/AnimatedCounter'
import Logo from '../components/Logo'
import ProgressRing from '../components/ProgressRing'
import { Footer } from '../components/Shell'
import ThemeToggle from '../components/ThemeToggle'
import { useApp } from '../context/AppContext'
import { QuoteOfTheDay, Skeleton, rise, stagger } from '../components/ui'
import { useApi } from '../lib/api'

const STATS = [
  { key: 'members', label: 'Active members', Icon: Users },
  { key: 'workouts_completed', label: 'Workouts completed', Icon: Dumbbell },
  { key: 'classes_this_week', label: 'Classes this week', Icon: CalendarDays },
]

function StatsStrip() {
  const { data, error, loading, reload } = useApi('/stats')
  return (
    <section className="relative mx-auto max-w-6xl px-4 md:px-8">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="glass grid grid-cols-1 divide-y divide-line/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        {STATS.map(({ key, label, Icon }) => (
          <motion.div key={key} variants={rise} className="flex items-center gap-4 p-6 md:p-8">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lime/10 text-lime">
              <Icon size={22} />
            </div>
            <div>
              <div className="font-display text-3xl font-bold md:text-4xl">
                {loading ? (
                  <Skeleton className="h-9 w-20" />
                ) : error ? (
                  <span className="text-muted">—</span>
                ) : (
                  <AnimatedCounter to={data[key]} />
                )}
              </div>
              <p className="text-sm text-muted">{label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
      {error && (
        <p className="mt-3 text-center text-sm text-muted">
          Live stats are taking a breather — {error.code === 'DB_UNAVAILABLE' ? 'the database can’t be reached right now' : 'the server didn’t answer'}.{' '}
          <button onClick={reload} className="font-semibold text-lime hover:underline">Retry</button>
        </p>
      )}
    </section>
  )
}

function NavAuth() {
  const { user, authLoading, navigate, logout } = useApp()
  if (authLoading) return <Skeleton className="h-10 w-28 !rounded-2xl" />
  if (!user) {
    return (
      <>
        <button onClick={() => navigate('login')} className="btn-ghost hidden !py-2.5 text-sm sm:inline-flex">
          Log in
        </button>
        <button onClick={() => navigate('signup')} className="btn-primary !py-2.5 text-sm">
          Sign up
        </button>
      </>
    )
  }
  return (
    <>
      <button onClick={() => navigate('dashboard')} className="btn-ghost !py-2.5 text-sm">
        <span className="max-w-[9rem] truncate">Hi, {user.full_name.split(' ')[0]}</span>
      </button>
      <button
        onClick={logout}
        aria-label="Log out"
        title="Log out"
        className="grid h-10 w-10 place-items-center rounded-2xl border border-line/10 bg-line/5 text-muted transition hover:bg-ember/10 hover:text-ember"
      >
        <LogOut size={17} />
      </button>
    </>
  )
}

const FEATURES = [
  { Icon: Dumbbell, title: 'Smart workout plans', text: '120+ exercises filtered by muscle group, with sets, reps and difficulty dialled in.', route: 'library', tint: 'lime' },
  { Icon: Timer, title: 'Live workout mode', text: 'Big rest timer, tap-to-tick sets, and a confetti finish line you’ll chase every session.', route: 'workout', tint: 'cyan' },
  { Icon: TrendingUp, title: 'Progress you can see', text: 'Strength curves and PR trophies that turn effort into evidence.', route: 'progress', tint: 'violet' },
  { Icon: CalendarDays, title: 'Book classes in a tap', text: 'Yoga, HIIT, Spin and Boxing — see spots left and lock yours in instantly.', route: 'classes', tint: 'ember' },
  { Icon: Flame, title: 'Streaks that stick', text: 'Daily streaks, weekly rings and goals that keep you coming back.', route: 'dashboard', tint: 'ember' },
  { Icon: Trophy, title: 'Badges worth earning', text: 'Unlock achievements from First Rep to Centurion as you level up.', route: 'profile', tint: 'lime' },
]

const TINT = {
  lime: 'bg-lime/15 text-lime',
  cyan: 'bg-cyan/15 text-cyan',
  violet: 'bg-violet/15 text-violet',
  ember: 'bg-ember/15 text-ember',
}

function HeroVisual() {
  return (
    <div className="relative mx-auto h-[440px] w-full max-w-[420px] sm:h-[500px]">
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/25 blur-[90px]" />
      <div className="absolute left-[60%] top-[30%] h-56 w-56 rounded-full bg-cyan/25 blur-[90px]" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="glass absolute left-1/2 top-6 w-[270px] -translate-x-1/2 p-5 sm:w-[300px]"
      >
        <div className="flex items-center justify-between">
          <p className="label">This week</p>
          <span className="chip bg-lime/15 text-lime">+18%</span>
        </div>
        <div className="mt-4 flex items-center gap-5">
          <ProgressRing value={0.8} size={110} stroke={11} delay={0.6}>
            <div>
              <p className="font-display text-2xl font-bold">4/5</p>
              <p className="text-[10px] text-muted">workouts</p>
            </div>
          </ProgressRing>
          <div className="space-y-3">
            <div>
              <p className="font-display text-xl font-bold">302</p>
              <p className="text-xs text-muted">active min</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold">2,730</p>
              <p className="text-xs text-muted">kcal burned</p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex h-16 items-end gap-1.5">
          {[52, 35, 8, 64, 45, 78, 28].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(h / 78) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.8 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className={`flex-1 rounded-md ${i === 5 ? 'bg-gradient-to-t from-[#C6FF3D] to-[#22E4FF]' : 'bg-line/15'}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Streak chip */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="absolute bottom-24 left-0 sm:bottom-28"
      >
        <div className="glass flex animate-floaty items-center gap-3 !rounded-2xl px-4 py-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-ember/15">
            <Flame className="fill-ember/40 text-ember" size={22} />
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-none">12 days</p>
            <p className="text-xs text-muted">streak 🔥</p>
          </div>
        </div>
      </motion.div>

      {/* Heart-rate chip */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="absolute bottom-6 right-0"
      >
        <div className="glass w-52 !rounded-2xl p-4 [animation-delay:-3s] animate-floaty">
          <div className="flex items-center gap-2">
            <HeartPulse size={18} className="text-cyan" />
            <span className="text-xs text-muted">Heart rate</span>
            <span className="ml-auto font-display font-bold">148</span>
          </div>
          <svg viewBox="0 0 200 40" className="mt-2 h-8 w-full">
            <path
              d="M0 22 H40 L50 8 L60 34 L72 4 L84 30 L92 22 H130 L140 12 L148 30 L156 22 H200"
              fill="none"
              stroke="rgb(var(--cyan))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="240"
              className="animate-pulseLine"
            />
          </svg>
        </div>
      </motion.div>

      {/* PR toast */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.3, type: 'spring', stiffness: 260, damping: 18 }}
        className="absolute -right-2 top-0 sm:-right-6"
      >
        <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C6FF3D] to-[#22E4FF] px-3.5 py-2 text-sm font-semibold text-[#0A0D12] shadow-glow">
          <Trophy size={16} /> New PR · 160 kg
        </div>
      </motion.div>
    </div>
  )
}

export default function Landing() {
  const { navigate, user } = useApp()
  const start = () => navigate(user ? 'dashboard' : 'signup')
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 160])

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <motion.div style={{ y: glowY }} className="pointer-events-none absolute inset-0 bg-aurora" />
      <div className="pointer-events-none absolute inset-0 bg-grid" />

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-line/5 bg-bg/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8 md:py-4">
          <a href="#/" aria-label="PulseFit home" className="flex min-h-10 items-center">
            <Logo size={32} />
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }} className="hover:text-ink">Features</a>
            <button onClick={() => navigate('classes')} className="hover:text-ink">Classes</button>
            <button onClick={() => navigate('progress')} className="hover:text-ink">Progress</button>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NavAuth />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-[1.1fr_1fr] md:px-8 md:pb-24 md:pt-20">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.span variants={rise} className="chip mb-6 border border-lime/25 bg-lime/10 text-lime">
            <Sparkles size={14} /> PulseFit 2.0 — your gym, in your pocket
          </motion.span>
          <motion.h1
            variants={rise}
            className="text-[2.9rem] font-bold leading-[0.95] sm:text-6xl lg:text-[5.2rem]"
          >
            Train smarter.
            <br />
            <span className="text-gradient animate-shimmer">Get stronger.</span>
          </motion.h1>
          <motion.p variants={rise} className="mt-6 max-w-lg text-lg text-muted">
            PulseFit plans your workouts, tracks every rep, books your favourite classes and keeps
            the fire lit — so all you have to do is show up.
          </motion.p>
          <motion.div variants={rise} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={start} className="btn-primary group px-7 py-4 text-lg">
              <Play size={20} className="fill-current" />
              Start Your Workout
              <ArrowRight size={20} className="transition group-hover:translate-x-1" />
            </button>
            <button onClick={() => navigate(user ? 'dashboard' : 'login')} className="btn-ghost px-7 py-4 text-lg">
              {user ? 'View dashboard' : 'Log in'}
            </button>
          </motion.div>
          <motion.div variants={rise} className="mt-8 flex items-center gap-3 text-sm text-muted">
            <div className="flex -space-x-2">
              {['#C6FF3D', '#22E4FF', '#A78BFA', '#FF7840'].map((c, i) => (
                <span key={c} className="grid h-8 w-8 place-items-center rounded-full border-2 border-bg text-[11px] font-bold text-[#0A0D12]" style={{ background: c }}>
                  {['JM', 'SK', 'LT', 'RB'][i]}
                </span>
              ))}
            </div>
            <span>
              <span className="font-semibold text-ink">4.9★</span> from 12k+ athletes
            </span>
          </motion.div>
        </motion.div>

        <HeroVisual />
      </section>

      {/* Stats */}
      <StatsStrip />

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="label mb-3 !text-lime">Everything in one app</p>
          <h2 className="text-4xl font-bold md:text-5xl">
            Built for the way you <span className="text-gradient">actually train.</span>
          </h2>
        </div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map(({ Icon, title, text, route, tint }) => (
            <motion.button
              key={title}
              variants={rise}
              onClick={() => navigate(route)}
              className="glass glass-hover group p-6 text-left"
            >
              <div className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl ${TINT[tint]}`}>
                <Icon size={22} />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-muted">{text}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-lime opacity-80 transition group-hover:gap-2 group-hover:opacity-100">
                Explore <ArrowRight size={16} />
              </span>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Marquee */}
      <section className="relative overflow-hidden border-y border-line/10 py-6">
        <motion.div
          className="flex w-max gap-10 whitespace-nowrap font-display text-3xl font-bold md:text-5xl"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        >
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ['STRENGTH', 'HIIT', 'SPIN', 'YOGA', 'BOXING', 'MOBILITY', 'ENDURANCE', 'POWER'].map((w, i) => (
              <span key={`${k}-${w}`} className={i % 2 ? 'text-gradient' : 'text-line/15 [-webkit-text-stroke:1px_rgb(var(--ink)/0.5)]'}>
                {w} <span className="text-lime">✦</span>
              </span>
            )),
          )}
        </motion.div>
      </section>

      {/* Quote + CTA */}
      <section className="relative mx-auto grid max-w-6xl gap-4 px-4 py-20 md:grid-cols-[1fr_1.3fr] md:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <QuoteOfTheDay className="h-full" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#C6FF3D] via-[#7DFFA0] to-[#22E4FF] p-8 text-[#0A0D12] md:p-10"
        >
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/30 blur-2xl" />
          <h2 className="relative text-3xl font-bold md:text-4xl">Your next PR starts today.</h2>
          <p className="relative mt-3 max-w-md text-[#0A0D12]/75">
            Build today’s workout, tick off every set and watch your weekly rings close.
          </p>
          <button
            onClick={start}
            className="btn relative mt-6 bg-[#0A0D12] px-7 py-4 text-white hover:-translate-y-0.5 hover:bg-black"
          >
            <Play size={18} className="fill-current" /> Start Your Workout
          </button>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
