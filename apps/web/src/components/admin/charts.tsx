'use client'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

/** Palette FETRAG issue du logo (bleu, vert, or, marine) pour toutes les séries. */
export const chartColors = {
  blue: '#0259C7',
  green: '#9CC102',
  gold: '#F9C804',
  navy: '#042768',
  neutral: '#c5cbd9',
} as const

const palette = [chartColors.blue, chartColors.green, chartColors.gold, chartColors.navy, '#7fabee', '#c1dc57']

const axisStyle = { fontSize: 11, fill: '#6b7591', fontFamily: 'var(--font-manrope), system-ui, sans-serif' }
const tooltipStyle = { borderRadius: 12, border: '1px solid #dfe3ec', boxShadow: '0 8px 24px rgba(4,39,104,0.12)', fontSize: 12, fontFamily: 'var(--font-manrope), system-ui, sans-serif' }

function formatNumberFr(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value)
}

function shortDay(day: string): string {
  const d = new Date(`${day}T00:00:00Z`)
  return Number.isNaN(d.getTime()) ? day : new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(d)
}

function shortMonth(month: string): string {
  const d = new Date(`${month}-01T00:00:00Z`)
  return Number.isNaN(d.getTime()) ? month : new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(d)
}

export interface VisitsChartProps {
  data: Array<{ day: string; views: number; visitors: number }>
  height?: number
}

/** Visites des 30 derniers jours : pages vues (bleu) et visiteurs uniques (vert). */
export function VisitsChart({ data, height = 240 }: VisitsChartProps) {
  return (
    <div style={{ height }} role="img" aria-label="Évolution des visites sur 30 jours">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="fetrag-views" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.blue} stopOpacity={0.35} />
              <stop offset="100%" stopColor={chartColors.blue} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fetrag-visitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.green} stopOpacity={0.4} />
              <stop offset="100%" stopColor={chartColors.green} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#eef0f6" vertical={false} />
          <XAxis dataKey="day" tickFormatter={shortDay} tick={axisStyle} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(label) => shortDay(String(label))}
            formatter={(value, name) => [formatNumberFr(Number(value)), name === 'views' ? 'Pages vues' : 'Visiteurs']}
          />
          <Legend iconType="circle" formatter={(value) => (value === 'views' ? 'Pages vues' : 'Visiteurs uniques')} wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="views" stroke={chartColors.blue} strokeWidth={2} fill="url(#fetrag-views)" />
          <Area type="monotone" dataKey="visitors" stroke={chartColors.green} strokeWidth={2} fill="url(#fetrag-visitors)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export interface BarSeries {
  key: string
  label: string
  color?: string
}

export interface SimpleBarChartProps {
  data: Array<Record<string, string | number>>
  xKey: string
  series: BarSeries[]
  height?: number
  /** Formate l'axe X (`month` → « sept. 26 »). */
  xFormat?: 'month' | 'day' | 'raw'
  /** Formatage des valeurs (montants XAF, nombres). */
  valueFormat?: 'money' | 'number'
  ariaLabel: string
  stacked?: boolean
}

/** Histogramme générique (ventes mensuelles, formulaires par type, demandes par statut). */
export function SimpleBarChart({ data, xKey, series, height = 240, xFormat = 'raw', valueFormat = 'number', ariaLabel, stacked = false }: SimpleBarChartProps) {
  const format = (value: number) => (valueFormat === 'money' ? `${formatNumberFr(value)} FCFA` : formatNumberFr(value))
  const tick = (value: string) => (xFormat === 'month' ? shortMonth(value) : xFormat === 'day' ? shortDay(value) : value)
  return (
    <div style={{ height }} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barCategoryGap={series.length > 1 ? '25%' : '35%'}>
          <CartesianGrid stroke="#eef0f6" vertical={false} />
          <XAxis dataKey={xKey} tickFormatter={tick} tick={axisStyle} axisLine={false} tickLine={false} minTickGap={16} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} tickFormatter={(v) => (valueFormat === 'money' ? `${Math.round(Number(v) / 1000)}k` : String(v))} />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: 'rgba(2,89,199,0.06)' }}
            labelFormatter={(label) => tick(String(label))}
            formatter={(value, name) => [format(Number(value)), series.find((s) => s.key === name)?.label ?? String(name)]}
          />
          {series.length > 1 ? <Legend iconType="circle" formatter={(value) => series.find((s) => s.key === value)?.label ?? value} wrapperStyle={{ fontSize: 12 }} /> : null}
          {series.map((s, index) => (
            <Bar key={s.key} dataKey={s.key} fill={s.color ?? palette[index % palette.length]} radius={[6, 6, 0, 0]} stackId={stacked ? 'stack' : undefined} maxBarSize={42} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export interface DonutChartProps {
  data: Array<{ name: string; value: number }>
  height?: number
  ariaLabel: string
  valueFormat?: 'money' | 'number'
}

/** Répartition en anneau (écho de l'anneau du logo) : moyens de paiement, statuts. */
export function DonutChart({ data, height = 220, ariaLabel, valueFormat = 'number' }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const format = (value: number) => (valueFormat === 'money' ? `${formatNumberFr(value)} FCFA` : formatNumberFr(value))
  return (
    <div style={{ height }} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={2} stroke="#fff" strokeWidth={2}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${format(Number(value))} (${total ? Math.round((Number(value) / total) * 100) : 0} %)`, String(name)]} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
