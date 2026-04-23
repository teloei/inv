import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInvoiceStore } from '../stores/invoiceStore'
import type { Invoice } from '../types/invoice'

interface InvoiceFormProps {
  invoice?: Invoice
  onSuccess?: () => void
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onSuccess }) => {
  const navigate = useNavigate()
  const { addInvoice, updateInvoice } = useInvoiceStore()
  const isEdit = !!invoice

  const [formData, setFormData] = useState<Partial<Invoice>>(() => {
    if (invoice) return invoice
    return {
      invoiceNumber: '',
      invoiceCode: '',
      invoiceType: 'normal',
      sellerName: '',
      sellerTaxNumber: '',
      sellerAddress: '',
      sellerPhone: '',
      sellerBank: '',
      sellerAccount: '',
      buyerName: '',
      buyerTaxNumber: '',
      buyerAddress: '',
      buyerPhone: '',
      buyerBank: '',
      buyerAccount: '',
      totalAmount: 0,
      taxAmount: 0,
      subtotal: 0,
      taxRate: 13,
      invoiceDate: new Date().toISOString().split('T')[0],
      remark: '',
      status: 'draft',
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 计算税额
  useEffect(() => {
    const rate = formData.taxRate || 0
    const subtotal = formData.subtotal || 0
    const taxAmount = subtotal * (rate / 100)
    const totalAmount = subtotal + taxAmount
    setFormData(prev => ({ ...prev, taxAmount, totalAmount }))
  }, [formData.subtotal, formData.taxRate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
    // 清除错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.invoiceNumber?.trim()) {
      newErrors.invoiceNumber = '请输入发票号码'
    }
    if (!formData.buyerName?.trim()) {
      newErrors.buyerName = '请输入购买方名称'
    }
    if (!formData.sellerName?.trim()) {
      newErrors.sellerName = '请输入销售方名称'
    }
    if (!formData.totalAmount || formData.totalAmount <= 0) {
      newErrors.totalAmount = '请输入正确的金额'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    const now = new Date().toISOString()
    
    if (isEdit && invoice) {
      updateInvoice(invoice.id, { ...formData, updatedAt: now })
    } else {
      addInvoice({
        ...formData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      } as Invoice)
    }

    onSuccess?.()
    navigate('/invoices')
  }

  const inputClass = (name: string) => `
    w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${errors[name] ? 'border-red-500' : 'border-gray-300'}
  `

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本信息 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">发票号码 *</label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber || ''}
              onChange={handleChange}
              className={inputClass('invoiceNumber')}
              placeholder="发票号码"
            />
            {errors.invoiceNumber && <p className="text-red-500 text-xs mt-1">{errors.invoiceNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">发票代码</label>
            <input
              type="text"
              name="invoiceCode"
              value={formData.invoiceCode || ''}
              onChange={handleChange}
              className={inputClass('invoiceCode')}
              placeholder="发票代码"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">发票类型</label>
            <select
              name="invoiceType"
              value={formData.invoiceType || 'normal'}
              onChange={handleChange}
              className={inputClass('invoiceType')}
            >
              <option value="normal">普通发票</option>
              <option value="special">增值税专用发票</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">开票日期</label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate || ''}
              onChange={handleChange}
              className={inputClass('invoiceDate')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">税率 (%)</label>
            <select
              name="taxRate"
              value={formData.taxRate || 13}
              onChange={handleChange}
              className={inputClass('taxRate')}
            >
              <option value="0">0%</option>
              <option value="3">3%</option>
              <option value="6">6%</option>
              <option value="9">9%</option>
              <option value="13">13%</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              name="status"
              value={formData.status || 'draft'}
              onChange={handleChange}
              className={inputClass('status')}
            >
              <option value="draft">草稿</option>
              <option value="verified">已验证</option>
              <option value="void">已作废</option>
            </select>
          </div>
        </div>
      </div>

      {/* 购买方信息 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🏢 购买方信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">购买方名称 *</label>
            <input
              type="text"
              name="buyerName"
              value={formData.buyerName || ''}
              onChange={handleChange}
              className={inputClass('buyerName')}
              placeholder="公司名称"
            />
            {errors.buyerName && <p className="text-red-500 text-xs mt-1">{errors.buyerName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">纳税人识别号</label>
            <input
              type="text"
              name="buyerTaxNumber"
              value={formData.buyerTaxNumber || ''}
              onChange={handleChange}
              className={inputClass('buyerTaxNumber')}
              placeholder="税号"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
            <input
              type="text"
              name="buyerAddress"
              value={formData.buyerAddress || ''}
              onChange={handleChange}
              className={inputClass('buyerAddress')}
              placeholder="地址"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
            <input
              type="text"
              name="buyerPhone"
              value={formData.buyerPhone || ''}
              onChange={handleChange}
              className={inputClass('buyerPhone')}
              placeholder="电话"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">开户行</label>
            <input
              type="text"
              name="buyerBank"
              value={formData.buyerBank || ''}
              onChange={handleChange}
              className={inputClass('buyerBank')}
              placeholder="开户银行"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">账号</label>
            <input
              type="text"
              name="buyerAccount"
              value={formData.buyerAccount || ''}
              onChange={handleChange}
              className={inputClass('buyerAccount')}
              placeholder="银行账号"
            />
          </div>
        </div>
      </div>

      {/* 销售方信息 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🏪 销售方信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">销售方名称 *</label>
            <input
              type="text"
              name="sellerName"
              value={formData.sellerName || ''}
              onChange={handleChange}
              className={inputClass('sellerName')}
              placeholder="公司名称"
            />
            {errors.sellerName && <p className="text-red-500 text-xs mt-1">{errors.sellerName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">纳税人识别号</label>
            <input
              type="text"
              name="sellerTaxNumber"
              value={formData.sellerTaxNumber || ''}
              onChange={handleChange}
              className={inputClass('sellerTaxNumber')}
              placeholder="税号"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
            <input
              type="text"
              name="sellerAddress"
              value={formData.sellerAddress || ''}
              onChange={handleChange}
              className={inputClass('sellerAddress')}
              placeholder="地址"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
            <input
              type="text"
              name="sellerPhone"
              value={formData.sellerPhone || ''}
              onChange={handleChange}
              className={inputClass('sellerPhone')}
              placeholder="电话"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">开户行</label>
            <input
              type="text"
              name="sellerBank"
              value={formData.sellerBank || ''}
              onChange={handleChange}
              className={inputClass('sellerBank')}
              placeholder="开户银行"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">账号</label>
            <input
              type="text"
              name="sellerAccount"
              value={formData.sellerAccount || ''}
              onChange={handleChange}
              className={inputClass('sellerAccount')}
              placeholder="银行账号"
            />
          </div>
        </div>
      </div>

      {/* 金额信息 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 金额信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">不含税金额</label>
            <input
              type="number"
              name="subtotal"
              value={formData.subtotal || 0}
              onChange={handleChange}
              className={inputClass('subtotal')}
              placeholder="0.00"
              step="0.01"
            />
            {errors.totalAmount && <p className="text-red-500 text-xs mt-1">{errors.totalAmount}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">税率 (%)</label>
            <input
              type="number"
              name="taxRate"
              value={formData.taxRate || 13}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">税额</label>
            <input
              type="number"
              name="taxAmount"
              value={formData.taxAmount?.toFixed(2) || '0.00'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">价税合计</label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount?.toFixed(2) || '0.00'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-bold text-lg"
              disabled
            />
          </div>
        </div>
      </div>

      {/* 备注 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 备注</h3>
        <textarea
          name="remark"
          value={formData.remark || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="输入备注信息..."
        />
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/invoices')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isEdit ? '保存修改' : '创建发票'}
        </button>
      </div>
    </form>
  )
}

export default InvoiceForm
