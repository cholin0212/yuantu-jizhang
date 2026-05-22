import type { Ledger, SettlementTransfer, Traveler } from '../types'

export function computeSettlement(ledger: Ledger): SettlementTransfer[] {
  if (ledger.aaMemberIds.length === 0) return []

  const balances = new Map<string, number>()
  for (const id of ledger.aaMemberIds) balances.set(id, 0)

  for (const e of ledger.expenses) {
    if (e.splitMemberIds.length === 0) continue
    const participants = e.splitMemberIds.filter((id) => balances.has(id))
    if (participants.length === 0) continue
    const share = e.amountCny / participants.length
    if (balances.has(e.paidById)) {
      balances.set(e.paidById, (balances.get(e.paidById) ?? 0) + e.amountCny)
    }
    for (const p of participants) {
      balances.set(p, (balances.get(p) ?? 0) - share)
    }
  }

  const debtors: { id: string; amount: number }[] = []
  const creditors: { id: string; amount: number }[] = []

  for (const [id, bal] of balances) {
    if (bal < -0.01) debtors.push({ id, amount: -bal })
    else if (bal > 0.01) creditors.push({ id, amount: bal })
  }

  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  const transfers: SettlementTransfer[] = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount)
    if (pay > 0.01) {
      transfers.push({
        from: debtors[i].id,
        to: creditors[j].id,
        amount: Math.round(pay * 100) / 100,
      })
    }
    debtors[i].amount -= pay
    creditors[j].amount -= pay
    if (debtors[i].amount < 0.01) i++
    if (creditors[j].amount < 0.01) j++
  }

  return transfers
}

export function travelerName(members: Traveler[], id: string) {
  return members.find((t) => t.id === id)?.name ?? '未知'
}
