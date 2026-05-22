import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LedgerPage } from './pages/LedgerPage'
import { StoreProvider } from './store'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <div className="app-shell">
          <div className="phone-frame">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/ledger/:id" element={<LedgerPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </StoreProvider>
  )
}
