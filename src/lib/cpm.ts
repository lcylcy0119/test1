export interface CpmInput {
  id: string
  duration: number
  predecessors: string[]
}

export interface CpmResult {
  id: string
  es: number
  ef: number
  ls: number
  lf: number
  float: number
  critical: boolean
}

function topoSort(items: CpmInput[]): string[] {
  const ids = new Set(items.map((i) => i.id))
  const incoming = new Map<string, number>()
  const outgoing = new Map<string, string[]>()
  for (const id of ids) {
    incoming.set(id, 0)
    outgoing.set(id, [])
  }
  for (const item of items) {
    for (const p of item.predecessors) {
      if (!ids.has(p)) continue
      incoming.set(item.id, (incoming.get(item.id) ?? 0) + 1)
      outgoing.get(p)!.push(item.id)
    }
  }
  const queue = [...ids].filter((id) => (incoming.get(id) ?? 0) === 0)
  const order: string[] = []
  while (queue.length) {
    const id = queue.shift()!
    order.push(id)
    for (const n of outgoing.get(id) ?? []) {
      incoming.set(n, (incoming.get(n) ?? 0) - 1)
      if (incoming.get(n) === 0) queue.push(n)
    }
  }
  if (order.length !== ids.size) {
    return items.map((i) => i.id)
  }
  return order
}

export function computeCpm(items: CpmInput[]): { rows: CpmResult[]; total: number } {
  const byId = new Map(items.map((i) => [i.id, i]))
  const order = topoSort(items)
  const es = new Map<string, number>()
  const ef = new Map<string, number>()

  for (const id of order) {
    const item = byId.get(id)!
    const predEs = item.predecessors
      .filter((p) => byId.has(p))
      .map((p) => ef.get(p) ?? 0)
    const start = predEs.length ? Math.max(...predEs) : 0
    es.set(id, start)
    ef.set(id, start + item.duration)
  }

  const total = Math.max(0, ...[...ef.values()])
  const lf = new Map<string, number>()
  const ls = new Map<string, number>()
  const successors = new Map<string, string[]>()
  for (const item of items) successors.set(item.id, [])
  for (const item of items) {
    for (const p of item.predecessors) {
      if (byId.has(p)) successors.get(p)!.push(item.id)
    }
  }

  for (const id of [...order].reverse()) {
    const item = byId.get(id)!
    const succs = successors.get(id) ?? []
    const finish = succs.length ? Math.min(...succs.map((s) => ls.get(s) ?? total)) : total
    lf.set(id, finish)
    ls.set(id, finish - item.duration)
  }

  const rows: CpmResult[] = items.map((item) => {
    const float = (ls.get(item.id) ?? 0) - (es.get(item.id) ?? 0)
    return {
      id: item.id,
      es: es.get(item.id) ?? 0,
      ef: ef.get(item.id) ?? 0,
      ls: ls.get(item.id) ?? 0,
      lf: lf.get(item.id) ?? 0,
      float,
      critical: float <= 0,
    }
  })

  return { rows, total }
}
