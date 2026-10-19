export interface WorkItem {
  id: string
  name: string
  required: boolean
  distractorReason?: string
  quantityLabel: string
  quantity: number
  unit: string
  dailyOutput: number
  dailyOutputLabel: string
  lumpDays?: number
  predecessors: string[]
}

export const sampleProject = {
  title: '근린생활시설 RC조 지상 3층',
  summary:
    '철근콘크리트조, 지하 없음, 지상 3층, 연면적 약 900㎡. 직접기초. 외부는 일반 창호·페인팅, 내부는 조적 칸막이 후 수장. 옥상 방수 포함.',
  notes: [
    '파일기초나 커튼월은 이 공사에 해당하지 않습니다.',
    '작업일수는 수량 ÷ 1일 시공량을 올림한 정수입니다. 1식 공사는 제시된 일수를 그대로 씁니다.',
    '선후관계는 완료-착수(FS)만 사용합니다.',
  ],
}

export const workItems: WorkItem[] = [
  {
    id: 'temp',
    name: '가설공사',
    required: true,
    quantityLabel: '1식',
    quantity: 1,
    unit: '식',
    dailyOutput: 1,
    dailyOutputLabel: '일괄',
    lumpDays: 5,
    predecessors: [],
  },
  {
    id: 'earth',
    name: '토공사',
    required: true,
    quantityLabel: '800',
    quantity: 800,
    unit: '㎥',
    dailyOutput: 100,
    dailyOutputLabel: '100㎥/일',
    predecessors: ['temp'],
  },
  {
    id: 'found',
    name: '지정 및 기초공사',
    required: true,
    quantityLabel: '120',
    quantity: 120,
    unit: '㎥',
    dailyOutput: 20,
    dailyOutputLabel: '20㎥/일',
    predecessors: ['earth'],
  },
  {
    id: 'frame',
    name: '철근콘크리트 골조공사',
    required: true,
    quantityLabel: '450',
    quantity: 450,
    unit: '㎥',
    dailyOutput: 30,
    dailyOutputLabel: '30㎥/일',
    predecessors: ['found'],
  },
  {
    id: 'masonry',
    name: '조적공사',
    required: true,
    quantityLabel: '250',
    quantity: 250,
    unit: '㎡',
    dailyOutput: 25,
    dailyOutputLabel: '25㎡/일',
    predecessors: ['frame'],
  },
  {
    id: 'waterproof',
    name: '방수공사',
    required: true,
    quantityLabel: '400',
    quantity: 400,
    unit: '㎡',
    dailyOutput: 50,
    dailyOutputLabel: '50㎡/일',
    predecessors: ['frame'],
  },
  {
    id: 'window',
    name: '창호공사',
    required: true,
    quantityLabel: '80',
    quantity: 80,
    unit: '개소',
    dailyOutput: 10,
    dailyOutputLabel: '10개소/일',
    predecessors: ['frame'],
  },
  {
    id: 'interior',
    name: '내장공사',
    required: true,
    quantityLabel: '900',
    quantity: 900,
    unit: '㎡',
    dailyOutput: 45,
    dailyOutputLabel: '45㎡/일',
    predecessors: ['masonry', 'window', 'waterproof'],
  },
  {
    id: 'exterior',
    name: '외장공사',
    required: true,
    quantityLabel: '600',
    quantity: 600,
    unit: '㎡',
    dailyOutput: 40,
    dailyOutputLabel: '40㎡/일',
    predecessors: ['frame'],
  },
  {
    id: 'mep',
    name: '설비공사',
    required: true,
    quantityLabel: '1식',
    quantity: 1,
    unit: '식',
    dailyOutput: 1,
    dailyOutputLabel: '일괄',
    lumpDays: 12,
    predecessors: ['frame'],
  },
  {
    id: 'close',
    name: '준공청소',
    required: true,
    quantityLabel: '1식',
    quantity: 1,
    unit: '식',
    dailyOutput: 1,
    dailyOutputLabel: '일괄',
    lumpDays: 3,
    predecessors: ['interior', 'exterior', 'mep'],
  },
  {
    id: 'pile',
    name: '파일기초공사',
    required: false,
    distractorReason: '이 공사는 직접기초이며 지하가 없어 파일기초가 필요 없습니다.',
    quantityLabel: '-',
    quantity: 0,
    unit: '-',
    dailyOutput: 0,
    dailyOutputLabel: '-',
    predecessors: [],
  },
  {
    id: 'curtain',
    name: '커튼월공사',
    required: false,
    distractorReason: '소규모 근린생활시설로 일반 창호를 사용합니다.',
    quantityLabel: '-',
    quantity: 0,
    unit: '-',
    dailyOutput: 0,
    dailyOutputLabel: '-',
    predecessors: [],
  },
]

export function expectedDuration(item: WorkItem): number {
  if (item.lumpDays != null) return item.lumpDays
  return Math.max(1, Math.ceil(item.quantity / item.dailyOutput))
}

export const requiredWorks = workItems.filter((w) => w.required)
