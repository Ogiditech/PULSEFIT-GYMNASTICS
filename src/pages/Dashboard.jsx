import { motion } from 'framer-motion'
import { CalendarDays, CalendarPlus, CheckCircle2, Clock, Dumbbell, Flame, Library, Play, Target, Timer, Zap } from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import AnimatedCounter from '../components/AnimatedCounter'
import ChartTooltip from '../components/ChartTooltip'
import ProgressRing from '../components/ProgressRing'
import { Card, EmptyState, ErrorState, Page, QuoteOfTheDay, Skeleton, SkeletonCard, stagger } from '../components/ui'
import { useApp, useChartColors } from '../context/AppContext'
import { CLASSES, CLASS_TYPES } from '../data'
import { useApi } from '../lib/api'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function TodayWorkout({ workout }) {
  const { navigate } = useApp()

  if (!workout || workout.exercises.length === 0) {
    return (
      <Card className="relative flex flex-col items-center justify-center overflow-hidden py-12 text-center lg:col-span-2">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-lime/15 blur-3xl" />
        <div className="relative mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-line/10 bg-line/5">
          <Dumbbell className="text-lime" size={28} />
        </div>
        <p className="label relative !text-lime">Today’s workout</p>
        <h2 className="relative mt-2 text-2xl font-bold">No workout yet today.</h2>
        <p className="relative mt-2 max-w-sm text-muted">Pick one from the Library! Add a few exercises and they’ll show up right here.</p>
        <button onClick={() => navigate('library')} className="btn-primary relative mt-6">
          <Library size={18} /> Open the Library
        </button>
      </Card>
    )
  }

  const done = workout.status === 'completed'
  const totalSets = workout.exercises.reduce((a, e) => a + e.sets.length, 0)
  const doneSets = workout.exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0)

  return (
    <Card className="relative overflow-hidden lg:col-span-2">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-lime/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-cyan/15 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label !text-lime">Today’s workout</p>
            <h2 className="mt-1.5 text-2xl font-bold md:text-3xl">{workout.name}</h2>
            <p className="mt-1 text-muted">{[...new Set(workout.exercises.map((e) => e.muscle_group))].join(' · ')}</p>
          </div>
          <div className={`hidden h-14 w-14 shrink-0 place-items-center rounded-2xl sm:grid ${done ? 'bg-lime text-[#0A0D12]' : 'bg-lime/15 text-lime'}`}>
            {done ? <CheckCircle2 size={26} /> : <Dumbbell size={26} />}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="chip bg-line/5 text-ink">
            <Timer size={14} className="text-cyan" /> {done ? `${workout.duration_minutes} min` : `~${workout.estimated_minutes} min`}
          </span>
          <span className="chip bg-line/5 text-ink"><Flame size={14} className="text-ember" /> ~{workout.estimated_kcal} kcal</span>
          <span className="chip bg-line/5 text-ink">
            <Zap size={14} className="text-lime" /> {doneSets > 0 ? `${doneSets}/${totalSets}` : totalSets} sets
          </span>
          {workout.status === 'in_progress' && <span className="chip bg-lime/15 text-lime">In progress</span>}
        </div>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {workout.exercises.map((e, i) => (
            <li key={e.workout_exercise_id} className="flex items-center gap-3 rounded-2xl border border-line/5 bg-line/[0.03] px-3 py-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-line/10 font-display text-xs font-bold">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{e.name}</span>
              <span className="shrink-0 text-xs text-muted tabular-nums">{e.sets.length}×{e.reps}</span>
            </li>
          ))}
        </ul>

        {done ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="flex items-center gap-2 font-semibold text-lime">
              <CheckCircle2 size={20} /> Workout complete — great work!
            </p>
            <button onClick={() => navigate('library')} className="btn-ghost sm:ml-auto">
              <Library size={18} /> Plan another
            </button>
          </div>
        ) : (
          <button onClick={() => navigate('workout')} className="btn-primary mt-6 w-full py-4 text-lg sm:w-auto sm:px-10">
            <Play size={20} className="fill-current" /> {workout.status === 'in_progress' ? 'Resume' : 'Start'}
          </button>
        )}
      </div>
    </Card>
  )
}

function Streak({ streak, bestStreak, activity }) {
  return (
    <Card className="relative flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-ember/25 blur-3xl" />
      <div className="relative flex items-center gap-4">
        <motion.div
          animate={streak ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className={`grid h-16 w-16 place-items-center rounded-2xl ${
            streak ? 'bg-gradient-to-br from-[#FFB347] to-[#FF5E3A] shadow-[0_0_40px_-6px_rgba(255,120,64,0.7)]' : 'bg-line/10'
          }`}
        >
          <Flame size={34} className={streak ? 'fill-white/40 text-white' : 'text-muted'} />
        </motion.div>
        <div>
          <p className="font-display text-5xl font-bold leading-none">
            <AnimatedCounter to={streak} duration={1.4} />
          </p>
          <p className="mt-1 text-sm text-muted">day streak</p>
        </div>
      </div>
      <div className="relative mt-6 flex justify-between">
        {activity.map((d, i) => {
          const trained = d.workouts > 0
          return (
            <div key={d.date} className="flex flex-col items-center gap-1.5">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06, type: 'spring' }}
                className={`grid h-8 w-8 place-items-center rounded-full text-xs ${
                  trained ? 'bg-ember/20 text-ember' : 'border border-dashed border-line/20 text-muted'
                }`}
                title={trained ? `${d.minutes} min on ${d.date}` : `Rest day · ${d.date}`}
              >
                {trained ? <Flame size={14} className="fill-current" /> : ''}
              </motion.span>
              <span className="text-[11px] text-muted">{d.day[0]}</span>
            </div>
          )
        })}
      </div>
      <p className="relative mt-auto pt-5 text-sm text-muted">
        {streak === 0 ? (
          'Finish a workout today to light the fire 🔥'
        ) : streak >= bestStreak ? (
          <>This is your <span className="font-semibold text-ink">best streak ever</span>. Keep it going!</>
        ) : (
          <>
            Personal best: <span className="font-semibold text-ink">{bestStreak} days</span>. {bestStreak - streak + 1} more to beat it!
          </>
        )}
      </p>
    </Card>
  )
}

function Rings({ week }) {
  const rings = [
    { label: 'Workouts', value: week.workouts, goal: week.goalWorkouts, from: '#C6FF3D', to: '#7DFFA0', Icon: Dumbbell },
    { label: 'Active min', value: week.minutes, goal: week.goalMinutes, from: '#22E4FF', to: '#5B8CFF', Icon: Clock },
    { label: 'Goals hit', value: week.goalsHit, goal: week.goalsTotal, from: '#A78BFA', to: '#F472B6', Icon: Target },
  ]
  return (
    <Card className="lg:col-span-3">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Weekly goals</h3>
        <span className="text-sm text-muted">Resets Monday</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {rings.map((r, i) => {
          const pct = r.goal ? r.value / r.goal : 0
          return (
            <div key={r.label} className="flex flex-col items-center text-center">
              <div className="sm:hidden">
                <ProgressRing value={pct} size={92} stroke={9} from={r.from} to={r.to} delay={i * 0.15}>
                  <r.Icon size={20} style={{ color: r.from }} />
                </ProgressRing>
              </div>
              <div className="hidden sm:block">
                <ProgressRing value={pct} size={136} stroke={12} from={r.from} to={r.to} delay={i * 0.15}>
                  <div>
                    <p className="font-display text-2xl font-bold">{Math.round(Math.min(pct, 1) * 100)}%</p>
                    <r.Icon size={16} className="mx-auto mt-0.5" style={{ color: r.from }} />
                  </div>
                </ProgressRing>
              </div>
              <p className="mt-3 font-display text-lg font-bold tabular-nums">
                {r.value}
                <span className="text-sm font-medium text-muted">/{r.goal}</span>
              </p>
              <p className="text-xs text-muted">{r.label}</p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function WeeklyChart({ activity }) {
  const c = useChartColors()
  const [metric, setMetric] = useState('minutes')
  const total = activity.reduce((a, d) => a + d[metric], 0)
  const max = Math.max(...activity.map((d) => d[metric]))
  const unit = metric === 'minutes' ? ' min' : ' kcal'

  return (
    <Card className="lg:col-span-2">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Weekly activity</h3>
          <p className="mt-0.5 font-display text-3xl font-bold tabular-nums">
            {total.toLocaleString()}
            <span className="ml-1 text-base font-medium text-muted">
              {metric === 'minutes' ? 'min' : 'kcal (est.)'} · last 7 days
            </span>
          </p>
        </div>
        <div className="flex rounded-xl border border-line/10 bg-line/5 p-1 text-sm">
          {['minutes', 'kcal'].map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`relative rounded-lg px-3 py-2.5 font-medium capitalize transition ${metric === m ? 'text-[#0A0D12]' : 'text-muted hover:text-ink'}`}
            >
              {metric === m && <motion.span layoutId="metric-pill" className="absolute inset-0 rounded-lg bg-lime" />}
              <span className="relative">{m}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-56 md:h-64">
        {total === 0 && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
            <p className="glass !rounded-2xl px-4 py-2 text-sm text-muted">Finish a workout and your bars start growing 📈</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activity} margin={{ top: 8, right: 0, left: -24, bottom: 0 }} barCategoryGap="28%">
            <defs>
              <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={c.lime} />
                <stop offset="1" stopColor={c.cyan} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={c.grid} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: c.axis, fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: c.axis, fontSize: 12 }} width={48} allowDecimals={false} />
            <Tooltip cursor={{ fill: c.grid, radius: 8 }} content={<ChartTooltip unit={unit} />} />
            <Bar dataKey={metric} name={metric === 'minutes' ? 'Active' : 'Burned (est.)'} radius={[4, 4, 0, 0]} animationDuration={1100} animationEasing="ease-out">
              {activity.map((d) => (
                <Cell key={d.date} fill={max > 0 && d[metric] === max ? 'url(#bar-grad)' : c.cyan} fillOpacity={max > 0 && d[metric] === max ? 1 : 0.55} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function UpcomingClasses() {
  const { bookings, navigate } = useApp()
  const booked = CLASSES.filter((c) => bookings.includes(c.id))
  if (!booked.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No classes booked yet"
        message="Spin, Boxing, HIIT or Yoga — grab a spot and train with the crew."
        action={
          <button onClick={() => navigate('classes')} className="btn-primary">
            <CalendarPlus size={18} /> Book a class
          </button>
        }
      />
    )
  }
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your classes</h3>
        <button onClick={() => navigate('classes')} className="-my-2.5 px-1 py-2.5 text-sm font-semibold text-lime">Manage</button>
      </div>
      <ul className="space-y-2">
        {booked.map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-line/[0.04] p-3">
            <span className="text-2xl">{CLASS_TYPES[c.type].emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{c.title}</p>
              <p className="text-xs text-muted">{c.day} · {c.time} · {c.coach}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SkeletonCard className="h-80 lg:col-span-2" lines={5} />
      <SkeletonCard className="h-80" lines={3} />
      <SkeletonCard className="lg:col-span-3">
        <Skeleton className="h-5 w-32" />
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <Skeleton className="h-24 w-24 !rounded-full sm:h-32 sm:w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </SkeletonCard>
      <SkeletonCard className="h-72 lg:col-span-2" lines={6} />
      <SkeletonCard className="h-72" lines={4} />
    </div>
  )
}

function subtitle(week) {
  const left = week.goalWorkouts - week.workouts
  if (left <= 0) return 'Weekly workout goal smashed. Everything from here is bonus. 🏆'
  return `You’re ${left} workout${left === 1 ? '' : 's'} away from closing this week’s ring.`
}

export default function Dashboard() {
  const { user } = useApp()
  const { data, error, loading, reload } = useApi('/dashboard')
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <Page>
      <div className="mb-6 md:mb-8">
        <p className="label mb-2">{date}</p>
        <h1 className="text-3xl font-bold md:text-4xl">
          {greeting()}, <span className="text-gradient">{user?.full_name.split(' ')[0]}</span> 👋
        </h1>
        {data ? <p className="mt-2 text-muted">{subtitle(data.week)}</p> : <Skeleton className="mt-3 h-4 w-72 max-w-full" />}
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 lg:grid-cols-3">
          <TodayWorkout workout={data.today} />
          <Streak streak={data.streak} bestStreak={data.bestStreak} activity={data.activity} />
          <Rings week={data.week} />
          <WeeklyChart activity={data.activity} />
          <div className="flex flex-col gap-4">
            <QuoteOfTheDay />
            <UpcomingClasses />
          </div>
        </motion.div>
      )}
    </Page>
  )
}
