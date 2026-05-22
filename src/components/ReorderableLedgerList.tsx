import { useCallback, useRef, useState } from 'react'
import type { Ledger, SwipeOpenSide } from '../types'
import { SwipeableLedgerCard } from './SwipeableLedgerCard'
import './ReorderableLedgerList.css'

const LONG_PRESS_MS = 380
const CANCEL_HORIZONTAL_PX = 18

interface ReorderableLedgerListProps {
  ledgers: Ledger[]
  onNavigate: (id: string) => void
  onEdit: (ledger: Ledger) => void
  onDelete: (ledger: Ledger) => void
  onReorder: (fromIndex: number, toIndex: number) => void
}

export function ReorderableLedgerList({
  ledgers,
  onNavigate,
  onEdit,
  onDelete,
  onReorder,
}: ReorderableLedgerListProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [openSide, setOpenSide] = useState<SwipeOpenSide | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const dragIndexRef = useRef<number | null>(null)

  const closeSwipe = () => {
    setOpenId(null)
    setOpenSide(null)
  }

  const openSwipe = (id: string, side: SwipeOpenSide) => {
    setOpenId(id)
    setOpenSide(side)
  }

  const resolveIndex = useCallback((clientY: number) => {
    let target = 0
    for (let i = 0; i < itemRefs.current.length; i++) {
      const el = itemRefs.current[i]
      if (!el) continue
      const rect = el.getBoundingClientRect()
      const mid = rect.top + rect.height / 2
      if (clientY >= mid) target = i
    }
    return target
  }, [])

  const endDrag = () => {
    dragIndexRef.current = null
    setDragIndex(null)
    setOverIndex(null)
    document.body.classList.remove('ledger-reorder-active')
  }

  const onReorderPointerDown = (index: number, e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const ledger = ledgers[index]
    openSwipe(ledger.id, 'left')

    const startX = e.clientX
    let dragStarted = false

    const timer = window.setTimeout(() => {
      dragStarted = true
      dragIndexRef.current = index
      setDragIndex(index)
      setOverIndex(index)
      document.body.classList.add('ledger-reorder-active')
    }, LONG_PRESS_MS)

    const onMove = (ev: PointerEvent) => {
      if (dragIndexRef.current !== null) {
        ev.preventDefault()
        setOverIndex(resolveIndex(ev.clientY))
        return
      }
      if (!dragStarted && Math.abs(ev.clientX - startX) > CANCEL_HORIZONTAL_PX) {
        window.clearTimeout(timer)
        cleanup()
      }
    }

    const onUp = (ev: PointerEvent) => {
      window.clearTimeout(timer)
      if (dragIndexRef.current !== null) {
        const from = dragIndexRef.current
        const to = resolveIndex(ev.clientY)
        if (from !== to) onReorder(from, to)
        endDrag()
      }
      cleanup()
    }

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  return (
    <div className={`reorder-list ${dragIndex !== null ? 'is-dragging' : ''}`}>
      {dragIndex !== null && (
        <p className="reorder-drag-hint">拖动中… 移到目标位置后松开鼠标</p>
      )}
      {ledgers.map((ledger, index) => (
        <div
          key={ledger.id}
          ref={(el) => {
            itemRefs.current[index] = el
          }}
          className={[
            'reorder-item',
            dragIndex === index ? 'dragging' : '',
            overIndex === index && dragIndex !== null && dragIndex !== index
              ? 'drop-target'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <SwipeableLedgerCard
            ledger={ledger}
            openId={openId}
            openSide={openId === ledger.id ? openSide : null}
            isReorderActive={dragIndex !== null}
            onOpen={openSwipe}
            onClose={closeSwipe}
            onNavigate={() => onNavigate(ledger.id)}
            onEdit={() => {
              closeSwipe()
              onEdit(ledger)
            }}
            onDelete={() => {
              closeSwipe()
              onDelete(ledger)
            }}
            onReorderPointerDown={(e) => onReorderPointerDown(index, e)}
          />
        </div>
      ))}
    </div>
  )
}
