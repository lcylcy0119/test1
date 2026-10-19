import { useMemo, useState } from 'react'
import { examQuestions } from '../data/examQuestions'
import { addWrongId, loadWrongIds, removeWrongId } from '../lib/storage'

export default function ExamPage() {
  const [mode, setMode] = useState<'all' | 'wrong'>('all')
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [wrongTick, setWrongTick] = useState(0)

  const wrongIds = useMemo(() => loadWrongIds(), [wrongTick])
  const list = useMemo(() => {
    if (mode === 'wrong') return examQuestions.filter((q) => wrongIds.includes(q.id))
    return examQuestions
  }, [mode, wrongIds])

  const q = list[index]

  function go(nextMode: 'all' | 'wrong') {
    setMode(nextMode)
    setIndex(0)
    setPicked(null)
    setChecked(false)
  }

  function grade() {
    if (picked == null || !q) return
    setChecked(true)
    if (picked === q.answerIndex) removeWrongId(q.id)
    else addWrongId(q.id)
    setWrongTick((n) => n + 1)
  }

  function next() {
    setIndex((i) => (i + 1) % Math.max(list.length, 1))
    setPicked(null)
    setChecked(false)
  }

  return (
    <div className="stack">
      <header className="page-head">
        <h1>기출형 풀이</h1>
        <p>건축기사 시공·공정관리 경향을 반영한 유사 문항입니다. 실제 기출 원문은 아닙니다.</p>
      </header>

      <div className="filters">
        <button type="button" className={mode === 'all' ? 'chip active' : 'chip'} onClick={() => go('all')}>
          전체 {examQuestions.length}문항
        </button>
        <button
          type="button"
          className={mode === 'wrong' ? 'chip active' : 'chip'}
          onClick={() => go('wrong')}
        >
          오답노트 {wrongIds.length}
        </button>
      </div>

      {!q ? (
        <p className="panel">오답노트에 저장한 문항이 없습니다. 문제를 틀리면 여기에 모입니다.</p>
      ) : (
        <>
          <p className="meta">
            {index + 1} / {list.length} · {q.yearTag} · {q.subject}
          </p>
          <article className="panel quiz-card">
            <h2>{q.question}</h2>
            <div className="option-list">
              {q.options.map((opt, i) => (
                <label key={opt} className={`option ${picked === i ? 'picked' : ''}`}>
                  <input
                    type="radio"
                    name={q.id}
                    checked={picked === i}
                    disabled={checked}
                    onChange={() => setPicked(i)}
                  />
                  <span className="opt-num">{i + 1}</span>
                  {opt}
                </label>
              ))}
            </div>
            <div className="actions">
              {!checked ? (
                <button type="button" className="btn primary" disabled={picked == null} onClick={grade}>
                  채점
                </button>
              ) : (
                <button type="button" className="btn primary" onClick={next}>
                  다음 문제
                </button>
              )}
            </div>
            {checked && picked != null && (
              <div className={`feedback ${picked === q.answerIndex ? 'good' : 'bad'}`}>
                <strong>
                  {picked === q.answerIndex
                    ? '정답입니다.'
                    : `오답입니다. 정답은 ${q.answerIndex + 1}번입니다.`}
                </strong>
                <p>{q.explanation}</p>
              </div>
            )}
          </article>
        </>
      )}
    </div>
  )
}
