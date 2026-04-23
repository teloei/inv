import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useInvoiceStore } from '../stores/invoiceStore'
import { formatCurrency, formatDate } from '../utils/format'

const Dashboard: React.FC = () => {
  const { invoices } = useInvoiceStore()

  // 统计数据
  const stats = useMemo(() => {
    const total = invoices.length
    const verified = invoices.filter(i => i.status === 'verified').length
    const draft = invoices.filter(i => i.status === 'draft').length
    const voided = invoices.filter(i => i.status === 'void').length
    const totalAmount = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0)
    const totalTax = invoices.reduce((sum, i) => sum + (i.taxAmount || 0), 0)
    
    // 本月数据
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthInvoices = invoices.filter(i => {
      const date = new Date(i.invoiceDate || i.createdAt)
      return date >= monthStart
    })
    const monthAmount = monthInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0)

    return { total, verified, draft, voided, totalAmount, totalTax, monthAmount }
  }, [invoices])

  // 最近发票
  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  }, [invoices])

  // 月度趋势（最近6个月）
  const monthlyTrend = useMemo(() => {
    const months: Record<string, number> = {}
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months[key] = 0
    }
    
    invoices.forEach(invoice => {
      const date = new Date(invoice.invoiceDate || invoice.createdAt)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (months[key] !== undefined) {
        months[key] += invoice.totalAmount || 0
      }
    })
    
    return Object.entries(months).map(([month, amount]) => ({
      month,
      label: new Date(month + '-01').toLocaleDateString('zh-CN', { month: 'short' }),
      amount
    }))
  }, [invoices])

  const maxAmount = Math.max(...monthlyTrend.map(m => m.amount), 1)

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-100">发票总数</div>
              <div className="text-3xl font-bold mt-1">{stats.total}</div>
            </div>
            <div className="text-4xl opacity-80">📄</div>
          </div>
          <div className="mt-4 text-sm text-blue-100">
            本月新增 {stats.monthAmount > 0 ? '¥' + formatCurrency(stats.monthAmount) : '0'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-100">已验证</div>
              <div className="text-3xl font-bold mt-1">{stats.verified}</div>
            </div>
            <div className="text-4xl opacity-80">✓</div>
          </div>
          <div className="mt-4 text-sm text-green-100">
            占比 {stats.total > 0 ? ((stats.verified / stats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-amber-100">草稿</div>
              <div className="text-3xl font-bold mt-1">{stats.draft}</div>
            </div>
            <div className="text-4xl opacity-80">📝</div>
          </div>
          <div className="mt-4 text-sm text-amber-100">
            待完善
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-100">总金额</div>
              <div className="text-2xl font-bold mt-1">¥{formatCurrency(stats.totalAmount)}</div>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
          <div className="mt-4 text-sm text-purple-100">
            税额 ¥{formatCurrency(stats.totalTax)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 图表 */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 月度趋势</h3>
          <div className="h-64 flex items-end justify-around space-x-2">
            {monthlyTrend.map((item, index) => (
              <div key={item.month} className="flex flex-col items-center flex-1">
                <div className="text-sm text-gray-500 mb-2">
                  ¥{formatCurrency(item.amount)}
                </div>
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${Math.max((item.amount / maxAmount) * 180, item.amount > 0 ? 10 : 0)}px` }}
                />
                <div className="text-xs text-gray-500 mt-2">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ 快捷操作</h3>
          <div className="space-y-3">
            <Link
              to="/invoices/new"
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl mr-3">➕</span>
              <div>
                <div className="font-medium text-gray-800">新建发票</div>
                <div className="text-sm text-gray-500">创建新的发票记录</div>
              </div>
            </Link>
            <Link
              to="/ocr"
              className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-2xl mr-3">📷</span>
              <div>
                <div className="font-medium text-gray-800">OCR识别</div>
                <div className="text-sm text-gray-500">拍照识别发票</div>
              </div>
            </Link>
            <Link
              to="/qrcode"
              className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-2xl mr-3">📱</span>
              <div>
                <div className="font-medium text-gray-800">二维码</div>
                <div className="text-sm text-gray-500">生成/扫描二维码</div>
              </div>
            </Link>
            <Link
              to="/verify"
              className="flex items-center p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <span className="text-2xl mr-3">🔍</span>
              <div>
                <div className="font-medium text-gray-800">发票查验</div>
                <div className="text-sm text-gray-500">查验发票真伪</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 最近发票 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">📋 最近发票</h3>
          <Link to="/invoices" className="text-blue-600 hover:underline text-sm">
            查看全部 →
          </Link>
        </div>
        
        {recentInvoices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📭</div>
            <p>暂无发票记录</p>
            <Link
              to="/invoices/new"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              创建第一条发票
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">发票号码</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">购买方</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">金额</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">状态</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">日期</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map(invoice => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                        {invoice.invoiceNumber || '-'}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-gray-700">{invoice.buyerName || '-'}</td>
                    <td className="py-3 px-2 text-right font-medium">¥{formatCurrency(invoice.totalAmount)}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        invoice.status === 'verified' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'void' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {invoice.status === 'verified' ? '已验证' : invoice.status === 'void' ? '已作废' : '草稿'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-sm text-gray-500">
                      {formatDate(invoice.invoiceDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
