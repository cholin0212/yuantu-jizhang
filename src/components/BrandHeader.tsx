import './BrandHeader.css'

interface BrandHeaderProps {
  onAdd: () => void
}

const TITLE_CHARS = [
  { char: '远', color: '#3d5a80' },
  { char: '途', color: '#e88fa2' },
  { char: '记', color: '#f0a060' },
  { char: '账', color: '#7ec8a8' },
]

export function BrandHeader({ onAdd }: BrandHeaderProps) {
  return (
    <header className="brand-header">
      <div className="brand-logo">
        <span className="brand-en" aria-hidden>
          YUAN TU
        </span>
        <h1 className="brand-title" aria-label="远途记账">
          {TITLE_CHARS.map(({ char, color }) => (
            <span key={char} style={{ color }}>
              {char}
            </span>
          ))}
        </h1>
      </div>
      <button type="button" className="brand-add-btn" onClick={onAdd} aria-label="新建账本">
        <span className="plus-icon">+</span>
      </button>
    </header>
  )
}
