import { BrandTitle } from './BrandTitle'
import './BrandHeader.css'

interface BrandHeaderProps {
  onAdd: () => void
}

export function BrandHeader({ onAdd }: BrandHeaderProps) {
  return (
    <header className="brand-header">
      <BrandTitle />
      <button type="button" className="brand-add-btn" onClick={onAdd} aria-label="新建账本">
        <span className="plus-icon">+</span>
      </button>
    </header>
  )
}
