import React, { useState, useRef, useCallback } from 'react'
import { isOCRAvailable, extractInvoiceFields } from '../utils/ocr'

interface OCRPanelProps {
  onResult?: (data: Record<string, string>) => void
}

const OCRPanel: React.FC<OCRPanelProps> = ({ onResult }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    text: string
    fields: Record<string, string>
  } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 处理图片选择
  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  // 拖放处理
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageSelect(file)
  }, [])

  // 点击上传
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  // 模拟 OCR 识别
  const handleRecognize = async () => {
    if (!selectedImage) return
    
    setIsProcessing(true)
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟识别结果
    const mockText = `
      发票代码：144031900110
      发票号码：${Math.random().toString().slice(2, 12)}
      购买方名称：北京某某科技有限公司
      纳税人识别号：91110108MA0XXXXXX
      销售方名称：上海某某贸易有限公司
      金额：¥1,130.00
      税额：¥130.00
      价税合计：¥1,260.00
    `
    
    const fields = extractInvoiceFields(mockText)
    
    setResult({
      text: mockText,
      fields: {
        invoiceCode: '144031900110',
        invoiceNumber: Math.random().toString().slice(2, 12),
        buyerName: '北京某某科技有限公司',
        buyerTaxNumber: '91110108MA0XXXXXX',
        sellerName: '上海某某贸易有限公司',
        totalAmount: '1260.00',
        taxAmount: '130.00',
      }
    })
    
    onResult?.(fields)
    setIsProcessing(false)
  }

  // 重新识别
  const handleReset = () => {
    setSelectedImage(null)
    setResult(null)
  }

  // 使用结果创建发票
  const handleCreateInvoice = () => {
    if (result?.fields) {
      // 将字段转换为 URL 参数并跳转到新建页面
      const params = new URLSearchParams(result.fields)
      window.location.href = `/invoices/new?${params.toString()}`
    }
  }

  return (
    <div className="space-y-6">
      {/* 说明 */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start">
          <span className="text-2xl mr-3">💡</span>
          <div>
            <h4 className="font-semibold text-blue-800">OCR 识别说明</h4>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• 支持拍照或上传发票图片</li>
              <li>• 推荐使用清晰的发票照片以提高识别准确率</li>
              <li>• 识别后可手动编辑确认信息</li>
              <li>• 识别结果会自动填入发票表单</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 上传区域 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🖼️ 上传发票图片</h3>
        
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={e => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
            className="hidden"
          />
          
          {selectedImage ? (
            <div>
              <img
                src={selectedImage}
                alt="Selected"
                className="max-h-64 mx-auto rounded-lg shadow"
              />
              <p className="mt-4 text-sm text-gray-500">点击更换图片</p>
            </div>
          ) : (
            <>
              <div className="text-6xl mb-4">📷</div>
              <p className="text-lg text-gray-700 mb-2">点击或拖拽图片到此处</p>
              <p className="text-sm text-gray-500">支持 JPG、PNG 格式</p>
            </>
          )}
        </div>

        {selectedImage && (
          <div className="mt-4 flex space-x-4">
            <button
              onClick={handleRecognize}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  识别中...
                </>
              ) : (
                <>
                  <span className="mr-2">🔍</span>
                  开始识别
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              重新上传
            </button>
          </div>
        )}
      </div>

      {/* 识别结果 */}
      {result && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">✅ 识别结果</h3>
          
          {/* 提取的字段 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(result.fields).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">{key}</div>
                <div className="font-medium text-gray-800 truncate">{value || '-'}</div>
              </div>
            ))}
          </div>

          {/* 原文 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">📄 识别原文</h4>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border">
              {result.text}
            </pre>
          </div>

          {/* 操作 */}
          <div className="flex space-x-4">
            <button
              onClick={handleCreateInvoice}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              📝 使用此信息创建发票
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              重新识别
            </button>
          </div>
        </div>
      )}

      {/* 提示 */}
      {!isOCRAvailable() && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h4 className="font-semibold text-amber-800">功能提示</h4>
              <p className="mt-1 text-sm text-amber-700">
                当前使用模拟 OCR 功能。如需更准确的识别结果，建议集成专业的 OCR 服务（如百度 OCR、腾讯 OCR 等）。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OCRPanel
