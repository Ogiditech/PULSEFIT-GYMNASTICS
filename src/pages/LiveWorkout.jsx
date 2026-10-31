import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Clock, Dumbbell, Flag, Flame, Library, Loader2, Pause, Play, Plus, SkipForward, Trophy, X } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { EmptyState, ErrorState, Page, Skeleton, SkeletonCard } from '../components/ui'
import { useApp } from '../context/AppContext'
import { api, useApi } from '../lib/api'

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`

const KCAL_PER_SET = 8 // rough estimate shown in the header and summary

function fireConfetti() {
  const colors = ['#C6FF3D', '#22E4FF', '#7DFFA0', '#A78BFA', '#FFFFFF']
  const end = Date.now() + 2200
  confetti({ particleCount: 140, spread: 90, startVelocity: 55, origin: { y: 0.6 }, colors })
  ;(function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors })
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

function useRestTimer(onFinish) {
  const [state, setState] = useState({ total: 0, endAt: 0, remaining: 0, paused: false })
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (!state.endAt || state.paused) return
    const id = setInterval(() => {
      const remaining = Math.ceil((state.endAt - Date.now()) / 1000)
      if (remaining <= 0) {
        setState((s) => ({ ...s, endAt: 0, remaining: 0 }))
        finishRef.current?.()
      } else {
        setState((s) => (s.remaining === remaining ? s : { ...s, remaining }))
      }
    }, 200)
    return () => clearInterval(id)
  }, [state.endAt, state.paused])

  return {
    ...state,
    running: state.remaining > 0,
    start: (secs) => setState({ total: secs, endAt: Date.now() + secs * 1000, remaining: secs, paused: false }),
    pause: () => setState((s) => ({ ...s, paused: true, endAt: 0 })),
    resume: () => setState((s) => ({ ...s, paused: false, endAt: Date.now() + s.remaining * 1000 })),
    add: (secs) =>
      setState((s) => ({
        ...s,
        total: s.total + secs,
        remaining: s.remaining + secs,
        endAt: s.paused ? 0 : (s.endAt || Date.now()) + secs * 1000,
      })),
    skip: () => setState({ total: 0, endAt: 0, remaining: 0, paused: false }),
  }
}

function RestRing({ timer, size }) {
  const stroke = size > 200 ? 14 : 11
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = timer.total ? timer.remaining / timer.total : 0
  const urgent = timer.running && timer.remaining <= 5
  const gradId = `rest-${useId().replace(/:/g, '')}`

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className={`absolute inset-6 rounded-full blur-3xl transition ${timer.running ? (urgent ? 'bg-ember/30' : 'bg-lime/25') : 'bg-cyan/10'}`} />
      <svg width={size} height={size} className="relative -rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={urgent ? '#FFB347' : '#C6FF3D'} />
            <stop offset="1" stopColor={urgent ? '#FF5E3A' : '#22E4FF'} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line/10" />
        {/* tick marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * Math.PI * 2
          const r1 = r - stroke - 4
          const r2 = r1 - (i % 5 === 0 ? 8 : 4)
          return (
            <line
              key={i}
              x1={size / 2 + Math.cos(a) * r1}
              y1={size / 2 + Math.sin(a) * r1}
              x2={size / 2 + Math.cos(a) * r2}
              y2={size / 2 + Math.sin(a) * r2}
              className="stroke-line/15"
              strokeWidth={i % 5 === 0 ? 2 : 1}
            />
          )
        })}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 10px rgba(198,255,61,0.45))' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="label">{timer.running ? (timer.paused ? 'Paused' : 'Rest') : 'Ready'}</p>
          <motion.p
            key={timer.remaining}
            initial={{ scale: urgent ? 1.15 : 1, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`font-display font-bold tabular-nums leading-none ${size > 200 ? 'text-7xl' : 'text-5xl'} ${urgent ? 'text-ember' : ''}`}
          >
            {timer.running ? fmt(timer.remaining) : 'GO'}
          </motion.p>
          <p className="mt-2 text-sm text-muted">{timer.running ? 'until next set' : 'tick a set to rest'}</p>
        </div>
      </div>
    </div>
  )
}

function Celebration({ stats, streak, onClose }) {
  const { navigate } = useApp()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-bg/70 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="glass relative w-full max-w-md overflow-hidden p-8 text-center"
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-xl p-2 text-muted hover:bg-line/10" aria-label="Close">
          <X size={18} />
        </button>
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-lime/30 blur-3xl" />
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 12 }}
          className="relative mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-[#C6FF3D] to-[#22E4FF] text-[#0A0D12] shadow-glow"
        >
          <Trophy size={44} />
        </motion.div>
        <h2 className="relative mt-6 text-3xl font-bold">Workout complete!</h2>
        <p className="relative mt-2 text-muted">
          That’s how it’s done.{' '}
          {streak > 1 ? `Your streak is now ${streak} days. 🔥` : streak === 1 ? 'Day one of a brand-new streak. 🔥' : 'Saved to your history.'}
        </p>
        <div className="relative mt-6 grid grid-cols-3 gap-2">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-line/5 p-3">
              <p className="font-display text-xl font-bold tabular-nums">{value}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
            </div>
          ))}
        </div>
        <div className="relative mt-6 flex flex-col gap-2 sm:flex-row">
          <button onClick={() => navigate('dashboard')} className="btn-primary flex-1">See dashboard</button>
          <button onClick={onClose} className="btn-ghost flex-1">Close</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function LiveSkeleton() {
  return (
    <>
      <Skeleton className="mb-2 h-3 w-28" />
      <Skeleton className="mb-6 h-9 w-72 max-w-full" />
      <Skeleton className="mb-6 h-2.5 w-full !rounded-full" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_1fr]">
        <SkeletonCard className="flex flex-col items-center">
          <Skeleton className="h-56 w-56 !rounded-full sm:h-72 sm:w-72" />
          <Skeleton className="mt-6 h-11 w-full" />
        </SkeletonCard>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="!rounded-2xl !p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-11 w-11" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="mt-2 h-3 w-1/3" />
                </div>
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>
    </>
  )
}

export default function LiveWorkout() {
  const { toast, navigate, refreshUser, userStats } = useApp()
  const { data, error, loading, reload, setData } = useApi('/workouts/today')
  const workout = data?.workout
  const exercises = workout?.exercises ?? []

  const [open, setOpen] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [finishing, setFinishing] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const pendingSaves = useRef(new Set())
  const startRequested = useRef(false)

  const complete = workout?.status === 'completed'

  const timer = useRestTimer(
    useCallback(() => {
      navigator.vibrate?.([120, 60, 120])
      toast({ type: 'info', title: 'Rest over — let’s go!', message: 'Next set is waiting for you.', duration: 2500 })
    }, [toast]),
  )

  const patchWorkout = useCallback((patch) => setData((d) => ({ ...d, workout: { ...d.workout, ...patch } })), [setData])

  // Open the first unfinished exercise once data arrives.
  useEffect(() => {
    if (!exercises.length || open !== null) return
    const next = exercises.find((e) => e.sets.some((s) => !s.completed)) ?? exercises[0]
    setOpen(next.workout_exercise_id)
  }, [exercises, open])

  // Entering Live Workout Mode starts the clock on a planned workout.
  useEffect(() => {
    if (!workout || workout.status !== 'planned' || !exercises.length || startRequested.current) return
    startRequested.current = true
    api(`/workouts/${workout.id}`, { method: 'PATCH', body: { action: 'start' } })
      .then(({ workout: w }) => patchWorkout({ status: w.status, started_at: w.started_at }))
      .catch((err) => toast({ type: 'error', title: 'Couldn’t start the workout clock', message: err.message }))
  }, [workout, exercises.length, patchWorkout, toast])

  useEffect(() => {
    if (complete || !workout?.started_at) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [complete, workout?.started_at])

  const elapsed = complete
    ? (workout.duration_minutes ?? 0) * 60
    : workout?.started_at
      ? Math.max(0, Math.floor((now - Date.parse(workout.started_at)) / 1000))
      : 0

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0)
  const doneSets = exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0)
  const pct = totalSets ? doneSets / totalSets : 0
  const kcal = doneSets * KCAL_PER_SET

  const stats = useMemo(
    () => [
      ['Time', complete ? `${workout.duration_minutes}m` : fmt(elapsed)],
      ['Sets', `${doneSets}/${totalSets}`],
      ['kcal', kcal],
    ],
    [complete, workout, elapsed, doneSets, totalSets, kcal],
  )

  const setSetCompleted = (setId, completed) =>
    setData((d) => ({
      ...d,
      workout: {
        ...d.workout,
        exercises: d.workout.exercises.map((e) => ({
          ...e,
          sets: e.sets.map((s) => (s.id === setId ? { ...s, completed } : s)),
        })),
      },
    }))

  const finish = async () => {
    if (finishing || complete) return
    setFinishing(true)
    timer.skip()
    try {
      // Make sure every optimistic set save has landed before closing the workout.
      await Promise.allSettled([...pendingSaves.current])
      const { workout: w } = await api(`/workouts/${workout.id}`, { method: 'PATCH', body: { action: 'complete' } })
      patchWorkout(w)
      setShowCelebration(true)
      fireConfetti()
      refreshUser()
    } catch (err) {
      toast({ type: 'error', title: 'Couldn’t save your workout', message: err.message })
    } finally {
      setFinishing(false)
    }
  }

  const toggleSet = (ex, set) => {
    if (complete || finishing) return
    const completed = !set.completed

    // Optimistic: flip it now, save in the background, roll back if the save fails.
    setSetCompleted(set.id, completed)
    const save = api(`/sets/${set.id}`, { method: 'PATCH', body: { completed } })
      .then(() => {
        if (workout.status === 'planned') patchWorkout({ status: 'in_progress' })
      })
      .catch((err) => {
        setSetCompleted(set.id, !completed)
        toast({ type: 'error', title: 'That set didn’t save', message: err.message })
      })
      .finally(() => pendingSaves.current.delete(save))
    pendingSaves.current.add(save)

    if (!completed) return

    if (doneSets + 1 === totalSets) {
      finish()
      return
    }
    const exDone = ex.sets.filter((s) => s.completed).length + 1 === ex.sets.length
    if (exDone) {
      const nextEx = exercises.find((e) => e.workout_exercise_id !== ex.workout_exercise_id && e.sets.some((s) => !s.completed))
      if (nextEx) setOpen(nextEx.workout_exercise_id)
      toast({ title: `${ex.name} done ✅`, message: nextEx ? `Up next: ${nextEx.name}` : undefined, duration: 2500 })
    }
    timer.start(ex.rest_seconds)
  }

  if (loading) {
    return (
      <Page>
        <LiveSkeleton />
      </Page>
    )
  }

  if (error) {
    return (
      <Page>
        <ErrorState error={error} onRetry={reload} />
      </Page>
    )
  }

  if (!workout || exercises.length === 0) {
    return (
      <Page>
        <EmptyState
          icon={Dumbbell}
          title="No workout yet today."
          message="Pick one from the Library! Add a few exercises, then come back here to crush them."
          action={
            <button onClick={() => navigate('library')} className="btn-primary">
              <Library size={18} /> Open the Library
            </button>
          }
        />
      </Page>
    )
  }

  return (
    <Page>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label mb-2 flex items-center gap-2 !text-lime">
            <span className="relative flex h-2 w-2">
              {!complete && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
            </span>
            {complete ? 'Finished' : 'Live workout'}
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">{workout.name}</h1>
        </div>
        <div className="flex gap-2">
          <span className="chip bg-line/5 px-3 py-2 text-sm text-ink">
            <Clock size={15} className="text-cyan" /> <span className="tabular-nums">{complete ? `${workout.duration_minutes} min` : fmt(elapsed)}</span>
          </span>
          <span className="chip bg-line/5 px-3 py-2 text-sm text-ink">
            <Flame size={15} className="text-ember" /> <span className="tabular-nums">{kcal}</span> kcal
          </span>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted">{doneSets} of {totalSets} sets</span>
          <span className="font-display font-semibold">{Math.round(pct * 100)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-line/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#C6FF3D] to-[#22E4FF] shadow-glow"
            animate={{ width: `${pct * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start">
        {/* Timer */}
        <div className="glass flex flex-col items-center p-6 lg:sticky lg:top-8">
          <div className="sm:hidden"><RestRing timer={timer} size={220} /></div>
          <div className="hidden sm:block"><RestRing timer={timer} size={300} /></div>
          <div className="mt-6 flex w-full gap-2">
            <button onClick={() => (timer.paused ? timer.resume() : timer.pause())} disabled={!timer.running} className="btn-ghost flex-1">
              {timer.paused ? <Play size={18} /> : <Pause size={18} />} {timer.paused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={() => timer.add(15)} disabled={!timer.running} className="btn-ghost">
              <Plus size={18} /> 15s
            </button>
            <button onClick={timer.skip} disabled={!timer.running} className="btn-ghost" aria-label="Skip rest">
              <SkipForward size={18} />
            </button>
          </div>
          {!complete && (
            <button
              onClick={finish}
              disabled={doneSets === 0 || finishing}
              className="btn mt-4 w-full border border-lime/25 bg-lime/10 text-lime hover:bg-lime hover:text-[#0A0D12]"
            >
              {finishing ? <Loader2 size={18} className="animate-spin" /> : <Flag size={18} />}
              {finishing ? 'Saving…' : doneSets === totalSets ? 'Finish workout' : 'Finish early'}
            </button>
          )}
        </div>

        {/* Exercises */}
        <div className="space-y-3">
          {exercises.map((ex, idx) => {
            const sets = ex.sets
            const finished = sets.every((s) => s.completed)
            const isOpen = open === ex.workout_exercise_id
            const count = sets.filter((s) => s.completed).length
            return (
              <motion.div
                key={ex.workout_exercise_id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className={`glass overflow-hidden !rounded-2xl transition ${isOpen ? 'border-lime/30' : ''} ${finished ? 'opacity-70' : ''}`}
              >
                <button onClick={() => setOpen(isOpen ? -1 : ex.workout_exercise_id)} className="flex w-full items-center gap-4 p-4 text-left">
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display font-bold transition ${
                      finished ? 'bg-lime text-[#0A0D12]' : 'bg-line/10'
                    }`}
                  >
                    {finished ? <Check size={20} strokeWidth={3} /> : idx + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate font-semibold ${finished ? 'line-through decoration-lime/60' : ''}`}>{ex.name}</span>
                    <span className="block text-sm text-muted">
                      {sets.length} × {ex.reps} · {ex.rest_seconds}s rest
                    </span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-muted">{count}/{sets.length}</span>
                  <ChevronDown size={18} className={`text-muted transition ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-4">
                        {sets.map((set) => (
                          <motion.button
                            key={set.id}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => toggleSet(ex, set)}
                            disabled={complete}
                            aria-pressed={set.completed}
                            data-set-id={set.id}
                            className={`relative flex flex-col items-center gap-1 rounded-xl border py-3 transition disabled:cursor-default ${
                              set.completed
                                ? 'border-transparent bg-gradient-to-br from-[#C6FF3D] to-[#7DFFA0] text-[#0A0D12] shadow-glow'
                                : 'border-line/10 bg-line/5 hover:border-lime/40'
                            }`}
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {set.completed ? (
                                <motion.span key="c" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                                  <Check size={22} strokeWidth={3} />
                                </motion.span>
                              ) : (
                                <motion.span key="n" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="font-display text-lg font-bold">
                                  {set.set_number}
                                </motion.span>
                              )}
                            </AnimatePresence>
                            <span className={`text-xs ${set.completed ? 'text-[#0A0D12]/70' : 'text-muted'}`}>
                              Set {set.set_number} · {ex.reps}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}

          {complete && !showCelebration && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass flex flex-wrap items-center gap-4 !rounded-2xl p-4">
              <Trophy className="text-lime" />
              <p className="flex-1 font-medium">Workout saved. Great session!</p>
              <button onClick={() => navigate('library')} className="btn-ghost text-sm">
                <Library size={16} /> Plan another
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {showCelebration && <Celebration stats={stats} streak={userStats?.streak ?? 0} onClose={() => setShowCelebration(false)} />}
        </AnimatePresence>,
        document.body,
      )}
    </Page>
  )
}
