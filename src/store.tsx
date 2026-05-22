import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loadLedgers, saveLedgers } from './utils/storage'
import type { Expense, Ledger } from './types'

interface StoreContextValue {
  ledgers: Ledger[]
  addLedger: (ledger: Ledger) => void
  updateLedger: (id: string, updater: (l: Ledger) => Ledger) => void
  deleteLedger: (id: string) => void
  reorderLedgers: (fromIndex: number, toIndex: number) => void
  addExpense: (ledgerId: string, expense: Expense) => void
  updateExpense: (ledgerId: string, expense: Expense) => void
  deleteExpense: (ledgerId: string, expenseId: string) => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ledgers, setLedgers] = useState<Ledger[]>(() => loadLedgers())

  useEffect(() => {
    saveLedgers(ledgers)
  }, [ledgers])

  const addLedger = (ledger: Ledger) => setLedgers((prev) => [ledger, ...prev])

  const updateLedger = (id: string, updater: (l: Ledger) => Ledger) => {
    setLedgers((prev) => prev.map((l) => (l.id === id ? updater(l) : l)))
  }

  const deleteLedger = (id: string) => {
    setLedgers((prev) => prev.filter((l) => l.id !== id))
  }

  const reorderLedgers = (fromIndex: number, toIndex: number) => {
    setLedgers((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) {
        return prev
      }
      const next = [...prev]
      const [item] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, item)
      return next
    })
  }

  const addExpense = (ledgerId: string, expense: Expense) => {
    updateLedger(ledgerId, (l) => ({ ...l, expenses: [expense, ...l.expenses] }))
  }

  const updateExpense = (ledgerId: string, expense: Expense) => {
    updateLedger(ledgerId, (l) => ({
      ...l,
      expenses: l.expenses.map((e) => (e.id === expense.id ? expense : e)),
    }))
  }

  const deleteExpense = (ledgerId: string, expenseId: string) => {
    updateLedger(ledgerId, (l) => ({
      ...l,
      expenses: l.expenses.filter((e) => e.id !== expenseId),
    }))
  }

  return (
    <StoreContext.Provider
      value={{
        ledgers,
        addLedger,
        updateLedger,
        deleteLedger,
        reorderLedgers,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}
