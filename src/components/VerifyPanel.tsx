import React, { useState } from 'react'
import { useInvoiceStore } from '../stores/invoiceStore'

interface VerifyPanelProps {
  invoiceId?: string
}

interface VerifyResult {
  status: 'success' | 'error' | 'warning'
  message: string
  details?: Record<string, string>
  timestamp: string
}

const VerifyPanel: React.FC<VerifyPanelProps> = ({ invoiceId }) => {
  const { invoices, updateInvoice } = useInvoiceStore()
  const [invoiceCode, setInvoiceCode] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [verifyHistory, setVerifyHistory] = useState<VerifyResult[]>([])

  // 获取发票详情
  const invoice = invoiceId ? invoices.find(i => i.id === invoiceId) : null

  // 查验
  const handleVerify = async () => {
    if (!invoiceCode.trim() || !invoiceNumber.trim()) {
      alert('请输入发票代码和发票号码')
      return
    }

    setIsVerifying(true)
    setResult(null)

    // 模拟查验过程
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟查验结果
    const mockResult: VerifyResult = {
      status: Math.random() > 0.3 ? 'success' : Math.random() > 0.5 ? 'warning' : 'error',
      message: '',
      details: {
        '发票代码': invoiceCode,
        '发票号码': invoiceNumber,
        '开票日期': new Date().toLocaleDateString('zh-CN'),
        '开票金额': '¥1,260.00',
        '销售方': '上海某某贸易有限公司',
        '购买方': '北京某某科技有限公司',
      },
      timestamp: new Date().toISOString(),
    }

    if (mockResult.status === 'success') {
      mockResult.message = '✅ 查验成功！该发票为真票，信息一致。'
      // 更新发票状态
      const inv = invoices.find(i => i.invoiceCode === invoiceCode && i.invoiceNumber === invoiceNumber)
      if (inv) {
        updateInvoice(inv.id, { status: 'verified', updatedAt: new Date().toISOString() })
      }
    } else if (mockResult.status === 'warning') {
      mockResult.message = '⚠️ 查验通过，但存在以下信息需要核对。'
    } else {
      mockResult.message = '❌ 查验失败！该发票信息与系统记录不符，请核实。'
    }

    setResult(mockResult)
    setVerifyHistory(prev => [mockResult, ...prev.slice(0, 9)])
    setIsVerifying(false)
  }

  // 获取状态颜色
  const getStatusColor = (status: VerifyResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* 说明 */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start">
          <span className="text-2xl mr-3">ℹ️</span>
          <div>
            <h4 className="font-semibold text-blue-800">发票查验说明</h4>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• 本功能模拟连接国家税务总局发票查验平台</li>
              <li>• 支持查验增值税普通发票和专用发票</li>
              <li>• 查验结果仅供参考，以税务机关官方结果为准</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 输入表单 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 输入发票信息</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">发票代码 *</label>
            <input
              type="text"
              value={invoice?.invoiceCode || invoiceCode}
              onChange={e => setInvoiceCode(e.target.value)}
              placeholder="请输入发票代码"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">发票号码 *</label>
            <input
              type="text"
              value={invoice?.invoiceNumber || invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              placeholder="请输入发票号码"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">验证码（可选）</label>
            <input
              type="text"
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value)}
              placeholder="图片验证码"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {isVerifying ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              查验中，请稍候...
            </>
          ) : (
            <>
              <span className="mr-2">🔍</span>
              开始查验
            </>
          )}
        </button>
      </div>

      {/* 查验结果 */}
      {result && (
        <div className={`rounded-xl p-6 border ${getStatusColor(result.status)}`}>
          <h3 className="text-lg font-semibold mb-4">📋 查验结果</h3>
          <p className="text-lg mb-4">{result.message}</p>
          
          {result.details && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {Object.entries(result.details).map(([key, value]) => (
                <div key={key} className="bg-white/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">{key}</div>
                  <div className="font-medium">{value}</div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            查验时间：{new Date(result.timestamp).toLocaleString('zh-CN')}
          </div>
        </div>
      )}

      {/* 历史记录 */}
      {verifyHistory.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📜 查验历史</h3>
          <div className="space-y-3">
            {verifyHistory.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {item.details?.['发票代码']} - {item.details?.['发票号码']}
                    </div>
                    <div className="text-sm mt-1">{item.message}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleString('zh-CN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VerifyPanel
