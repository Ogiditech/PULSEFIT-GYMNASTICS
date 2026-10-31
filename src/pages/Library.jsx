import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Check, Dumbbell, Flame, Footprints, HeartPulse, Layers, Loader2, Play, Plus, Search, SearchX, Shield, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState, ErrorState, LevelBadge, Page, PageHeader, Skeleton, SkeletonCard } from '../components/ui'
import { useApp } from '../context/AppContext'
import { MUSCLE_GROUPS } from '../data'
import { api, useApi } from '../lib/api'

const GROUP_META = {
  All: { Icon: Layers, tint: 'from-lime/30 to-cyan/20' },
  Chest: { Icon: Shield, tint: 'from-lime/30 to-lime/5' },
  Back: { Icon: Activity, tint: 'from-cyan/30 to-cyan/5' },
  Legs: { Icon: Footprints, tint: 'from-violet/30 to-violet/5' },
  Arms: { Icon: Dumbbell, tint: 'from-ember/30 to-ember/5' },
  Core: { Icon: Zap, tint: 'from-lime/25 to-cyan/10' },
  Cardio: { Icon: HeartPulse, tint: 'from-ember/30 to-violet/10' },
}

function formatRest(s) {
  return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`
}

function LibrarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} className="!p-5">
          <div className="flex justify-between">
            <Skeleton className="h-12 w-12 !rounded-2xl" />
            <Skeleton className="h-6 w-24 !rounded-full" />
          </div>
          <Skeleton className="mt-4 h-5 w-3/4" />
          <Skeleton className="mt-2 h-4 w-full" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
          <Skeleton className="mt-4 h-10" />
        </SkeletonCard>
      ))}
    </div>
  )
}

export default function Library() {
  const { toast, navigate } = useApp()
  const exercisesReq = useApi('/exercises')
  const todayReq = useApi('/workouts/today')
  const [group, setGroup] = useState('All')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState(null)

  const exercises = exercisesReq.data?.exercises ?? []
  const todayWorkout = todayReq.data?.workout
  const editable = todayWorkout && todayWorkout.status !== 'completed'
  const inToday = useMemo(
    () => new Set(editable ? todayWorkout.exercises.map((e) => e.exercise_id) : []),
    [editable, todayWorkout],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exercises.filter(
      (e) =>
        (group === 'All' || e.muscle_group === group) &&
        (!q || e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)),
    )
  }, [exercises, group, query])

  const counts = useMemo(
    () => Object.fromEntries(MUSCLE_GROUPS.map((g) => [g, g === 'All' ? exercises.length : exercises.filter((e) => e.muscle_group === g).length])),
    [exercises],
  )

  const toggle = async (e) => {
    const adding = !inToday.has(e.id)
    setBusyId(e.id)
    try {
      const { workout } = adding
        ? await api('/workouts/today', { method: 'POST', body: { exercise_id: e.id } })
        : await api(`/workouts/today?exercise_id=${e.id}`, { method: 'DELETE' })
      todayReq.setData({ workout })
      toast(
        adding
          ? { title: 'Added to today’s workout 💪', message: `${e.name} · ${e.sets} sets × ${e.reps}` }
          : { type: 'info', title: 'Removed from today’s workout', message: e.name },
      )
    } catch (err) {
      toast({ type: 'error', title: adding ? 'Couldn’t add that one' : 'Couldn’t remove that one', message: err.message })
    } finally {
      setBusyId(null)
    }
  }

  const error = exercisesReq.error || todayReq.error
  const loading = exercisesReq.loading || todayReq.loading
  const plannedCount = inToday.size

  return (
    <Page>
      <PageHeader
        eyebrow="Workout library"
        title="Find your next move"
        subtitle={`${exercises.length || 'Coach-built'} exercises. Filter by muscle group and add them to today’s workout.`}
        action={
          plannedCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => navigate('workout')}
              className="btn-primary"
            >
              <Play size={18} className="fill-current" /> Start workout · {plannedCount}
            </motion.button>
          )
        }
      />

      <div className="relative mb-4">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises…"
          className="field pl-11"
        />
      </div>

      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {MUSCLE_GROUPS.map((g) => {
          const active = g === group
          const { Icon } = GROUP_META[g]
          return (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`relative flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                active ? 'border-transparent text-[#0A0D12]' : 'border-line/10 bg-line/5 text-muted hover:text-ink'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="group-pill"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C6FF3D] to-[#22E4FF]"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <Icon size={16} className="relative" />
              <span className="relative">{g}</span>
              <span className={`relative rounded-md px-1.5 text-[11px] ${active ? 'bg-black/10' : 'bg-line/10'}`}>{counts[g]}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <LibrarySkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={() => { exercisesReq.reload(); todayReq.reload() }} />
      ) : exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="The library is empty"
          message="No exercises in the database yet. Run “npm run db:setup” to load the starter set."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No reps found"
          message={`Nothing matches “${query}”${group !== 'All' ? ` in ${group}` : ''}. Try another word or muscle group.`}
          action={
            <button className="btn-ghost" onClick={() => { setQuery(''); setGroup('All') }}>
              Clear filters
            </button>
          }
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {results.map((e, i) => {
              const { Icon, tint } = GROUP_META[e.muscle_group]
              const added = inToday.has(e.id)
              const busy = busyId === e.id
              return (
                <motion.article
                  layout
                  key={e.id}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: Math.min(i, 12) * 0.03 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass glass-hover group relative flex flex-col overflow-hidden p-5 ${added ? '!border-lime/40' : ''}`}
                >
                  <div className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${tint} blur-2xl transition duration-500 group-hover:scale-125`} />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-line/10 bg-line/5">
                      <Icon size={22} className="text-lime" />
                    </div>
                    <LevelBadge level={e.difficulty} />
                  </div>
                  <h3 className="relative mt-4 text-lg font-semibold leading-tight">{e.name}</h3>
                  <p className="relative mt-1 line-clamp-2 text-sm text-muted">
                    <span className="font-medium text-ink/80">{e.muscle_group}</span> · {e.description}
                  </p>

                  <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
                    {[
                      ['Sets', e.sets],
                      ['Reps', e.reps],
                      ['Rest', formatRest(e.rest_seconds)],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-xl bg-line/[0.05] px-2 py-2">
                        <p className="truncate font-display text-base font-bold tabular-nums">{v}</p>
                        <p className="text-[11px] uppercase tracking-wider text-muted">{k}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => toggle(e)}
                    disabled={busy}
                    className={`relative mt-auto flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                      added
                        ? 'border-transparent bg-lime text-[#0A0D12] hover:bg-lime/80'
                        : 'border-lime/25 bg-lime/10 text-lime hover:bg-lime hover:text-[#0A0D12]'
                    }`}
                    style={{ marginTop: '1rem' }}
                  >
                    {busy ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : added ? (
                      <>
                        <Check size={16} strokeWidth={3} /> In today’s workout
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Add to today’s workout
                      </>
                    )}
                  </button>
                </motion.article>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted">
        <Flame size={14} className="text-ember" /> Tap a card’s button again to remove it from today.
      </p>
    </Page>
  )
}
