import { CATEGORIES } from '../data/categories'
import type { DonutSegment } from '../components/DonutChart'
import type { Expense, Ledger, MemberSpending } from '../types'

/** 团队总支出：所有记账金额之和 */
export function teamTotal(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + e.amountCny, 0)
}

export function shareForMember(expense: Expense, memberId: string): number {
  if (expense.splitMemberIds.length > 0) {
    if (!expense.splitMemberIds.includes(memberId)) return 0
    return expense.amountCny / expense.splitMemberIds.length
  }
  return expense.paidById === memberId ? expense.amountCny : 0
}

/** 个人总消费：自付全额 + 平摊中属于自己的份额 */
export function personalTotalFor(expenses: Expense[], memberId: string): number {
  return expenses.reduce((s, e) => s + shareForMember(e, memberId), 0)
}

export function computeMemberSpendings(ledger: Ledger): MemberSpending[] {
  return ledger.members.map((m) => {
    const paidTotal = ledger.expenses
      .filter((e) => e.paidById === m.id)
      .reduce((s, e) => s + e.amountCny, 0)
    const shareTotal = ledger.expenses.reduce((s, e) => s + shareForMember(e, m.id), 0)
    return {
      memberId: m.id,
      personalTotal: shareTotal,
      paidTotal,
      shareTotal,
    }
  })
}

/** 某成员按一级分类的个人消费占比（用于个人圆环图） */
export function personalCategorySegments(ledger: Ledger, memberId: string): DonutSegment[] {
  return CATEGORIES.map((cat) => {
    const items = ledger.expenses.filter((e) => e.primaryId === cat.id)
    const subMap = new Map<string, number>()
    let amount = 0
    for (const e of items) {
      const share = shareForMember(e, memberId)
      if (share <= 0) continue
      amount += share
      subMap.set(e.subName, (subMap.get(e.subName) ?? 0) + share)
    }
    return {
      id: cat.id,
      name: cat.name,
      color: cat.color,
      amount,
      subs: [...subMap.entries()].map(([name, amt]) => ({ name, amount: amt })),
    }
  }).filter((s) => s.amount > 0)
}

export function formatSplitLabel(
  expense: Expense,
  members: { id: string; name: string }[],
): string {
  if (expense.splitMemberIds.length === 0) return '个人开销'
  const names = expense.splitMemberIds
    .map((id) => members.find((m) => m.id === id)?.name ?? '?')
    .join('、')
  return `与 ${names} 平摊`
}
