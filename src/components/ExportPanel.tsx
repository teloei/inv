import React, { useState } from 'react'
import { useInvoiceStore } from '../stores/invoiceStore'
import { exportToExcel, exportToPDF } from '../utils/export'

const ExportPanel: React.FC = () => {
  const { invoices } = useInvoiceStore()
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('excel')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set())

  // 筛选日期范围内的发票
  const filteredInvoices = invoices.filter(invoice => {
    if (!dateRange.start && !dateRange.end) return true
    const invoiceDate = invoice.invoiceDate || invoice.createdAt
    if (dateRange.start && invoiceDate < dateRange.start) return false
    if (dateRange.end && invoiceDate > dateRange.end) return false
    return true
  })

  // 全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(new Set(filteredInvoices.map(i => i.id)))
    } else {
      setSelectedInvoices(new Set())
    }
  }

  // 单选
  const handleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedInvoices)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedInvoices(newSet)
  }

  // 导出
  const handleExport = async () => {
    const invoicesToExport = selectedInvoices.size > 0
      ? invoices.filter(i => selectedInvoices.has(i.id))
      : filteredInvoices

    if (invoicesToExport.length === 0) {
      alert('没有可导出的发票数据')
      return
    }

    setExporting(true)

    try {
      if (exportFormat === 'excel') {
        await exportToExcel(invoicesToExport)
      } else {
        await exportToPDF(invoicesToExport)
      }
    } catch (error) {
      console.error('导出失败:', error)
      alert('导出失败，请重试')
    }

    setExporting(false)
  }

  // 打印
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* 统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{invoices.length}</div>
          <div className="text-gray-500">发票总数</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-green-600">
            {invoices.filter(i => i.status === 'verified').length}
          </div>
          <div className="text-gray-500">已验证</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-gray-600">
            {invoices.filter(i => i.status === 'draft').length}
          </div>
          <div className="text-gray-500">草稿</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-emerald-600">
            ¥{invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0).toLocaleString()}
          </div>
          <div className="text-gray-500">总金额</div>
        </div>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 数据筛选</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">导出格式</label>
            <select
              value={exportFormat}
              onChange={e => setExportFormat(e.target.value as 'excel' | 'pdf')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="pdf">PDF (.pdf)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              重置筛选
            </button>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          共筛选出 {filteredInvoices.length} 条发票记录
          {selectedInvoices.size > 0 && `（已选择 ${selectedInvoices.size} 条）`}
        </div>
      </div>

      {/* 选择发票 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">📋 选择要导出的发票</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedInvoices.size === filteredInvoices.length && filteredInvoices.length > 0}
              onChange={e => handleSelectAll(e.target.checked)}
              className="mr-2 rounded"
            />
            <span className="text-sm text-gray-600">全选</span>
          </label>
        </div>

        <div className="max-h-64 overflow-y-auto border rounded-lg">
          {filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              暂无发票数据
            </div>
          ) : (
            <div className="divide-y">
              {filteredInvoices.map(invoice => (
                <label
                  key={invoice.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedInvoices.has(invoice.id)}
                    onChange={e => handleSelect(invoice.id, e.target.checked)}
                    className="mr-3 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{invoice.invoiceNumber || '无号码'}</div>
                    <div className="text-sm text-gray-500">
                      {invoice.buyerName} - ¥{invoice.totalAmount?.toLocaleString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    invoice.status === 'verified' ? 'bg-green-100 text-green-700' :
                    invoice.status === 'void' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {invoice.status === 'verified' ? '已验证' : invoice.status === 'void' ? '已作废' : '草稿'}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 导出操作 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📤 导出操作</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExport}
            disabled={exporting || filteredInvoices.length === 0}
            className="flex-1 min-w-[200px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {exporting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                导出中...
              </>
            ) : (
              <>
                <span className="mr-2">{exportFormat === 'excel' ? '📊' : '📄'}</span>
                导出{exportFormat === 'excel' ? 'Excel' : 'PDF'}
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            🖨️ 打印
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <ul className="space-y-1">
            <li>• 导出将包含发票的所有详细信息</li>
            <li>• Excel 格式适合数据分析和统计</li>
            <li>• PDF 格式适合打印和归档</li>
            <li>• 不选择发票时，默认导出全部筛选结果</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ExportPanel
