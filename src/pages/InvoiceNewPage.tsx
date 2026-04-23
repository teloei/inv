import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import InvoiceForm from '../components/InvoiceForm'

const InvoiceNewPage: React.FC = () => {
  const [searchParams] = useSearchParams()

  // 如果有预填数据，从 URL 参数获取
  useEffect(() => {
    const hasParams = Array.from(searchParams.keys()).length > 0
    if (hasParams) {
      console.log('Pre-filled data from OCR:', Object.fromEntries(searchParams))
    }
  }, [searchParams])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">➕ 新建发票</h2>
      <InvoiceForm />
    </div>
  )
}

export default InvoiceNewPage
