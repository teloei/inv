import React from 'react'
import { useNavigate } from 'react-router-dom'
import OCRPanel from '../components/OCRPanel'
import { useInvoiceStore } from '../stores/invoiceStore'
import type { Invoice } from '../types/invoice'

const OCRPage: React.FC = () => {
  const navigate = useNavigate()
  const { addInvoice } = useInvoiceStore()

  const handleResult = (data: Record<string, string>) => {
    // 可以在这里处理识别结果
    console.log('OCR Result:', data)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">🔍 OCR 发票识别</h2>
      <OCRPanel onResult={handleResult} />
    </div>
  )
}

export default OCRPage
