export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceCode: string
  invoiceType: 'normal' | 'special'
  sellerName: string
  sellerTaxNumber: string
  sellerAddress: string
  sellerPhone: string
  sellerBank: string
  sellerAccount: string
  buyerName: string
  buyerTaxNumber: string
  buyerAddress: string
  buyerPhone: string
  buyerBank: string
  buyerAccount: string
  totalAmount: number
  taxAmount: number
  subtotal: number
  taxRate: number
  invoiceDate: string
  remark: string
  status: 'draft' | 'verified' | 'void'
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  name: string
  specification: string
  unit: string
  quantity: number
  unitPrice: number
  amount: number
  taxRate: number
  taxAmount: number
}

export type InvoiceStatus = Invoice['status']
export type InvoiceType = Invoice['invoiceType']
