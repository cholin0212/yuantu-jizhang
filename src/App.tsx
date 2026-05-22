import { useCallback, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SplashScreen } from './components/SplashScreen'
import { HomePage } from './pages/HomePage'
import { LedgerPage } from './pages/LedgerPage'
import { StoreProvider } from './store'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const finishSplash = useCallback(() => setShowSplash(false), [])

  return (
    <StoreProvider>
      <BrowserRouter>
        <div className="app-shell">
          <div className="phone-frame">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/ledger/:id" element={<LedgerPage />} />
            </Routes>
            {showSplash && <SplashScreen onFinish={finishSplash} />}
          </div>
        </div>
      </BrowserRouter>
    </StoreProvider>
  )
}
