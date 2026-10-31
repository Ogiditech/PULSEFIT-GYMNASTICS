import { motion } from 'framer-motion'
import { Award, Medal, TrendingUp, Trophy } from 'lucide-react'
import { useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import AnimatedCounter from '../components/AnimatedCounter'
import ChartTooltip from '../components/ChartTooltip'
import { Card, Page, PageHeader, stagger } from '../components/ui'
import { useChartColors } from '../context/AppContext'
import { PERSONAL_RECORDS, STRENGTH_PROGRESS } from '../data'

const LIFTS = [
  { key: 'deadlift', name: 'Deadlift' },
  { key: 'squat', name: 'Squat' },
  { key: 'bench', name: 'Bench' },
]

const RANGES = { '4W': 4, '8W': 8, '12W': 12 }

const TIER = {
  gold: { label: 'Gold', grad: 'from-[#FFE27A] to-[#F5A524]', Icon: Trophy, glow: 'shadow-[0_0_30px_-6px_rgba(245,165,36,0.6)]' },
  silver: { label: 'Silver', grad: 'from-[#F1F5F9] to-[#94A3B8]', Icon: Medal, glow: 'shadow-[0_0_30px_-8px_rgba(148,163,184,0.6)]' },
  bronze: { label: 'Bronze', grad: 'from-[#F6C59B] to-[#C2703D]', Icon: Award, glow: 'shadow-[0_0_30px_-8px_rgba(194,112,61,0.6)]' },
}

function EndLabel({ x, y, index, value, name, count, color }) {
  if (index !== count - 1) return null
  return (
    <g>
      <circle cx={x + 12} cy={y} r={4} fill={color} />
      <text x={x + 21} y={y} dy={4} fontSize={12} fontWeight={600} style={{ fill: 'rgb(var(--ink))' }}>
        {name} {value}
      </text>
    </g>
  )
}

function StrengthChart() {
  const c = useChartColors()
  const [range, setRange] = useState('12W')
  const data = STRENGTH_PROGRESS.slice(-RANGES[range])

  return (
    <Card className="lg:col-span-3">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Strength gains</h3>
          <p className="text-sm text-muted">Top working set, kg</p>
        </div>
        <div className="flex rounded-xl border border-line/10 bg-line/5 p-1 text-sm">
          {Object.keys(RANGES).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`relative rounded-lg px-3 py-2.5 font-medium transition ${range === r ? 'text-[#0A0D12]' : 'text-muted hover:text-ink'}`}
            >
              {range === r && <motion.span layoutId="range-pill" className="absolute inset-0 rounded-lg bg-lime" />}
              <span className="relative">{r}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart key={range} data={data} margin={{ top: 10, right: 92, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={c.grid} />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: c.axis, fontSize: 12 }} interval="preserveStartEnd" />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: c.axis, fontSize: 12 }} domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip
              cursor={{ stroke: c.axis, strokeWidth: 1, strokeDasharray: '4 4' }}
              content={<ChartTooltip unit=" kg" />}
            />
            <Legend
              verticalAlign="top"
              align="left"
              height={32}
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span style={{ color: c.axis, fontSize: 12 }}>{v}</span>}
            />
            {LIFTS.map((l, i) => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                name={l.name}
                stroke={c.series[i]}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: c.surface, fill: c.series[i] }}
                animationDuration={1500 + i * 250}
                label={<EndLabel name={l.name} count={data.length} color={c.series[i]} />}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export default function Progress() {
  const first = STRENGTH_PROGRESS[0]
  const last = STRENGTH_PROGRESS.at(-1)
  const gains = LIFTS.map((l) => ({ ...l, gain: last[l.key] - first[l.key], pct: ((last[l.key] - first[l.key]) / first[l.key]) * 100 }))
  const total = gains.reduce((a, g) => a + g.gain, 0)

  return (
    <Page>
      <PageHeader
        eyebrow="Progress"
        title="Proof you’re getting stronger"
        subtitle="Twelve weeks of consistent training, charted. Every line going up is a rep you didn’t skip."
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime/25 blur-3xl" />
          <p className="label">Total added (big 3)</p>
          <p className="mt-2 font-display text-5xl font-bold">
            +<AnimatedCounter to={total} decimals={1} />
            <span className="ml-1 text-xl text-muted">kg</span>
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-lime">
            <TrendingUp size={16} /> in 12 weeks
          </p>
        </Card>
        {gains.slice(0, 2).map((g) => (
          <Card key={g.key}>
            <p className="label">{g.name}</p>
            <p className="mt-2 font-display text-4xl font-bold tabular-nums">
              {last[g.key]}
              <span className="ml-1 text-lg text-muted">kg</span>
            </p>
            <p className="mt-2 text-sm text-muted">
              <span className="font-semibold text-lime">+{g.gain} kg</span> · {g.pct.toFixed(0)}% stronger
            </p>
          </Card>
        ))}

        <StrengthChart />

        <div className="lg:col-span-3">
          <div className="mb-4 mt-4 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Personal records</h2>
            <span className="text-sm text-muted">{PERSONAL_RECORDS.length} PRs</span>
          </div>
          <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PERSONAL_RECORDS.map((pr) => {
              const t = TIER[pr.tier]
              return (
                <Card key={pr.lift} hover className="flex items-center gap-4 !p-5">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${t.grad} ${t.glow} text-[#1A1205]`}
                  >
                    <t.Icon size={28} />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-muted">{pr.lift}</p>
                      <span className="chip bg-line/5 !px-2 !py-0.5 text-[10px] uppercase tracking-wider text-muted">{t.label}</span>
                    </div>
                    <p className="font-display text-2xl font-bold tabular-nums">{pr.value}</p>
                    <p className="text-xs text-muted">
                      <span className="font-semibold text-lime">{pr.delta}</span> · {pr.date}
                    </p>
                  </div>
                </Card>
              )
            })}
          </motion.div>
        </div>
      </motion.div>
    </Page>
  )
}
