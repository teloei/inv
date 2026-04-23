import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import type { Invoice } from '../types/invoice'
import { formatCurrency, formatDate, amountToChinese } from './format'

// 发票类型文本
function formatInvoiceType(type: 'normal' | 'special'): string {
  return type === 'normal' ? '增值税普通发票' : '增值税专用发票'
}

// 状态文本
function formatStatus(status: 'draft' | 'verified' | 'void'): string {
  const map: Record<string, string> = { draft: '草稿', verified: '已查验', void: '已作废' }
  return map[status] || status
}

// 税率文本
function formatTaxRate(rate: number): string {
  return `${rate}%`
}

// 导出到 Excel
export async function exportToExcel(invoices: Invoice[]): Promise<void> {
  if (invoices.length === 0) {
    throw new Error('没有可导出的数据')
  }

  const data = invoices.map((inv) => ({
    '发票号码': inv.invoiceNumber || '',
    '发票代码': inv.invoiceCode || '',
    '发票类型': formatInvoiceType(inv.invoiceType),
    '销售方名称': inv.sellerName || '',
    '销售方税号': inv.sellerTaxNumber || '',
    '购买方名称': inv.buyerName || '',
    '购买方税号': inv.buyerTaxNumber || '',
    '不含税金额': inv.subtotal || 0,
    '税额': inv.taxAmount || 0,
    '价税合计': inv.totalAmount || 0,
    '税率': formatTaxRate(inv.taxRate),
    '开票日期': formatDate(inv.invoiceDate || inv.createdAt),
    '状态': formatStatus(inv.status),
    '备注': inv.remark || '',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '发票列表')

  // 自动列宽
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length * 2, 12),
  }))
  ws['!cols'] = colWidths

  const fname = `发票导出_${formatDate(new Date().toISOString())}.xlsx`
  XLSX.writeFile(wb, fname)
}

// 导出单张发票到 PDF
export async function exportToPDF(invoice: Invoice): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  doc.setFontSize(18)
  doc.text(formatInvoiceType(invoice.invoiceType), 105, 20, { align: 'center' })

  doc.setFontSize(10)
  doc.text(`发票号码: ${invoice.invoiceNumber || '-'}`, 15, 35)
  doc.text(`发票代码: ${invoice.invoiceCode || '-'}`, 15, 42)
  doc.text(`开票日期: ${formatDate(invoice.invoiceDate)}`, 15, 49)

  // 销售方
  doc.setFontSize(12)
  doc.text('销售方信息', 15, 62)
  doc.setFontSize(10)
  doc.text(`名称: ${invoice.sellerName || '-'}`, 15, 69)
  doc.text(`税号: ${invoice.sellerTaxNumber || '-'}`, 15, 76)
  doc.text(`地址: ${invoice.sellerAddress || '-'}`, 15, 83)
  doc.text(`开户行: ${invoice.sellerBank || '-'} ${invoice.sellerAccount || '-'}`, 15, 90)

  // 购买方
  doc.setFontSize(12)
  doc.text('购买方信息', 15, 103)
  doc.setFontSize(10)
  doc.text(`名称: ${invoice.buyerName || '-'}`, 15, 110)
  doc.text(`税号: ${invoice.buyerTaxNumber || '-'}`, 15, 117)
  doc.text(`地址: ${invoice.buyerAddress || '-'}`, 15, 124)
  doc.text(`开户行: ${invoice.buyerBank || '-'} ${invoice.buyerAccount || '-'}`, 15, 131)

  // 金额
  doc.setFontSize(12)
  doc.text('金额信息', 15, 144)
  doc.setFontSize(10)
  doc.text(`不含税金额: ¥${formatCurrency(invoice.subtotal || 0)}`, 15, 151)
  doc.text(`税率: ${formatTaxRate(invoice.taxRate)}`, 15, 158)
  doc.text(`税额: ¥${formatCurrency(invoice.taxAmount || 0)}`, 15, 165)
  doc.text(`价税合计: ¥${formatCurrency(invoice.totalAmount || 0)}`, 15, 172)
  doc.text(`大写: ${amountToChinese(invoice.totalAmount || 0)}`, 15, 179)

  // 备注
  if (invoice.remark) {
    doc.setFontSize(10)
    doc.text(`备注: ${invoice.remark}`, 15, 192)
  }

  doc.text(`状态: ${formatStatus(invoice.status)}`, 15, 199)

  const fname = `发票_${invoice.invoiceNumber || Date.now()}.pdf`
  doc.save(fname)
}

// 导出到 CSV
export async function exportToCSV(invoices: Invoice[]): Promise<void> {
  const headers = ['发票号码', '发票代码', '发票类型', '销售方名称', '购买方名称', '价税合计', '税额', '税率', '开票日期', '状态']
  const rows = invoices.map((inv) => [
    inv.invoiceNumber || '',
    inv.invoiceCode || '',
    formatInvoiceType(inv.invoiceType),
    inv.sellerName || '',
    inv.buyerName || '',
    (inv.totalAmount || 0).toString(),
    (inv.taxAmount || 0).toString(),
    formatTaxRate(inv.taxRate),
    formatDate(inv.invoiceDate || inv.createdAt),
    formatStatus(inv.status),
  ])

  const bom = '\uFEFF'
  const csvContent = bom + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `发票导出_${formatDate(new Date().toISOString())}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
