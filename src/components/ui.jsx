import { motion } from 'framer-motion'
import { CloudOff, DatabaseZap, LogIn, Quote, RotateCcw } from 'lucide-react'
import { QUOTES } from '../data'

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

/** A glass card filled with shimmering placeholder lines. */
export function SkeletonCard({ className = '', lines = 3, children }) {
  return (
    <div className={`glass p-5 md:p-6 ${className}`} aria-busy="true" aria-label="Loading">
      {children ?? (
        <>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-2/3" />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className="mt-3 h-4" />
          ))}
        </>
      )}
    </div>
  )
}

/** Friendly error card. Knows about the DB-down and logged-out cases. */
export function ErrorState({ error, onRetry }) {
  const dbDown = error?.code === 'DB_UNAVAILABLE' || error?.code === 'DB_NOT_CONFIGURED'
  const authed = error?.status === 401
  const Icon = dbDown ? DatabaseZap : authed ? LogIn : CloudOff
  const title = dbDown
    ? 'Can’t reach the database'
    : authed
      ? 'Please log in again'
      : error?.code === 'NETWORK'
        ? 'Can’t reach the server'
        : 'Something went sideways'
  return (
    <EmptyState
      icon={Icon}
      title={title}
      message={error?.message ?? 'Please try again in a moment.'}
      action={
        authed ? (
          <a href="#/login" className="btn-primary">
            <LogIn size={18} /> Log in
          </a>
        ) : (
          onRetry && (
            <button onClick={onRetry} className="btn-primary">
              <RotateCcw size={18} /> Try again
            </button>
          )
        )
      }
    />
  )
}

export function Page({ children, className = '' }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`mx-auto w-full max-w-6xl px-4 pb-12 pt-4 md:px-8 md:pb-16 md:pt-8 ${className}`}
    >
      {children}
    </motion.main>
  )
}

export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="label mb-2 !text-lime">{eyebrow}</p>}
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

export const rise = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export function Card({ children, className = '', hover = false, ...rest }) {
  return (
    <motion.div variants={rise} className={`glass p-5 md:p-6 ${hover ? 'glass-hover' : ''} ${className}`} {...rest}>
      {children}
    </motion.div>
  )
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass flex flex-col items-center px-6 py-14 text-center"
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-lime/30 blur-2xl" />
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-line/10 bg-line/5">
          <Icon className="text-lime" size={28} />
        </div>
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-muted">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}

export function QuoteOfTheDay({ className = '' }) {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % QUOTES.length
  const q = QUOTES[dayIndex]
  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet/20 blur-3xl" />
      <div className="relative flex gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet/15 text-violet">
          <Quote size={18} />
        </div>
        <div>
          <p className="label mb-1.5">Quote of the day</p>
          <p className="font-display text-lg font-medium leading-snug">“{q.text}”</p>
          <p className="mt-2 text-sm text-muted">— {q.author}</p>
        </div>
      </div>
    </Card>
  )
}

const LEVEL_STYLES = {
  Beginner: 'bg-cyan/10 text-cyan border-cyan/25',
  Intermediate: 'bg-lime/10 text-lime border-lime/25',
  Advanced: 'bg-ember/10 text-ember border-ember/25',
}

export function LevelBadge({ level }) {
  const bars = { Beginner: 1, Intermediate: 2, Advanced: 3 }[level]
  return (
    <span className={`chip border ${LEVEL_STYLES[level]}`}>
      <span className="flex items-end gap-[2px]">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[3px] rounded-sm ${i <= bars ? 'bg-current' : 'bg-current opacity-25'}`}
            style={{ height: 4 + i * 2 }}
          />
        ))}
      </span>
      {level}
    </span>
  )
}
