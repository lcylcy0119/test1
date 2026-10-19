import type { CpmResult } from '../../lib/cpm'

interface Props {
  names: Record<string, string>
  rows: CpmResult[]
  total: number
  highlightCritical?: boolean
}

export default function GanttChart({ names, rows, total, highlightCritical }: Props) {
  const days = Math.max(total, 1)
  const ticks = Array.from({ length: days }, (_, i) => i + 1)

  return (
    <div className="gantt-wrap">
      <div className="gantt" style={{ gridTemplateColumns: `160px repeat(${days}, minmax(18px, 1fr))` }}>
        <div className="gantt-corner">공종</div>
        {ticks.map((d) => (
          <div key={d} className="gantt-tick">
            {d % 5 === 0 || d === 1 ? d : ''}
          </div>
        ))}
        {rows.map((row) => (
          <GanttRow
            key={row.id}
            name={names[row.id] ?? row.id}
            row={row}
            days={days}
            highlightCritical={highlightCritical}
          />
        ))}
      </div>
    </div>
  )
}

function GanttRow({
  name,
  row,
  days,
  highlightCritical,
}: {
  name: string
  row: CpmResult
  days: number
  highlightCritical?: boolean
}) {
  return (
    <>
      <div className={`gantt-name ${row.critical && highlightCritical ? 'crit' : ''}`}>{name}</div>
      {Array.from({ length: days }, (_, i) => {
        const dayStart = i
        const filled = dayStart >= row.es && dayStart < row.ef
        const cls = [
          'gantt-cell',
          filled ? 'filled' : '',
          filled && row.critical && highlightCritical ? 'crit-bar' : '',
        ]
          .filter(Boolean)
          .join(' ')
        return <div key={i} className={cls} title={`${name} ${row.es}~${row.ef}일`} />
      })}
    </>
  )
}
