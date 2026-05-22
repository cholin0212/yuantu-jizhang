import { useEffect, useRef, useState } from 'react'
import type { Ledger, SwipeOpenSide } from '../types'
import { formatLedgerDates } from '../utils/dateFormat'
import { teamTotal } from '../utils/stats'
import './SwipeableLedgerCard.css'

const LEFT_WIDTH = 56
const RIGHT_WIDTH = 132
const SWIPE_THRESHOLD = 40

interface SwipeableLedgerCardProps {
  ledger: Ledger
  openId: string | null
  openSide: SwipeOpenSide | null
  isReorderActive: boolean
  onOpen: (id: string, side: SwipeOpenSide) => void
  onClose: () => void
  onNavigate: () => void
  onEdit: () => void
  onDelete: () => void
  onReorderPointerDown: (e: React.PointerEvent) => void
}

export function SwipeableLedgerCard({
  ledger,
  openId,
  openSide,
  isReorderActive,
  onOpen,
  onClose,
  onNavigate,
  onEdit,
  onDelete,
  onReorderPointerDown,
}: SwipeableLedgerCardProps) {
  const total = teamTotal(ledger.expenses)
  const isMine = openId === ledger.id
  const [offset, setOffset] = useState(0)
  const startX = useRef(0)
  const startOffset = useRef(0)
  const swiping = useRef(false)

  useEffect(() => {
    if (!isMine) {
      setOffset(0)
      return
    }
    if (openSide === 'left') setOffset(LEFT_WIDTH)
    else if (openSide === 'right') setOffset(-RIGHT_WIDTH)
    else setOffset(0)
  }, [isMine, openSide])

  const clampOffset = (x: number) => Math.max(-RIGHT_WIDTH, Math.min(LEFT_WIDTH, x))

  const snapOpen = (x: number) => {
    if (x > SWIPE_THRESHOLD) {
      onOpen(ledger.id, 'left')
      setOffset(LEFT_WIDTH)
    } else if (x < -SWIPE_THRESHOLD) {
      onOpen(ledger.id, 'right')
      setOffset(-RIGHT_WIDTH)
    } else {
      onClose()
      setOffset(0)
    }
  }

  const onPointerDownCard = (e: React.PointerEvent) => {
    if (isReorderActive) return
    if ((e.target as HTMLElement).closest('.drag-handle-reveal')) return
    startX.current = e.clientX
    startOffset.current = offset
    swiping.current = true
  }

  const onPointerMoveCard = (e: React.PointerEvent) => {
    if (!swiping.current || isReorderActive) return
    const dx = e.clientX - startX.current
    setOffset(clampOffset(startOffset.current + dx))
  }

  const onPointerUpCard = () => {
    if (!swiping.current) return
    swiping.current = false
    snapOpen(offset)
  }

  const handleCardClick = () => {
    if (isReorderActive) return
    if (isMine && (openSide || Math.abs(offset) > 8)) {
      onClose()
      setOffset(0)
      return
    }
    onNavigate()
  }

  return (
    <div className={`swipe-ledger-wrap ${isMine && openSide ? 'open' : ''}`}>
      <div className="swipe-left-actions">
        <button
          type="button"
          className="drag-handle-reveal"
          aria-label="长按拖动排序"
          onPointerDown={onReorderPointerDown}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="swipe-right-actions">
        <button type="button" className="swipe-act edit" onClick={onEdit}>
          编辑
        </button>
        <button type="button" className="swipe-act delete" onClick={onDelete}>
          删除
        </button>
      </div>

      <div
        className="swipe-ledger-panel"
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDownCard}
        onPointerMove={onPointerMoveCard}
        onPointerUp={onPointerUpCard}
        onPointerCancel={onPointerUpCard}
      >
        <button type="button" className="ledger-card" onClick={handleCardClick}>
          <div className="ledger-card-cover" style={{ background: ledger.coverGradient }}>
            <h3 className="ledger-cover-title">{ledger.title}</h3>
            <p className="ledger-cover-dates">
              {formatLedgerDates(ledger.startDate, ledger.endDate)}
            </p>
          </div>
          <div className="ledger-card-body">
            <div className="ledger-meta">
              <span className="ledger-total">¥{total.toFixed(0)}</span>
              <span className="ledger-count">{ledger.expenses.length} 笔</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
