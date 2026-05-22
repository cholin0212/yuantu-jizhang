import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandHeader } from '../components/BrandHeader'
import { CatPlaneIllustration } from '../components/CatPlaneIllustration'
import { ReorderableLedgerList } from '../components/ReorderableLedgerList'
import { COMPANION_COLORS } from '../data/travelerColors'
import { useStore } from '../store'
import type { Ledger, Traveler } from '../types'
import './HomePage.css'

const ME_COLOR = '#B8A9E8'

export function HomePage() {
  const { ledgers, addLedger, updateLedger, deleteLedger, reorderLedgers } = useStore()
  const navigate = useNavigate()

  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState('')
  const [companionNames, setCompanionNames] = useState<string[]>([])

  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Ledger | null>(null)

  const addCompanionField = () => setCompanionNames((prev) => [...prev, ''])
  const updateCompanion = (i: number, name: string) =>
    setCompanionNames((prev) => prev.map((n, idx) => (idx === i ? name : n)))
  const removeCompanion = (i: number) =>
    setCompanionNames((prev) => prev.filter((_, idx) => idx !== i))

  const resetNewModal = () => {
    setShowNew(false)
    setTitle('')
    setStartDate(new Date().toISOString().slice(0, 10))
    setEndDate('')
    setCompanionNames([])
  }

  const handleCreate = () => {
    if (!title.trim() || !startDate) return
    const me: Traveler = { id: `t-me-${Date.now()}`, name: '我', color: ME_COLOR }
    const companions: Traveler[] = companionNames
      .map((n) => n.trim())
      .filter(Boolean)
      .map((name, i) => ({
        id: `t-${Date.now()}-${i}`,
        name,
        color: COMPANION_COLORS[i % COMPANION_COLORS.length],
      }))
    const members = [me, ...companions]
    const ledger: Ledger = {
      id: `ledger-${Date.now()}`,
      title: title.trim(),
      startDate,
      endDate: endDate.trim(),
      coverGradient: 'linear-gradient(135deg, #FFE8D6 0%, #E8F4FF 100%)',
      members,
      aaMemberIds: companions.length > 0 ? members.map((m) => m.id) : [],
      expenses: [],
      customRates: {},
    }
    addLedger(ledger)
    resetNewModal()
    navigate(`/ledger/${ledger.id}`)
  }

  const openEdit = (ledger: Ledger) => {
    setEditingLedger(ledger)
    setEditTitle(ledger.title)
    setEditStart(ledger.startDate)
    setEditEnd(ledger.endDate)
  }

  const saveEdit = () => {
    if (!editingLedger || !editTitle.trim() || !editStart) return
    updateLedger(editingLedger.id, (l) => ({
      ...l,
      title: editTitle.trim(),
      startDate: editStart,
      endDate: editEnd.trim(),
    }))
    setEditingLedger(null)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteLedger(deleteTarget.id)
    setDeleteTarget(null)
  }

  const isEmpty = ledgers.length === 0

  return (
    <div className={`home-page ${isEmpty ? 'home-empty' : ''}`}>
      <BrandHeader onAdd={() => setShowNew(true)} />

      {isEmpty ? (
        <div className="empty-state">
          <CatPlaneIllustration />
          <p className="empty-title">这里空空如也</p>
          <p className="empty-hint">点击右上角「+」，新建你的第一个旅行账本吧！</p>
        </div>
      ) : (
        <section className="ledger-section">
          <div className="section-head">
            <h2>我的旅行账本</h2>
            <span className="badge-count">{ledgers.length}</span>
          </div>
          <ReorderableLedgerList
            ledgers={ledgers}
            onNavigate={(id) => navigate(`/ledger/${id}`)}
            onEdit={openEdit}
            onDelete={(l) => setDeleteTarget(l)}
            onReorder={reorderLedgers}
          />
        </section>
      )}

      <div className="home-footer">
        <button type="button" className="btn-create-main" onClick={() => setShowNew(true)}>
          新建账本
        </button>
      </div>

      {showNew && (
        <div className="modal-overlay" onClick={resetNewModal}>
          <div className="modal-card modal-card-wide" onClick={(e) => e.stopPropagation()}>
            <h3>开启新旅程</h3>
            <input
              className="input-field"
              placeholder="账本名称，如「京都红叶季」"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="date-row">
              <label className="date-field">
                <span>出发日期</span>
                <input
                  className="input-field"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label className="date-field">
                <span>结束日期（可选）</span>
                <input
                  className="input-field"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>
            <div className="aa-setup-block">
              <p className="aa-setup-label">需要 AA 平摊的同行人</p>
              <p className="aa-setup-hint">不添加则仅为个人记账，记一笔时不会出现平摊选项</p>
              {companionNames.map((name, i) => (
                <div key={i} className="companion-row">
                  <input
                    className="input-field"
                    placeholder={`同行人 ${i + 1} 昵称`}
                    value={name}
                    onChange={(e) => updateCompanion(i, e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-icon-remove"
                    aria-label="移除"
                    onClick={() => removeCompanion(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className="btn-pill btn-ghost add-companion-btn" onClick={addCompanionField}>
                ＋ 添加同行人
              </button>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-pill btn-ghost" onClick={resetNewModal}>
                取消
              </button>
              <button type="button" className="btn-pill btn-peach" onClick={handleCreate}>
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {editingLedger && (
        <div className="modal-overlay" onClick={() => setEditingLedger(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>编辑账本</h3>
            <input
              className="input-field"
              placeholder="账本名称"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <div className="date-row" style={{ marginTop: 10 }}>
              <label className="date-field">
                <span>出发日期</span>
                <input
                  className="input-field"
                  type="date"
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                />
              </label>
              <label className="date-field">
                <span>结束日期（可选）</span>
                <input
                  className="input-field"
                  type="date"
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-pill btn-ghost" onClick={() => setEditingLedger(null)}>
                取消
              </button>
              <button type="button" className="btn-pill btn-peach" onClick={saveEdit}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>删除账本？</h3>
            <p className="delete-warn">
              「{deleteTarget.title}」及其全部流水将被永久删除，无法恢复。
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-pill btn-ghost" onClick={() => setDeleteTarget(null)}>
                取消
              </button>
              <button type="button" className="btn-pill btn-peach" onClick={confirmDelete}>
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
