import { BRAND_EN, BRAND_EN_COLOR, BRAND_TITLE_CHARS } from '../data/brand'
import './BrandTitle.css'

interface BrandTitleProps {
  showEn?: boolean
  /** 开屏四字依次蹦出 */
  animateChars?: boolean
}

export function BrandTitle({ showEn = true, animateChars = false }: BrandTitleProps) {
  return (
    <div className="brand-title-block">
      {showEn && (
        <span className="brand-title-en" style={{ color: BRAND_EN_COLOR }}>
          {BRAND_EN}
        </span>
      )}
      <h1 className="brand-title-main" aria-label="远途记账">
        {BRAND_TITLE_CHARS.map(({ char, color }, i) => (
          <span
            key={char}
            className={animateChars ? 'brand-char-bounce' : undefined}
            style={{
              color,
              ...(animateChars ? { animationDelay: `${0.15 + i * 0.22}s` } : {}),
            }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  )
}
