import { useMemo, useState } from 'react'
import { getCategory } from '../data/categories'
import './DonutChart.css'

export interface DonutSegment {
  id: string
  name: string
  color: string
  amount: number
  subs: { name: string; amount: number }[]
}

interface DonutChartProps {
  segments: DonutSegment[]
  total: number
  centerLabel?: string
}

const R = 88
const C = 2 * Math.PI * R

export function DonutChart({ segments, total, centerLabel = '总开销' }: DonutChartProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = segments.find((s) => s.id === activeId)

  const rings = useMemo(() => {
    if (total <= 0) return []
    let offset = 0
    return segments.map((seg) => {
      const len = (seg.amount / total) * C
      const ring = {
        ...seg,
        dash: `${len} ${C - len}`,
        dashOffset: C - offset,
        pct: seg.amount / total,
      }
      offset += len
      return ring
    })
  }, [segments, total])

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 200 200" className="donut-svg">
        <circle cx="100" cy="100" r={R} fill="var(--cream-deep)" />
        <g transform="rotate(-90 100 100)">
          {rings.map((ring) => (
            <circle
              key={ring.id}
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={ring.color}
              strokeWidth={activeId === ring.id ? 28 : 22}
              strokeDasharray={ring.dash}
              strokeDashoffset={ring.dashOffset}
              strokeLinecap="butt"
              className="donut-arc"
              style={{
                cursor: 'pointer',
                opacity: activeId && activeId !== ring.id ? 0.4 : 1,
                transition: 'opacity 0.2s, stroke-width 0.2s',
              }}
              onClick={() => setActiveId(activeId === ring.id ? null : ring.id)}
            />
          ))}
        </g>
        <circle cx="100" cy="100" r="58" fill="var(--cream)" />
        <text x="100" y="92" textAnchor="middle" className="donut-center-label">
          {centerLabel}
        </text>
        <text x="100" y="118" textAnchor="middle" className="donut-center-value">
          ¥{total.toFixed(0)}
        </text>
      </svg>

      <div className="donut-legend">
        {segments.map((seg) => (
          <button
            key={seg.id}
            type="button"
            className={`legend-row ${activeId === seg.id ? 'active' : ''}`}
            onClick={() => setActiveId(activeId === seg.id ? null : seg.id)}
          >
            <span className="legend-dot" style={{ background: seg.color }} />
            <span className="legend-name">{seg.name}</span>
            <span className="legend-amt">¥{seg.amount.toFixed(0)}</span>
            <span className="legend-pct">{((seg.amount / total) * 100).toFixed(0)}%</span>
          </button>
        ))}
      </div>

      {active && active.subs.length > 0 && (
        <div className="sub-detail-panel">
          <p className="sub-detail-title">
            <span style={{ color: getCategory(active.id)?.color }}>{active.name}</span> · 细项明细
          </p>
          <ul>
            {active.subs.map((sub) => (
              <li key={sub.name}>
                <span>{sub.name}</span>
                <span>¥{sub.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
