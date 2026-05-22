import { useEffect, useState } from 'react'
import { BrandTitle } from './BrandTitle'
import './SplashScreen.css'

/** 开屏停留（含四字动效播完） */
const SPLASH_MIN_MS = 3400
const SPLASH_FADE_MS = 500

interface SplashScreenProps {
  onFinish: () => void
}

function PropellerIcon() {
  const blade = <rect x="21" y="6" width="6" height="18" rx="3" ry="3" fill="#5aabaa" />

  return (
    <svg
      className="splash-fan"
      viewBox="0 0 48 48"
      width="40"
      height="40"
      aria-hidden
    >
      <g className="splash-fan-blades">
        <g transform="rotate(0 24 24)">{blade}</g>
        <g transform="rotate(120 24 24)">{blade}</g>
        <g transform="rotate(240 24 24)">{blade}</g>
      </g>
      <circle cx="24" cy="24" r="5.5" fill="#fff8ee" stroke="#5aabaa" strokeWidth="2" />
    </svg>
  )
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setLeaving(true), SPLASH_MIN_MS)
    const endTimer = window.setTimeout(onFinish, SPLASH_MIN_MS + SPLASH_FADE_MS)
    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(endTimer)
    }
  }, [onFinish])

  return (
    <div className={`splash-screen${leaving ? ' splash-screen--leave' : ''}`} role="presentation">
      <div className="splash-center">
        <div className="splash-brand-anchor">
          <BrandTitle animateChars />
        </div>
        <p className="splash-tagline">记录你的每一笔旅行花销</p>
      </div>

      <div className="splash-loader">
        <PropellerIcon />
        <p className="splash-loading-text">
          <span className="splash-loading-words">正在开启足迹</span>
          <span className="splash-loading-dots" aria-hidden>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>
    </div>
  )
}
