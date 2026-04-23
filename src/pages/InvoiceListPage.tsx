import React from 'react'
import { Link } from 'react-router-dom'
import InvoiceList from '../components/InvoiceList'

const InvoiceListPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📄 发票管理</h2>
        <Link
          to="/invoices/new"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <span className="mr-2">+</span> 新建发票
        </Link>
      </div>
      <InvoiceList />
    </div>
  )
}

export default InvoiceListPage
