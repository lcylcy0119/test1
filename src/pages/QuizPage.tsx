import { useMemo, useState } from 'react'
import { conceptQuizzes, topics, type ConceptQuiz } from '../data/conceptQuizzes'

function normalize(text: string) {
  return text.replace(/\s+/g, '').toLowerCase()
}

function isCorrect(quiz: ConceptQuiz, value: string) {
  if (quiz.kind === 'short') {
    const pool = [quiz.answer, ...(quiz.accepted ?? [])]
    return pool.some((a) => normalize(a) === normalize(value))
  }
  return value === quiz.answer
}

export default function QuizPage() {
  const [topic, setTopic] = useState('전체')
  const [kind, setKind] = useState<'all' | ConceptQuiz['kind']>('all')
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ ok: 0, n: 0 })

  const list = useMemo(() => {
    return conceptQuizzes.filter((q) => {
      const topicOk = topic === '전체' || q.topic === topic
      const kindOk = kind === 'all' || q.kind === kind
      return topicOk && kindOk
    })
  }, [topic, kind])

  const quiz = list[index] ?? list[0]

  function resetItem() {
    setSelected('')
    setChecked(false)
  }

  function changeFilter(nextTopic: string, nextKind: typeof kind) {
    setTopic(nextTopic)
    setKind(nextKind)
    setIndex(0)
    resetItem()
  }

  function submit() {
    if (!quiz || !selected.trim()) return
    const ok = isCorrect(quiz, selected.trim())
    setChecked(true)
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), n: s.n + 1 }))
  }

  function next() {
    if (index < list.length - 1) {
      setIndex(index + 1)
    } else {
      setIndex(0)
    }
    resetItem()
  }

  if (!quiz) {
    return <p className="panel">해당 조건의 문항이 없습니다.</p>
  }

  const ok = checked && isCorrect(quiz, selected.trim())

  return (
    <div className="stack">
      <header className="page-head">
        <h1>개념 퀴즈</h1>
        <p>공정표 종류, 주공정, 작업일수, 시공순서를 확인합니다.</p>
      </header>

      <div className="filters">
        {topics.map((t) => (
          <button
            key={t}
            className={t === topic ? 'chip active' : 'chip'}
            onClick={() => changeFilter(t, kind)}
            type="button"
          >
            {t}
          </button>
        ))}
        <span className="filter-gap" />
        {(['all', 'ox', 'mcq', 'short'] as const).map((k) => (
          <button
            key={k}
            className={k === kind ? 'chip active' : 'chip'}
            onClick={() => changeFilter(topic, k)}
            type="button"
          >
            {k === 'all' ? '모든 유형' : k === 'ox' ? 'OX' : k === 'mcq' ? '객관식' : '단답형'}
          </button>
        ))}
      </div>

      <p className="meta">
        {index + 1} / {list.length} · {quiz.topic} ·{' '}
        {quiz.kind === 'ox' ? 'OX' : quiz.kind === 'mcq' ? '객관식' : '단답형'}
        {score.n > 0 ? ` · 누적 ${score.ok}/${score.n}` : ''}
      </p>

      <article className="panel quiz-card">
        <h2>{quiz.question}</h2>

        {quiz.kind !== 'short' && (
          <div className="option-list">
            {quiz.options?.map((opt) => (
              <label key={opt} className={`option ${selected === opt ? 'picked' : ''}`}>
                <input
                  type="radio"
                  name={quiz.id}
                  value={opt}
                  checked={selected === opt}
                  disabled={checked}
                  onChange={() => setSelected(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        )}

        {quiz.kind === 'short' && (
          <input
            className="text-input"
            placeholder="답을 입력하세요"
            value={selected}
            disabled={checked}
            onChange={(e) => setSelected(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
          />
        )}

        <div className="actions">
          {!checked ? (
            <button type="button" className="btn primary" onClick={submit} disabled={!selected.trim()}>
              채점
            </button>
          ) : (
            <button type="button" className="btn primary" onClick={next}>
              다음 문제
            </button>
          )}
        </div>

        {checked && (
          <div className={`feedback ${ok ? 'good' : 'bad'}`}>
            <strong>{ok ? '정답입니다.' : `오답입니다. 정답: ${quiz.answer}`}</strong>
            <p>{quiz.explanation}</p>
          </div>
        )}
      </article>
    </div>
  )
}
