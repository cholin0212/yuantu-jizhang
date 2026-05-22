import { DEMO_LEDGERS } from '../data/demo'
import type { Expense, Ledger, Traveler } from '../types'

const STORAGE_KEY = 'yuantu-ledgers-v1'

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
    expenses: expensesRaw.map((e) =>
      migrateExpense(e as Record<string, unknown>, aaMemberIds),
    ),
  }
}

export function loadLedgers(): Ledger[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEMO_LEDGERS)
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return structuredClone(DEMO_LEDGERS)
    }
    return parsed.map((item) => migrateLedger(item as Record<string, unknown>))
  } catch {
    return structuredClone(DEMO_LEDGERS)
  }
}

export function saveLedgers(ledgers: Ledger[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ledgers))
  } catch (err) {
    console.warn('保存到本机失败，可能超出存储容量', err)
  }
}

export function hasSavedLedgers(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}
