import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useInvoiceStore } from '../stores/invoiceStore'
import { formatCurrency, formatDate } from '../utils/format'
import type { Invoice } from '../types/invoice'

interface InvoiceListProps {
  invoices?: Invoice[]
  showActions?: boolean
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices: propInvoices, showActions = true }) => {
  const { invoices: storeInvoices, deleteInvoice } = useInvoiceStore()
  const invoices = propInvoices || storeInvoices
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const pageSize = 10

  // 筛选
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchSearch = searchTerm === '' || 
        invoice.invoiceNumber?.includes(searchTerm) ||
        invoice.buyerName?.includes(searchTerm) ||
        invoice.sellerName?.includes(searchTerm)
      
      const matchStatus = filterStatus === 'all' || invoice.status === filterStatus
      const matchType = filterType === 'all' || invoice.invoiceType === filterType
      
      return matchSearch && matchStatus && matchType
    })
  }, [invoices, searchTerm, filterStatus, filterType])

  // 分页
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredInvoices.slice(start, start + pageSize)
  }, [filteredInvoices, currentPage])

  const totalPages = Math.ceil(filteredInvoices.length / pageSize)

  // 全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedInvoices.map(i => i.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  // 单选
  const handleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedIds(newSet)
  }

  // 删除
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条发票记录吗？')) {
      deleteInvoice(id)
    }
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return
    if (confirm(`确定要删除选中的 ${selectedIds.size} 条发票记录吗？`)) {
      selectedIds.forEach(id => deleteInvoice(id))
      setSelectedIds(new Set())
    }
  }

  // 状态标签
  const getStatusBadge = (status: Invoice['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      verified: 'bg-green-100 text-green-700',
      void: 'bg-red-100 text-red-700',
    }
    const labels = { draft: '草稿', verified: '已验证', void: '已作废' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  // 类型标签
  const getTypeBadge = (type: Invoice['invoiceType']) => {
    return (
      <span className={`px-2 py-1 rounded text-xs ${
        type === 'special' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
      }`}>
        {type === 'special' ? '专用发票' : '普通发票'}
      </span>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center shadow-sm">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无发票记录</h3>
        <p className="text-gray-500 mb-6">点击下方按钮创建第一条发票记录</p>
        <Link
          to="/invoices/new"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <span className="mr-2">+</span> 新建发票
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="搜索发票号码、购买方、销售方..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1) }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">全部状态</option>
          <option value="draft">草稿</option>
          <option value="verified">已验证</option>
          <option value="void">已作废</option>
        </select>
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value); setCurrentPage(1) }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">全部类型</option>
          <option value="normal">普通发票</option>
          <option value="special">专用发票</option>
        </select>
        {selectedIds.size > 0 && (
          <button
            onClick={handleBatchDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            删除选中 ({selectedIds.size})
          </button>
        )}
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={paginatedInvoices.length > 0 && selectedIds.size === paginatedInvoices.length}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">发票号码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">购买方</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">销售方</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">金额</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">类型</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">日期</th>
                {showActions && <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedInvoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(invoice.id)}
                      onChange={e => handleSelect(invoice.id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                      {invoice.invoiceNumber || '-'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{invoice.buyerName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{invoice.sellerName || '-'}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ¥{formatCurrency(invoice.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">{getTypeBadge(invoice.invoiceType)}</td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(invoice.status)}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">
                    {formatDate(invoice.invoiceDate)}
                  </td>
                  {showActions && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <Link
                          to={`/invoices/${invoice.id}/edit`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="编辑"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="删除"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredInvoices.length)} 条，共 {filteredInvoices.length} 条
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-2">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded ${
                        page === currentPage ? 'bg-blue-600 text-white' : 'border'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoiceList
