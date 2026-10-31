import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, CalendarX2, Check, Clock, UserRound, Users } from 'lucide-react'
import { useState } from 'react'
import { EmptyState, Page, PageHeader } from '../components/ui'
import { useApp } from '../context/AppContext'
import { CLASSES, CLASS_TYPES, WEEK_DAYS } from '../data'

const WEEKLY_LIMIT = 5

const TYPE_STYLE = {
  violet: { chip: 'bg-violet/15 text-violet border-violet/25', bar: 'from-violet to-[#F472B6]', glow: 'bg-violet/25' },
  ember: { chip: 'bg-ember/15 text-ember border-ember/25', bar: 'from-ember to-[#FFB347]', glow: 'bg-ember/25' },
  cyan: { chip: 'bg-cyan/15 text-cyan border-cyan/25', bar: 'from-cyan to-[#5B8CFF]', glow: 'bg-cyan/25' },
  lime: { chip: 'bg-lime/15 text-lime border-lime/25', bar: 'from-lime to-cyan', glow: 'bg-lime/25' },
}

function todayKey() {
  const d = new Date().getDay() // 0 = Sun
  return WEEK_DAYS[(d + 6) % 7]
}

export default function Classes() {
  const { bookings, setBookings, toast } = useApp()
  const [day, setDay] = useState(todayKey)
  const [type, setType] = useState('All')

  const list = CLASSES.filter((c) => c.day === day && (type === 'All' || c.type === type))

  const book = (c) => {
    if (bookings.includes(c.id)) {
      setBookings(bookings.filter((b) => b !== c.id))
      toast({ type: 'info', title: 'Booking cancelled', message: `Your spot in ${c.title} has been released.` })
      return
    }
    if (c.spots === 0) {
      toast({ type: 'info', title: 'You’re on the waitlist', message: `${c.title} is full — we’ll ping you the moment a spot opens.` })
      return
    }
    if (bookings.length >= WEEKLY_LIMIT) {
      toast({
        type: 'error',
        title: 'Weekly limit reached',
        message: `Your plan includes ${WEEKLY_LIMIT} classes a week. Cancel one to book another.`,
      })
      return
    }
    setBookings([...bookings, c.id])
    toast({ title: 'You’re booked! 🎉', message: `${c.title} · ${c.day} ${c.time} with ${c.coach}` })
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Class booking"
        title="Sweat with the squad"
        subtitle="Live classes all week. Spots go fast — grab yours."
        action={
          <div className="glass flex items-center gap-3 !rounded-2xl px-4 py-3">
            <CalendarCheck className="text-lime" size={20} />
            <div>
              <p className="font-display text-lg font-bold leading-none tabular-nums">
                {bookings.length}/{WEEKLY_LIMIT}
              </p>
              <p className="text-xs text-muted">booked this week</p>
            </div>
          </div>
        }
      />

      {/* Day picker */}
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {WEEK_DAYS.map((d) => {
          const active = d === day
          const n = CLASSES.filter((c) => c.day === d).length
          const hasBooking = CLASSES.some((c) => c.day === d && bookings.includes(c.id))
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`relative flex min-w-[64px] flex-1 flex-col items-center rounded-2xl border px-3 py-3 transition ${
                active ? 'border-transparent text-[#0A0D12]' : 'border-line/10 bg-line/5 text-muted hover:text-ink'
              }`}
            >
              {active && (
                <motion.span layoutId="day-pill" className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#C6FF3D] to-[#22E4FF] shadow-glow" />
              )}
              <span className="relative text-xs font-semibold uppercase tracking-wider">{d}</span>
              <span className="relative font-display text-xl font-bold">{n}</span>
              {hasBooking && <span className={`relative mt-0.5 h-1.5 w-1.5 rounded-full ${active ? 'bg-[#0A0D12]' : 'bg-lime'}`} />}
            </button>
          )
        })}
      </div>

      {/* Type filter */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {['All', ...Object.keys(CLASS_TYPES)].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`chip shrink-0 border px-4 py-2.5 text-sm transition ${
              type === t ? 'border-lime/40 bg-lime/15 text-lime' : 'border-line/10 bg-line/5 text-muted hover:text-ink'
            }`}
          >
            {t !== 'All' && <span>{CLASS_TYPES[t].emoji}</span>} {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {list.length === 0 ? (
          <EmptyState
            key="empty"
            icon={CalendarX2}
            title={`No ${type === 'All' ? '' : type + ' '}classes on ${day}`}
            message="Rest days are part of the plan too. Or check another day — there’s plenty going on."
            action={
              <button className="btn-ghost" onClick={() => setType('All')}>
                Show all classes
              </button>
            }
          />
        ) : (
          <motion.div
            key={day + type}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="grid gap-4 md:grid-cols-2"
          >
            {list.map((c) => {
              const meta = CLASS_TYPES[c.type]
              const s = TYPE_STYLE[meta.color]
              const booked = bookings.includes(c.id)
              const spots = c.spots - (booked ? 1 : 0)
              const full = c.spots === 0
              const filled = (c.capacity - spots) / c.capacity
              return (
                <motion.article
                  key={c.id}
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                  className={`glass glass-hover relative overflow-hidden p-5 ${booked ? '!border-lime/40' : ''}`}
                >
                  <div className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full ${s.glow} blur-3xl`} />
                  <div className="relative flex gap-4">
                    <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-line/10 bg-line/5 py-3">
                      <span className="font-display text-lg font-bold tabular-nums">{c.time}</span>
                      <span className="text-[11px] text-muted">{c.duration} min</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`chip border ${s.chip}`}>
                          {meta.emoji} {c.type}
                        </span>
                        <span className="text-xs text-muted">Intensity: {meta.intensity}</span>
                      </div>
                      <h3 className="mt-2 truncate text-lg font-semibold">{c.title}</h3>
                      <p className="mt-0.5 flex items-center gap-3 text-sm text-muted">
                        <span className="flex items-center gap-1"><UserRound size={14} /> {c.coach}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {c.duration}m</span>
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-4">
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted"><Users size={13} /> {c.capacity - spots}/{c.capacity}</span>
                      <span className={`font-semibold ${full ? 'text-ember' : spots <= 3 ? 'text-ember' : 'text-lime'}`}>
                        {full ? 'Full' : spots === 0 ? 'You got the last spot!' : `${spots} spot${spots === 1 ? '' : 's'} left`}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-line/10">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${s.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${filled * 100}%` }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => book(c)}
                    className={`relative mt-4 w-full ${
                      booked ? 'btn border border-lime/40 bg-lime/10 text-lime hover:bg-lime/20' : full ? 'btn-ghost text-muted' : 'btn-primary'
                    }`}
                  >
                    {booked ? (
                      <>
                        <Check size={18} strokeWidth={3} /> Booked · tap to cancel
                      </>
                    ) : full ? (
                      'Full — join waitlist'
                    ) : (
                      'Book spot'
                    )}
                  </button>
                </motion.article>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  )
}
