import type { Expense, Ledger, Traveler } from '../types'

const STORAGE_KEY = 'yuantu-ledgers-v1'
const ONBOARDING_KEY = 'yuantu-onboarding-done-v1'

const DEMO_LEDGER_IDS = new Set(['ledger-uz', 'ledger-th'])

const DEFAULT_MEMBER: Traveler = { id: 't-me', name: '我', color: '#B8A9E8' }

function migrateExpense(raw: Record<string, unknown>, aaMemberIds: string[]): Expense {
  let splitMemberIds = raw.splitMemberIds as string[] | undefined
  if (!Array.isArray(splitMemberIds)) {
    if (raw.splitEvenly && aaMemberIds.length > 0) {
      splitMemberIds = [...aaMemberIds]
    } else {
      splitMemberIds = []
    }
  }
  return {
    id: String(raw.id ?? ''),
    ledgerId: String(raw.ledgerId ?? ''),
    primaryId: String(raw.primaryId ?? 'food'),
    subName: String(raw.subName ?? ''),
    amount: Number(raw.amount) || 0,
    currency: String(raw.currency ?? 'CNY'),
    rate: Number(raw.rate) || 1,
    amountCny: Number(raw.amountCny) || 0,
    paidById: String(raw.paidById ?? 't-me'),
    splitMemberIds,
    note: String(raw.note ?? ''),
    imageData: raw.imageData as string | undefined,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  }
}

function migrateLedger(raw: Record<string, unknown>): Ledger {
  const members = (raw.members ?? raw.travelers) as Traveler[] | undefined
  const safeMembers =
    Array.isArray(members) && members.length > 0 ? members : [DEFAULT_MEMBER]
  const aaMemberIds = Array.isArray(raw.aaMemberIds)
    ? (raw.aaMemberIds as string[])
    : []
  const expensesRaw = Array.isArray(raw.expenses) ? raw.expenses : []

  return {
    id: String(raw.id ?? `ledger-${Date.now()}`),
    title: String(raw.title ?? '未命名账本'),
    startDate: String(raw.startDate ?? new Date().toISOString().slice(0, 10)),
    endDate: String(raw.endDate ?? ''),
    coverGradient:
      String(raw.coverGradient) ||
      'linear-gradient(135deg, #E8F4FF 0%, #FFF0F5 100%)',
    members: safeMembers,
    aaMemberIds,
    customRates: (raw.customRates as Ledger['customRates']) ?? {},
    customSubs: (raw.customSubs as Ledger['customSubs']) ?? {},
    expenses: expensesRaw.map((e) =>
      migrateExpense(e as Record<string, unknown>, aaMemberIds),
    ),
  }
}

function isLegacyDemoOnly(ledgers: Ledger[]): boolean {
  if (ledgers.length === 0) return false
  return ledgers.every((l) => DEMO_LEDGER_IDS.has(l.id))
}

export function loadLedgers(): Ledger[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return []
    const ledgers = parsed.map((item) => migrateLedger(item as Record<string, unknown>))
    if (isLegacyDemoOnly(ledgers)) {
      localStorage.removeItem(STORAGE_KEY)
      return []
    }
    return ledgers
  } catch {
    return []
  }
}

export function saveLedgers(ledgers: Ledger[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ledgers))
  } catch (err) {
    console.warn('保存到本机失败，可能超出存储容量', err)
  }
}

export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1'
  } catch {
    return false
  }
}

export function markOnboardingDone(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1')
  } catch {
    /* ignore */
  }
}
