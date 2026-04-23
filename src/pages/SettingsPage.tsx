import React, { useState } from 'react'
import { useInvoiceStore } from '../stores/invoiceStore'

const SettingsPage: React.FC = () => {
  const { invoices, clearAll } = useInvoiceStore()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClearData = () => {
    if (confirm('确定要清除所有发票数据吗？此操作不可恢复！')) {
      clearAll()
      setShowConfirm(false)
    }
  }

  const handleExportBackup = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      invoices: invoices
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `发票备份_${new Date().toISOString().split('T')[0]}.json`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.invoices && Array.isArray(data.invoices)) {
          if (confirm(`将导入 ${data.invoices.length} 条发票记录。是否继续？`)) {
            const store = useInvoiceStore.getState()
            data.invoices.forEach((inv: any) => store.addInvoice(inv))
            alert('导入成功！')
          }
        } else {
          alert('文件格式不正确')
        }
      } catch {
        alert('文件读取失败')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800">⚙️ 设置</h2>

      {/* 数据管理 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">💾 数据管理</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">当前数据</div>
              <div className="text-sm text-gray-500">{invoices.length} 条发票记录</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportBackup}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              📥 导出备份
            </button>
            <label className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-center cursor-pointer">
              📤 导入备份
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 危险操作 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
        <h3 className="text-lg font-semibold text-red-600 mb-4">⚠️ 危险操作</h3>
        <p className="text-sm text-gray-500 mb-4">
          清除所有数据将删除所有发票记录，此操作不可恢复。请提前导出备份。
        </p>
        {showConfirm ? (
          <div className="space-y-3">
            <p className="text-red-600 font-medium">确定要清除所有数据吗？</p>
            <div className="flex gap-3">
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                确认清除
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
          >
            🗑️ 清除所有数据
          </button>
        )}
      </div>

      {/* 关于 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">ℹ️ 关于</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>发票助手 v1.0.0</p>
          <p>财务专用发票管理工具</p>
          <p>支持发票录入、查验、二维码、OCR识别等功能</p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
