import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const STYLES = {
  success: { Icon: CheckCircle2, ring: 'text-lime', bar: 'bg-lime' },
  error: { Icon: AlertTriangle, ring: 'text-ember', bar: 'bg-ember' },
  info: { Icon: Info, ring: 'text-cyan', bar: 'bg-cyan' },
}

export default function Toasts() {
  const { toasts, dismissToast } = useApp()
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:right-6 md:top-6 md:items-end"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const s = STYLES[t.type] ?? STYLES.info
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="glass pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden !rounded-2xl p-4 pr-10"
            >
              <s.Icon className={`mt-0.5 shrink-0 ${s.ring}`} size={20} />
              <div className="min-w-0">
                <p className="font-display font-semibold">{t.title}</p>
                {t.message && <p className="mt-0.5 text-sm text-muted">{t.message}</p>}
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="absolute right-3 top-3 rounded-lg p-1 text-muted hover:bg-line/10 hover:text-ink"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
              <motion.span
                className={`absolute bottom-0 left-0 h-0.5 ${s.bar}`}
                initial={{ width: '100%' }}
                animate={{ width: 0 }}
                transition={{ duration: (t.duration ?? 3800) / 1000, ease: 'linear' }}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
