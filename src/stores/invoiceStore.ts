import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Invoice } from '../types/invoice'

interface InvoiceState {
  invoices: Invoice[]
  addInvoice: (invoice: Invoice) => Invoice
  updateInvoice: (id: string, data: Partial<Invoice>) => Invoice | null
  deleteInvoice: (id: string) => boolean
  getInvoice: (id: string) => Invoice | undefined
  getInvoicesByStatus: (status: Invoice['status']) => Invoice[]
  searchInvoices: (query: string) => Invoice[]
  clearAll: () => void
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

function validateInvoice(data: Partial<Invoice>): string[] {
  const errors: string[] = []
  if (!data.invoiceNumber?.trim()) errors.push('发票号码不能为空')
  if (!data.buyerName?.trim()) errors.push('购买方名称不能为空')
  if (!data.sellerName?.trim()) errors.push('销售方名称不能为空')
  if (data.totalAmount !== undefined && data.totalAmount < 0) errors.push('总金额不能为负数')
  return errors
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: [],

      addInvoice: (invoiceData) => {
        const now = new Date().toISOString()
        const invoice: Invoice = {
          ...invoiceData,
          id: invoiceData.id || generateId(),
          createdAt: invoiceData.createdAt || now,
          updatedAt: now,
        }
        set((state) => ({ invoices: [...state.invoices, invoice] }))
        return invoice
      },

      updateInvoice: (id, data) => {
        let updated: Invoice | null = null
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.id === id) {
              updated = { ...inv, ...data, updatedAt: new Date().toISOString() }
              return updated
            }
            return inv
          }),
        }))
        return updated
      },

      deleteInvoice: (id) => {
        const exists = get().invoices.some((inv) => inv.id === id)
        if (!exists) return false
        set((state) => ({ invoices: state.invoices.filter((inv) => inv.id !== id) }))
        return true
      },

      getInvoice: (id) => {
        return get().invoices.find((inv) => inv.id === id)
      },

      getInvoicesByStatus: (status) => {
        return get().invoices.filter((inv) => inv.status === status)
      },

      searchInvoices: (query) => {
        const q = query.toLowerCase()
        return get().invoices.filter(
          (inv) =>
            inv.invoiceNumber?.toLowerCase().includes(q) ||
            inv.invoiceCode?.toLowerCase().includes(q) ||
            inv.sellerName?.toLowerCase().includes(q) ||
            inv.buyerName?.toLowerCase().includes(q) ||
            inv.remark?.toLowerCase().includes(q)
        )
      },

      clearAll: () => {
        set({ invoices: [] })
      },
    }),
    {
      name: 'invoice-storage',
    }
  )
)
