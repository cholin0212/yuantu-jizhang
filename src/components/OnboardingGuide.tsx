import { useState } from 'react'
import { markOnboardingDone } from '../utils/storage'
import './OnboardingGuide.css'

const STEPS = [
  {
    title: '欢迎使用远途记账',
    body: '每次旅行一个独立账本，花销清清楚楚，再也不怕回国后对不上账。',
  },
  {
    title: '第一步：新建账本',
    body: '点页面底部「新建账本」，或右上角绿色的 ＋，填写旅程名称和日期。',
  },
  {
    title: '第二步：记一笔',
    body: '进入账本后点「记一笔」，选分类、金额和币种；有同行人时可勾选 AA 平摊。',
  },
]

interface OnboardingGuideProps {
  onDismiss: () => void
  onStartCreate: () => void
}

export function OnboardingGuide({ onDismiss, onStartCreate }: OnboardingGuideProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const finish = (startCreate: boolean) => {
    markOnboardingDone()
    onDismiss()
    if (startCreate) onStartCreate()
  }

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-card">
        <div className="onboarding-progress" aria-hidden>
          {STEPS.map((_, i) => (
            <span key={i} className={i === step ? 'active' : i < step ? 'done' : ''} />
          ))}
        </div>
        <h2 id="onboarding-title" className="onboarding-title">
          {current.title}
        </h2>
        <p className="onboarding-body">{current.body}</p>
        <div className="onboarding-actions">
          <button
            type="button"
            className="btn-pill btn-ghost onboarding-skip"
            onClick={() => finish(false)}
          >
            跳过
          </button>
          {!isLast ? (
            <button
              type="button"
              className="btn-pill btn-peach"
              onClick={() => setStep((s) => s + 1)}
            >
              下一步
            </button>
          ) : (
            <button type="button" className="btn-pill btn-peach" onClick={() => finish(true)}>
              去新建账本
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
