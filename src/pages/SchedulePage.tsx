import { useEffect, useMemo, useState } from 'react'
import GanttChart from '../components/schedule/GanttChart'
import {
  expectedDuration,
  requiredWorks,
  sampleProject,
  workItems,
} from '../data/sampleProject'
import { computeCpm } from '../lib/cpm'
import {
  clearScheduleDraft,
  loadScheduleDraft,
  saveScheduleDraft,
  type ScheduleDraft,
} from '../lib/storage'

const STEPS = ['공종 분해', '작업일수', '선후관계', '횡선식', '주공정']

const emptyPred: Record<string, string[]> = {}
for (const w of requiredWorks) emptyPred[w.id] = []

export default function SchedulePage() {
  const [step, setStep] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [durations, setDurations] = useState<Record<string, number>>({})
  const [predecessors, setPredecessors] = useState<Record<string, string[]>>({ ...emptyPred })
  const [wbsChecked, setWbsChecked] = useState(false)
  const [durChecked, setDurChecked] = useState(false)
  const [logicChecked, setLogicChecked] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const draft = loadScheduleDraft()
    if (draft) {
      setStep(draft.step)
      setSelectedIds(draft.selectedIds)
      setDurations(draft.durations)
      setPredecessors(draft.predecessors)
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const draft: ScheduleDraft = { step, selectedIds, durations, predecessors }
    saveScheduleDraft(draft)
  }, [step, selectedIds, durations, predecessors, ready])

  const requiredIdSet = useMemo(() => new Set(requiredWorks.map((w) => w.id)), [])
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const wbsPerfect =
    requiredWorks.every((w) => selectedSet.has(w.id)) &&
    selectedIds.every((id) => requiredIdSet.has(id))

  const durationRows = requiredWorks.filter((w) => selectedSet.has(w.id))
  const durationOk =
    durationRows.length === requiredWorks.length &&
    durationRows.every((w) => durations[w.id] === expectedDuration(w))

  const logicOk = requiredWorks.every((w) => {
    const mine = [...(predecessors[w.id] ?? [])].sort().join(',')
    const ans = [...w.predecessors].sort().join(',')
    return mine === ans
  })

  const cpmItems = requiredWorks.map((w) => ({
    id: w.id,
    duration: durations[w.id] || expectedDuration(w),
    predecessors: predecessors[w.id] ?? [],
  }))
  const cpm = computeCpm(cpmItems)
  const names = Object.fromEntries(workItems.map((w) => [w.id, w.name]))
  const modelCpm = computeCpm(
    requiredWorks.map((w) => ({
      id: w.id,
      duration: expectedDuration(w),
      predecessors: w.predecessors,
    })),
  )

  function toggleWork(id: string) {
    setWbsChecked(false)
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function resetAll() {
    clearScheduleDraft()
    setStep(0)
    setSelectedIds([])
    setDurations({})
    setPredecessors({ ...emptyPred })
    setWbsChecked(false)
    setDurChecked(false)
    setLogicChecked(false)
  }

  return (
    <div className="stack">
      <header className="page-head">
        <h1>공정표 제작 실습</h1>
        <p>{sampleProject.title} — 5단계로 횡선식 공정표 한 장을 완성합니다.</p>
      </header>

      <ol className="wizard-nav">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              className={i === step ? 'wizard-step active' : 'wizard-step'}
              onClick={() => setStep(i)}
            >
              <span>{i + 1}</span>
              {label}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section className="panel">
          <h2>1. 공사 파악 · 공종 분해</h2>
          <p className="brief">{sampleProject.summary}</p>
          <ul className="note-list">
            {sampleProject.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p>이 공사에 필요한 공종만 고르세요. 불필요한 공종은 빼야 합니다.</p>
          <div className="check-grid">
            {workItems.map((w) => (
              <label key={w.id} className="check-card">
                <input
                  type="checkbox"
                  checked={selectedSet.has(w.id)}
                  onChange={() => toggleWork(w.id)}
                />
                <span>{w.name}</span>
              </label>
            ))}
          </div>
          <div className="actions">
            <button type="button" className="btn primary" onClick={() => setWbsChecked(true)}>
              모범답안과 비교
            </button>
            {wbsPerfect && (
              <button type="button" className="btn" onClick={() => setStep(1)}>
                다음: 작업일수
              </button>
            )}
          </div>
          {wbsChecked && (
            <div className={`feedback ${wbsPerfect ? 'good' : 'bad'}`}>
              {wbsPerfect ? (
                <p>필요한 11개 공종을 모두 골랐습니다. 파일기초와 커튼월은 이 공사에 넣지 않습니다.</p>
              ) : (
                <div>
                  <p>빠진 공종 또는 불필요 공종이 있습니다.</p>
                  <ul>
                    {requiredWorks
                      .filter((w) => !selectedSet.has(w.id))
                      .map((w) => (
                        <li key={w.id}>추가 필요: {w.name}</li>
                      ))}
                    {workItems
                      .filter((w) => !w.required && selectedSet.has(w.id))
                      .map((w) => (
                        <li key={w.id}>
                          제외: {w.name} — {w.distractorReason}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {step === 1 && (
        <section className="panel">
          <h2>2. 작업일수 산정</h2>
          <p>
            공식: <code>작업일수 = 수량 ÷ 1일 시공량</code> (소수점 올림, 최소 1일). 1식 공사는 제시
            일수를 그대로 입력합니다.
          </p>
          {!wbsPerfect && (
            <p className="warn">1단계에서 필요 공종을 모두 고른 뒤 일수를 입력하는 것이 좋습니다.</p>
          )}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>공종</th>
                  <th>수량</th>
                  <th>1일 시공량</th>
                  <th>작업일수</th>
                </tr>
              </thead>
              <tbody>
                {requiredWorks.map((w) => (
                  <tr key={w.id}>
                    <td>{w.name}</td>
                    <td>
                      {w.quantityLabel}
                      {w.lumpDays == null ? w.unit : ''}
                    </td>
                    <td>{w.dailyOutputLabel}</td>
                    <td>
                      <input
                        className="num-input"
                        type="number"
                        min={1}
                        value={durations[w.id] ?? ''}
                        onChange={(e) => {
                          setDurChecked(false)
                          const v = Number(e.target.value)
                          setDurations((d) => ({ ...d, [w.id]: v }))
                        }}
                      />
                      일
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                const next: Record<string, number> = {}
                for (const w of requiredWorks) next[w.id] = expectedDuration(w)
                setDurations(next)
              }}
            >
              계산 채우기
            </button>
            <button type="button" className="btn primary" onClick={() => setDurChecked(true)}>
              채점
            </button>
            {durationOk && (
              <button type="button" className="btn" onClick={() => setStep(2)}>
                다음: 선후관계
              </button>
            )}
          </div>
          {durChecked && (
            <div className={`feedback ${durationOk ? 'good' : 'bad'}`}>
              {durationOk ? (
                <p>작업일수가 모두 맞습니다. 예: 토공사 800÷100=8일, 골조 450÷30=15일.</p>
              ) : (
                <ul>
                  {requiredWorks
                    .filter((w) => durations[w.id] !== expectedDuration(w))
                    .map((w) => (
                      <li key={w.id}>
                        {w.name}: 정답 {expectedDuration(w)}일
                        {w.lumpDays != null
                          ? ` (1식 ${w.lumpDays}일)`
                          : ` (${w.quantity}÷${w.dailyOutput}, 올림)`}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="panel">
          <h2>3. 선후관계 설정</h2>
          <p>각 공종이 시작하려면 먼저 끝나야 하는 공종을 고르세요. 관계는 완료 후 착수(FS)입니다.</p>
          <div className="logic-list">
            {requiredWorks.map((w) => (
              <div key={w.id} className="logic-row">
                <strong>{w.name}</strong>
                <div className="pred-pills">
                  {requiredWorks
                    .filter((p) => p.id !== w.id)
                    .map((p) => {
                      const on = (predecessors[w.id] ?? []).includes(p.id)
                      return (
                        <button
                          key={p.id}
                          type="button"
                          className={on ? 'pill on' : 'pill'}
                          onClick={() => {
                            setLogicChecked(false)
                            setPredecessors((prev) => {
                              const cur = new Set(prev[w.id] ?? [])
                              if (cur.has(p.id)) cur.delete(p.id)
                              else cur.add(p.id)
                              return { ...prev, [w.id]: [...cur] }
                            })
                          }}
                        >
                          {p.name}
                        </button>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
          <div className="actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                const next: Record<string, string[]> = {}
                for (const w of requiredWorks) next[w.id] = [...w.predecessors]
                setPredecessors(next)
              }}
            >
              모범 선후관계 채우기
            </button>
            <button type="button" className="btn primary" onClick={() => setLogicChecked(true)}>
              채점
            </button>
            <button type="button" className="btn" onClick={() => setStep(3)}>
              다음: 횡선식
            </button>
          </div>
          {logicChecked && (
            <div className={`feedback ${logicOk ? 'good' : 'bad'}`}>
              {logicOk ? (
                <p>선후관계가 모범답안과 같습니다. 골조 이후 조적·방수·창호·외장·설비가 병행됩니다.</p>
              ) : (
                <ul>
                  {requiredWorks
                    .filter((w) => {
                      const mine = [...(predecessors[w.id] ?? [])].sort().join(',')
                      const ans = [...w.predecessors].sort().join(',')
                      return mine !== ans
                    })
                    .map((w) => (
                      <li key={w.id}>
                        {w.name}의 선행:{' '}
                        {w.predecessors.length
                          ? w.predecessors.map((id) => names[id]).join(', ')
                          : '없음 (가설)'}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}

      {step === 3 && (
        <section className="panel">
          <h2>4. 횡선식 공정표 작성</h2>
          <p>
            입력한 작업일수와 선후관계로 바차트(간트)를 그립니다. 막대 길이가 기간, 왼쪽 끝이
            착수일(선행 완료 직후)입니다.
          </p>
          <GanttChart names={names} rows={cpm.rows} total={cpm.total} />
          <p className="meta">현재 입력 기준 총공기: {cpm.total}일</p>
          <div className="actions">
            <button type="button" className="btn primary" onClick={() => setStep(4)}>
              다음: 주공정 확인
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="panel">
          <h2>5. 주공정 · 총공기 확인</h2>
          <p>
            주공정은 여유시간(Float)이 0인 경로입니다. 이 경로가 하루 늦으면 준공도 하루 늦습니다.
            붉은 막대가 주공정입니다.
          </p>
          <GanttChart names={names} rows={cpm.rows} total={cpm.total} highlightCritical />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>공종</th>
                  <th>ES</th>
                  <th>EF</th>
                  <th>LS</th>
                  <th>LF</th>
                  <th>여유</th>
                  <th>주공정</th>
                </tr>
              </thead>
              <tbody>
                {cpm.rows.map((row) => (
                  <tr key={row.id} className={row.critical ? 'crit-row' : ''}>
                    <td>{names[row.id]}</td>
                    <td>{row.es}</td>
                    <td>{row.ef}</td>
                    <td>{row.ls}</td>
                    <td>{row.lf}</td>
                    <td>{row.float}</td>
                    <td>{row.critical ? '예' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="feedback good">
            <p>
              현재 표의 총공기 <strong>{cpm.total}일</strong>
              {logicOk && durationOk
                ? ` (모범답안 ${modelCpm.total}일과 동일해야 합니다). 주공정 예: 가설 → 토공 → 기초 → 골조 → 조적 → 내장 → 준공.`
                : '. 1~3단계 답이 모범과 다르면 총공기도 달라질 수 있습니다.'}
            </p>
          </div>
          <div className="actions">
            <button type="button" className="btn" onClick={resetAll}>
              실습 처음부터
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
