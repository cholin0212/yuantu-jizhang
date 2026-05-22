/** ISO 4217 货币代码 */
export type CurrencyCode = string

export interface Currency {
  code: CurrencyCode
  label: string
  defaultRate: number
}

export interface CategoryDef {
  id: string
  name: string
  color: string
  subs: string[]
}

export interface Traveler {
  id: string
  name: string
  color: string
}

export interface Expense {
  id: string
  ledgerId: string
  primaryId: string
  subName: string
  amount: number
  currency: CurrencyCode
  rate: number
  amountCny: number
  paidById: string
  splitMemberIds: string[]
  note: string
  imageData?: string
  createdAt: string
}

export interface Ledger {
  id: string
  title: string
  startDate: string
  endDate: string
  coverGradient: string
  members: Traveler[]
  aaMemberIds: string[]
  expenses: Expense[]
  customRates: Partial<Record<CurrencyCode, number>>
  /** 各分类下用户添加的自定义具体项 */
  customSubs: Record<string, string[]>
}

export interface SettlementTransfer {
  from: string
  to: string
  amount: number
}

export interface MemberSpending {
  memberId: string
  personalTotal: number
  paidTotal: number
  shareTotal: number
}

export type SwipeOpenSide = 'left' | 'right'
