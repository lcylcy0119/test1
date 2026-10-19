const WRONG_KEY = 'kcea-wrong-exams'
const SCHEDULE_KEY = 'kcea-schedule-draft'

export function loadWrongIds(): string[] {
  try {
    const raw = localStorage.getItem(WRONG_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function saveWrongIds(ids: string[]) {
  localStorage.setItem(WRONG_KEY, JSON.stringify([...new Set(ids)]))
}

export function addWrongId(id: string) {
  saveWrongIds([...loadWrongIds(), id])
}

export function removeWrongId(id: string) {
  saveWrongIds(loadWrongIds().filter((x) => x !== id))
}

export interface ScheduleDraft {
  step: number
  selectedIds: string[]
  durations: Record<string, number>
  predecessors: Record<string, string[]>
}

export function loadScheduleDraft(): ScheduleDraft | null {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY)
    return raw ? (JSON.parse(raw) as ScheduleDraft) : null
  } catch {
    return null
  }
}

export function saveScheduleDraft(draft: ScheduleDraft) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(draft))
}

export function clearScheduleDraft() {
  localStorage.removeItem(SCHEDULE_KEY)
}
