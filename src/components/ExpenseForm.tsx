import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES } from '../data/categories'
import { CURRENCIES, getCurrency } from '../data/currencies'
import type { CurrencyCode, Expense, Ledger, Traveler } from '../types'
import { parseNonNegative, sanitizeNonNegative } from '../utils/amountInput'
import './ExpenseForm.css'

interface ExpenseFormProps {
  ledger: Ledger
  editing?: Expense | null
  onSave: (expense: Expense) => void
  onAddCustomSub: (primaryId: string, name: string) => void
  onClose: () => void
}

function aaMembers(ledger: Ledger): Traveler[] {
  return ledger.members.filter((m) => ledger.aaMemberIds.includes(m.id))
}

export function ExpenseForm({ ledger, editing, onSave, onAddCustomSub, onClose }: ExpenseFormProps) {
  const isEdit = Boolean(editing)
  const hasAa = ledger.aaMemberIds.length > 0
  const aaList = aaMembers(ledger)

  const [primaryId, setPrimaryId] = useState(editing?.primaryId ?? CATEGORIES[0].id)
  const [subName, setSubName] = useState(editing?.subName ?? CATEGORIES[0].subs[0])
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [currency, setCurrency] = useState<CurrencyCode>(editing?.currency ?? 'CNY')
  const [rate, setRate] = useState(editing?.rate ?? 1)
  const [paidById, setPaidById] = useState(editing?.paidById ?? ledger.members[0]?.id ?? '')
  const [enableSplit, setEnableSplit] = useState(
    editing ? editing.splitMemberIds.length > 0 : false,
  )
  const [splitMemberIds, setSplitMemberIds] = useState<string[]>(
    editing?.splitMemberIds.length ? [...editing.splitMemberIds] : aaList.map((m) => m.id),
  )
  const [note, setNote] = useState(editing?.note ?? '')
  const [imagePreview, setImagePreview] = useState<string | undefined>(editing?.imageData)
  const [addingCustom, setAddingCustom] = useState(false)
  const [newCustomName, setNewCustomName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const customInputRef = useRef<HTMLInputElement>(null)

  const cat = CATEGORIES.find((c) => c.id === primaryId)!
  const extraSubs = ledger.customSubs[primaryId] ?? []
  const allSubs = useMemo(() => [...cat.subs, ...extraSubs], [cat.subs, extraSubs])

  const num = parseNonNegative(amount)
  const safeRate = Math.max(0, rate)
  const amountCny = Math.round(num * safeRate * 100) / 100

  useEffect(() => {
    if (editing && editing.primaryId === primaryId && allSubs.includes(editing.subName)) {
      setSubName(editing.subName)
    }
  }, [editing, primaryId, allSubs])

  useEffect(() => {
    if (addingCustom) customInputRef.current?.focus()
  }, [addingCustom])

  const onCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code)
    const c = getCurrency(code)
    const custom = ledger.customRates[code]
    setRate(custom ?? c.defaultRate)
  }

  const toggleSplitMember = (id: string) => {
    setSplitMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleImage = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const selectPrimary = (id: string) => {
    const next = CATEGORIES.find((c) => c.id === id)!
    const extras = ledger.customSubs[id] ?? []
    setPrimaryId(id)
    setSubName(next.subs[0] ?? extras[0] ?? '')
    setAddingCustom(false)
    setNewCustomName('')
  }

  const confirmAddCustomSub = () => {
    const name = newCustomName.trim()
    if (!name) return
    onAddCustomSub(primaryId, name)
    setSubName(name)
    setAddingCustom(false)
    setNewCustomName('')
  }

  const handleSubmit = () => {
    if (num <= 0 || !subName.trim()) return
    const finalSplit =
      hasAa && enableSplit && splitMemberIds.length > 0 ? splitMemberIds : []

    onSave({
      id: editing?.id ?? `e-${Date.now()}`,
      ledgerId: ledger.id,
      primaryId,
      subName: subName.trim(),
      amount: num,
      currency,
      rate,
      amountCny,
      paidById,
      splitMemberIds: finalSplit,
      note,
      imageData: imagePreview,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div
        className="expense-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={isEdit ? '编辑记录' : '记一笔'}
      >
        <div className="sheet-handle" />
        <h2 className="sheet-title">{isEdit ? '编辑记录' : '记一笔'}</h2>

        <section className="form-section">
          <label>花在哪</label>
          <div className="chip-row">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chip ${primaryId === c.id ? 'active' : ''}`}
                style={
                  primaryId === c.id
                    ? { background: c.color, color: 'var(--navy)' }
                    : undefined
                }
                onClick={() => selectPrimary(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>

        <section className="form-section">
          <label>具体项</label>
          <div className="chip-row">
            {allSubs.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip ${subName === s ? 'active' : ''}`}
                style={
                  subName === s
                    ? { background: cat.color + 'cc', color: 'var(--navy)' }
                    : undefined
                }
                onClick={() => setSubName(s)}
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              className="chip chip-add"
              style={{ borderColor: cat.color, color: cat.color }}
              aria-label="添加自定义具体项"
              onClick={() => {
                setAddingCustom(true)
                setNewCustomName('')
              }}
            >
              ＋
            </button>
          </div>
          {addingCustom && (
            <div className="custom-sub-add-row">
              <input
                ref={customInputRef}
                className="input-field"
                placeholder="输入自定义名称"
                value={newCustomName}
                onChange={(e) => setNewCustomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmAddCustomSub()
                  if (e.key === 'Escape') {
                    setAddingCustom(false)
                    setNewCustomName('')
                  }
                }}
              />
              <button type="button" className="btn-pill btn-mint custom-sub-add-btn" onClick={confirmAddCustomSub}>
                添加
              </button>
              <button
                type="button"
                className="btn-pill btn-ghost custom-sub-add-btn"
                onClick={() => {
                  setAddingCustom(false)
                  setNewCustomName('')
                }}
              >
                取消
              </button>
            </div>
          )}
        </section>

        <section className="form-section amount-row">
          <div className="amount-input-wrap">
            <input
              className="input-field amount-big"
              type="text"
              inputMode="decimal"
              placeholder="0"
              min={0}
              value={amount}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
              }}
              onChange={(e) => setAmount(sanitizeNonNegative(e.target.value))}
            />
            <select
              className="currency-select"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label} {c.code}
                </option>
              ))}
            </select>
          </div>
          {currency !== 'CNY' && (
            <div className="rate-row">
              <span>汇率 1 {currency} =</span>
              <input
                className="input-field rate-input"
                type="text"
                inputMode="decimal"
                value={rate}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
                }}
                onChange={(e) =>
                  setRate(parseNonNegative(sanitizeNonNegative(e.target.value)))
                }
              />
              <span>CNY</span>
              <span className="cny-preview">≈ ¥{amountCny.toFixed(2)}</span>
            </div>
          )}
        </section>

        <section className="form-section">
          <label>谁付的款</label>
          <div className="chip-row">
            {ledger.members.map((t: Traveler) => (
              <button
                key={t.id}
                type="button"
                className={`chip ${paidById === t.id ? 'active' : ''}`}
                style={
                  paidById === t.id
                    ? { background: t.color, color: 'var(--navy)' }
                    : undefined
                }
                onClick={() => setPaidById(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </section>

        {hasAa && (
          <section className="form-section">
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={enableSplit}
                onChange={(e) => {
                  setEnableSplit(e.target.checked)
                  if (e.target.checked && splitMemberIds.length === 0) {
                    setSplitMemberIds(aaList.map((m) => m.id))
                  }
                }}
              />
              <span>这笔要和大家平摊</span>
            </label>
            {enableSplit && (
              <div className="chip-row" style={{ marginTop: 12 }}>
                {aaList.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`chip ${splitMemberIds.includes(t.id) ? 'active' : ''}`}
                    style={
                      splitMemberIds.includes(t.id)
                        ? { background: t.color, color: 'var(--navy)' }
                        : undefined
                    }
                    onClick={() => toggleSplitMember(t.id)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="form-section journal-section">
          <label>备注与图片</label>
          <textarea
            className="input-field journal-note"
            placeholder="店名、感想、当时的心情…"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleImage(e.target.files?.[0])}
          />
          {imagePreview ? (
            <div className="image-preview-wrap">
              <img src={imagePreview} alt="预览" />
              <button
                type="button"
                className="btn-ghost btn-pill"
                onClick={() => setImagePreview(undefined)}
              >
                移除
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-pill btn-ghost upload-btn"
              onClick={() => fileRef.current?.click()}
            >
              📷 添加图片
            </button>
          )}
        </section>

        <button type="button" className="btn-pill btn-lavender submit-btn" onClick={handleSubmit}>
          {isEdit ? '保存修改' : '保存到账本'}
        </button>
      </div>
    </div>
  )
}
