import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DonutChart, type DonutSegment } from '../components/DonutChart'
import { ExpenseForm } from '../components/ExpenseForm'
import { CATEGORIES, getCategory } from '../data/categories'
import { useStore } from '../store'
import type { Expense } from '../types'
import {
  computeMemberSpendings,
  formatSplitLabel,
  personalCategorySegments,
  personalTotalFor,
  teamTotal,
} from '../utils/stats'
import { computeSettlement, travelerName } from '../utils/settlement'
import './LedgerPage.css'

type Tab = 'journal' | 'stats' | 'settle'

export function LedgerPage() {
  const { id } = useParams<{ id: string }>()
  const { ledgers, addExpense, updateExpense, deleteExpense } = useStore()
  const ledger = ledgers.find((l) => l.id === id)
  const [tab, setTab] = useState<Tab>('journal')
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const teamSum = useMemo(() => (ledger ? teamTotal(ledger.expenses) : 0), [ledger])
  const memberSpendings = useMemo(
    () => (ledger ? computeMemberSpendings(ledger) : []),
    [ledger],
  )

  const segments: DonutSegment[] = useMemo(() => {
    if (!ledger) return []
    return CATEGORIES.map((cat) => {
      const items = ledger.expenses.filter((e) => e.primaryId === cat.id)
      const amount = items.reduce((s, e) => s + e.amountCny, 0)
      const subMap = new Map<string, number>()
      for (const e of items) {
        subMap.set(e.subName, (subMap.get(e.subName) ?? 0) + e.amountCny)
      }
      return {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        amount,
        subs: [...subMap.entries()].map(([name, amt]) => ({ name, amount: amt })),
      }
    }).filter((s) => s.amount > 0)
  }, [ledger])

  const transfers = useMemo(() => (ledger ? computeSettlement(ledger) : []), [ledger])

  const selectedMember = ledger?.members.find((m) => m.id === selectedMemberId)
  const personalDonutSegments = useMemo(() => {
    if (!ledger || !selectedMemberId) return []
    return personalCategorySegments(ledger, selectedMemberId)
  }, [ledger, selectedMemberId])
  const personalDonutTotal = useMemo(() => {
    if (!ledger || !selectedMemberId) return 0
    return personalTotalFor(ledger.expenses, selectedMemberId)
  }, [ledger, selectedMemberId])

  useEffect(() => {
    setSelectedMemberId(null)
  }, [tab, id])

  const openNew = () => {
    setEditingExpense(null)
    setShowForm(true)
  }

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingExpense(null)
  }

  const handleDelete = (expenseId: string) => {
    if (!ledger) return
    deleteExpense(ledger.id, expenseId)
    setDeleteConfirmId(null)
  }

  if (!ledger) {
    return (
      <div className="ledger-page">
        <p>账本不存在</p>
        <Link to="/">返回首页</Link>
      </div>
    )
  }

  return (
    <div className="ledger-page">
      <header className="ledger-top">
        <Link to="/" className="back-link">
          ← 账本列表
        </Link>
        <h1>{ledger.title}</h1>
        <p className="ledger-date-line">
          {ledger.startDate}
          {ledger.endDate ? ` — ${ledger.endDate}` : ' — 进行中'}
        </p>
        <div className="ledger-totals-row">
          <div className="total-block">
            <span className="total-label">团队总支出</span>
            <strong>¥{teamSum.toFixed(2)}</strong>
          </div>
          {memberSpendings.map((ms) => {
            const member = ledger.members.find((m) => m.id === ms.memberId)
            if (!member) return null
            return (
              <div key={ms.memberId} className="total-block personal">
                <span className="total-label">{member.name} 个人消费</span>
                <strong>¥{ms.personalTotal.toFixed(2)}</strong>
              </div>
            )
          })}
        </div>
      </header>

      <div className="tab-bar ledger-tabs">
        <button type="button" className={tab === 'journal' ? 'active' : ''} onClick={() => setTab('journal')}>
          流水
        </button>
        <button type="button" className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')}>
          财务统计
        </button>
        {ledger.aaMemberIds.length > 0 && (
          <button type="button" className={tab === 'settle' ? 'active' : ''} onClick={() => setTab('settle')}>
            AA 结算
          </button>
        )}
      </div>

      <main className="ledger-content">
        {tab === 'journal' && (
          <ul className="expense-list">
            {ledger.expenses.length === 0 && (
              <li className="empty-hint">还没有记录，点下方按钮记第一笔吧</li>
            )}
            {ledger.expenses.map((e) => {
              const cat = getCategory(e.primaryId)
              return (
                <li key={e.id} className="expense-item">
                  <div className="expense-icon" style={{ background: cat?.color ?? '#ddd' }}>
                    {cat?.name.slice(0, 1)}
                  </div>
                  <div className="expense-body">
                    <div className="expense-top">
                      <span className="expense-cat">
                        {cat?.name} · {e.subName}
                      </span>
                      <span className="expense-amt">¥{e.amountCny.toFixed(2)}</span>
                    </div>
                    {e.currency !== 'CNY' && (
                      <p className="expense-fx">
                        {e.amount} {e.currency} × {e.rate}
                      </p>
                    )}
                    {e.note && <p className="expense-note">{e.note}</p>}
                    {e.imageData && <img className="expense-thumb" src={e.imageData} alt="" />}
                    <p className="expense-meta">
                      {travelerName(ledger.members, e.paidById)} 付款 ·{' '}
                      {formatSplitLabel(e, ledger.members)}
                    </p>
                    <div className="expense-actions">
                      <button type="button" className="action-btn edit" onClick={() => openEdit(e)}>
                        编辑
                      </button>
                      {deleteConfirmId === e.id ? (
                        <>
                          <button
                            type="button"
                            className="action-btn danger"
                            onClick={() => handleDelete(e.id)}
                          >
                            确认删除
                          </button>
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="action-btn danger"
                          onClick={() => setDeleteConfirmId(e.id)}
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {tab === 'stats' && (
          <div className="stats-panel">
            <h3 className="stats-section-title">团队支出分布</h3>
            {teamSum > 0 ? (
              <DonutChart segments={segments} total={teamSum} centerLabel="团队总支出" />
            ) : (
              <p className="empty-hint">暂无数据，记几笔再来看看占比吧</p>
            )}
            <p className="stats-hint">点击圆环或图例，查看各细项金额</p>

            <h3 className="stats-section-title personal-stats-title">个人消费（含平摊份额）</h3>
            <p className="stats-hint personal-tap-hint">点击人名查看该成员的消费圆环图</p>
            <ul className="personal-stats-list">
              {memberSpendings.map((ms) => {
                const member = ledger.members.find((m) => m.id === ms.memberId)!
                const isSelected = selectedMemberId === ms.memberId
                return (
                  <li key={ms.memberId}>
                    <button
                      type="button"
                      className={`personal-stat-card ${isSelected ? 'selected' : ''}`}
                      onClick={() =>
                        setSelectedMemberId(isSelected ? null : ms.memberId)
                      }
                    >
                      <span className="personal-stat-name" style={{ color: member.color }}>
                        {member.name}
                      </span>
                      <span className="personal-stat-value">
                        ¥{ms.personalTotal.toFixed(2)}
                      </span>
                      <span className="personal-stat-sub">
                        实付 ¥{ms.paidTotal.toFixed(2)} · 应承担 ¥
                        {ms.shareTotal.toFixed(2)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            {selectedMember && personalDonutTotal > 0 && (
              <div className="personal-donut-panel">
                <h4 className="personal-donut-title">
                  <span style={{ color: selectedMember.color }}>{selectedMember.name}</span>
                  的消费分布
                </h4>
                <DonutChart
                  segments={personalDonutSegments}
                  total={personalDonutTotal}
                  centerLabel={`${selectedMember.name}消费`}
                />
              </div>
            )}
            {selectedMember && personalDonutTotal <= 0 && (
              <p className="empty-hint">该成员暂无消费记录</p>
            )}
          </div>
        )}

        {tab === 'settle' && ledger.aaMemberIds.length > 0 && (
          <div className="settle-panel">
            <div className="traveler-chips">
              {ledger.members
                .filter((t) => ledger.aaMemberIds.includes(t.id))
                .map((t) => (
                  <span key={t.id} className="traveler-chip" style={{ background: t.color + '66' }}>
                    {t.name}
                  </span>
                ))}
            </div>

            <h3 className="stats-section-title">个人消费汇总</h3>
            <ul className="personal-stats-list compact">
              {memberSpendings
                .filter((ms) => ledger.aaMemberIds.includes(ms.memberId))
                .map((ms) => {
                  const member = ledger.members.find((m) => m.id === ms.memberId)!
                  return (
                    <li key={ms.memberId} className="personal-stat-card">
                      <span className="personal-stat-name">{member.name}</span>
                      <span className="personal-stat-value">¥{ms.personalTotal.toFixed(2)}</span>
                    </li>
                  )
                })}
            </ul>

            <h3 className="stats-section-title">结算转账</h3>
            {transfers.length === 0 ? (
              <p className="empty-hint settle-ok">✓ 大家已经两清了，无需转账</p>
            ) : (
              <ul className="transfer-list">
                {transfers.map((tr, i) => (
                  <li key={i} className="transfer-item">
                    <div className="transfer-names">
                      <span className="from">{travelerName(ledger.members, tr.from)}</span>
                      <span className="arrow-inline">→</span>
                      <span className="to">{travelerName(ledger.members, tr.to)}</span>
                    </div>
                    <span className="transfer-amt">¥{tr.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="settle-hint">仅统计勾选平摊的账单，个人开销不参与 AA</p>
          </div>
        )}
      </main>

      <button type="button" className="fab btn-pill btn-peach" onClick={openNew}>
        ＋ 记一笔
      </button>

      {showForm && (
        <ExpenseForm
          ledger={ledger}
          editing={editingExpense}
          onSave={(exp) => {
            if (editingExpense) updateExpense(ledger.id, exp)
            else addExpense(ledger.id, exp)
          }}
          onClose={closeForm}
        />
      )}
    </div>
  )
}
