import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useInvoiceStore } from '../stores/invoiceStore'
import { formatCurrency, formatDate } from '../utils/format'
import QRCodePanel from '../components/QRCodePanel'

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { invoices, deleteInvoice } = useInvoiceStore()
  const invoice = invoices.find(i => i.id === id)

  if (!invoice) {
    return (
      <div className="bg-white rounded-xl p-12 text-center shadow-sm">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">发票未找到</h3>
        <p className="text-gray-500 mb-6">该发票记录不存在或已被删除</p>
        <Link to="/invoices" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          返回列表
        </Link>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm('确定要删除这条发票记录吗？')) {
      deleteInvoice(invoice.id)
      navigate('/invoices')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      verified: 'bg-green-100 text-green-700',
      void: 'bg-red-100 text-red-700',
    }
    const labels: Record<string, string> = { draft: '草稿', verified: '已验证', void: '已作废' }
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>{labels[status]}</span>
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/invoices" className="text-gray-500 hover:text-gray-700">← 返回</Link>
          <h2 className="text-2xl font-bold text-gray-800">发票详情</h2>
          {getStatusBadge(invoice.status)}
        </div>
        <div className="flex space-x-3">
          <Link to={`/invoices/${invoice.id}/edit`} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            ✏️ 编辑
          </Link>
          <button onClick={handleDelete} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
            🗑️ 删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500">发票号码：</span><span className="font-medium">{invoice.invoiceNumber || '-'}</span></div>
              <div><span className="text-gray-500">发票代码：</span><span className="font-medium">{invoice.invoiceCode || '-'}</span></div>
              <div><span className="text-gray-500">发票类型：</span><span className="font-medium">{invoice.invoiceType === 'special' ? '增值税专用发票' : '普通发票'}</span></div>
              <div><span className="text-gray-500">开票日期：</span><span className="font-medium">{formatDate(invoice.invoiceDate)}</span></div>
              <div><span className="text-gray-500">税率：</span><span className="font-medium">{invoice.taxRate}%</span></div>
              <div><span className="text-gray-500">创建时间：</span><span className="font-medium">{formatDate(invoice.createdAt)}</span></div>
            </div>
          </div>

          {/* 购买方 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🏢 购买方信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500">名称：</span><span className="font-medium">{invoice.buyerName || '-'}</span></div>
              <div><span className="text-gray-500">税号：</span><span className="font-medium">{invoice.buyerTaxNumber || '-'}</span></div>
              <div><span className="text-gray-500">地址：</span><span className="font-medium">{invoice.buyerAddress || '-'}</span></div>
              <div><span className="text-gray-500">电话：</span><span className="font-medium">{invoice.buyerPhone || '-'}</span></div>
              <div><span className="text-gray-500">开户行：</span><span className="font-medium">{invoice.buyerBank || '-'}</span></div>
              <div><span className="text-gray-500">账号：</span><span className="font-medium">{invoice.buyerAccount || '-'}</span></div>
            </div>
          </div>

          {/* 销售方 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🏪 销售方信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500">名称：</span><span className="font-medium">{invoice.sellerName || '-'}</span></div>
              <div><span className="text-gray-500">税号：</span><span className="font-medium">{invoice.sellerTaxNumber || '-'}</span></div>
              <div><span className="text-gray-500">地址：</span><span className="font-medium">{invoice.sellerAddress || '-'}</span></div>
              <div><span className="text-gray-500">电话：</span><span className="font-medium">{invoice.sellerPhone || '-'}</span></div>
              <div><span className="text-gray-500">开户行：</span><span className="font-medium">{invoice.sellerBank || '-'}</span></div>
              <div><span className="text-gray-500">账号：</span><span className="font-medium">{invoice.sellerAccount || '-'}</span></div>
            </div>
          </div>

          {/* 金额 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 金额信息</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div><div className="text-sm text-gray-500">不含税金额</div><div className="text-2xl font-bold text-gray-800">¥{formatCurrency(invoice.subtotal)}</div></div>
              <div><div className="text-sm text-gray-500">税率</div><div className="text-2xl font-bold text-gray-800">{invoice.taxRate}%</div></div>
              <div><div className="text-sm text-gray-500">税额</div><div className="text-2xl font-bold text-gray-800">¥{formatCurrency(invoice.taxAmount)}</div></div>
              <div><div className="text-sm text-gray-500">价税合计</div><div className="text-3xl font-bold text-blue-600">¥{formatCurrency(invoice.totalAmount)}</div></div>
            </div>
          </div>

          {/* 备注 */}
          {invoice.remark && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 备注</h3>
              <p className="text-gray-700">{invoice.remark}</p>
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📱 开票二维码</h3>
            <QRCodePanel invoice={invoice} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetailPage
