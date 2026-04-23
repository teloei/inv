import React, { useState, useRef, useEffect } from 'react'
import { generateQRCode, parseQRCode } from '../utils/qrcode'
import type { Invoice } from '../types/invoice'

interface QRCodePanelProps {
  invoice?: Invoice
}

const QRCodePanel: React.FC<QRCodePanelProps> = ({ invoice }) => {
  const [mode, setMode] = useState<'generate' | 'scan'>('generate')
  const [qrData, setQrData] = useState('')
  const [qrImageUrl, setQrImageUrl] = useState('')
  const [scanResult, setScanResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 生成二维码
  const handleGenerate = async () => {
    if (!qrData.trim()) {
      alert('请输入要生成二维码的内容')
      return
    }
    setLoading(true)
    try {
      const dataUrl = await generateQRCode(qrData)
      setQrImageUrl(dataUrl)
    } catch (error) {
      console.error('生成二维码失败:', error)
      alert('生成二维码失败')
    }
    setLoading(false)
  }

  // 复制二维码内容
  const handleCopy = async () => {
    await navigator.clipboard.writeText(qrData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 下载二维码
  const handleDownload = () => {
    if (!qrImageUrl) return
    const link = document.createElement('a')
    link.download = `qrcode-${Date.now()}.png`
    link.href = qrImageUrl
    link.click()
  }

  // 扫描二维码
  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      alert('无法访问摄像头，请检查权限设置')
    }
  }

  // 停止扫描
  const stopScan = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  // 处理图片上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string
      try {
        const result = await parseQRCode(dataUrl)
        setScanResult(result)
      } catch (error) {
        setScanResult('未能识别出二维码内容')
      }
    }
    reader.readAsDataURL(file)
  }

  // 使用发票数据生成二维码
  useEffect(() => {
    if (invoice) {
      const invoiceData = JSON.stringify({
        invoiceNumber: invoice.invoiceNumber,
        invoiceCode: invoice.invoiceCode,
        buyerName: invoice.buyerName,
        buyerTaxNumber: invoice.buyerTaxNumber,
        buyerAddress: invoice.buyerAddress,
        buyerPhone: invoice.buyerPhone,
        buyerBank: invoice.buyerBank,
        buyerAccount: invoice.buyerAccount,
        totalAmount: invoice.totalAmount,
      })
      setQrData(invoiceData)
    }
  }, [invoice])

  return (
    <div className="space-y-6">
      {/* 模式切换 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex space-x-4">
          <button
            onClick={() => setMode('generate')}
            className={`px-6 py-2 rounded-lg ${
              mode === 'generate' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            📱 生成二维码
          </button>
          <button
            onClick={() => setMode('scan')}
            className={`px-6 py-2 rounded-lg ${
              mode === 'scan' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            📷 扫描二维码
          </button>
        </div>
      </div>

      {/* 生成模式 */}
      {mode === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 输入 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 输入内容</h3>
            <textarea
              value={qrData}
              onChange={e => setQrData(e.target.value)}
              placeholder="输入要生成二维码的内容..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={8}
            />
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '生成中...' : '生成二维码'}
              </button>
              <button
                onClick={handleCopy}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {copied ? '已复制!' : '复制内容'}
              </button>
            </div>
          </div>

          {/* 预览 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">👁️ 二维码预览</h3>
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              {qrImageUrl ? (
                <>
                  <img src={qrImageUrl} alt="QR Code" className="max-w-full border rounded-lg" />
                  <button
                    onClick={handleDownload}
                    className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    ⬇️ 下载二维码
                  </button>
                </>
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="text-6xl mb-4">⬜</div>
                  <p>点击「生成二维码」按钮生成</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 扫描模式 */}
      {mode === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 视频/图片 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📷 扫码方式</h3>
            
            {/* 上传图片 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">上传图片识别</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="text-center text-gray-500 my-4">或</div>

            {/* 摄像头 */}
            <button
              onClick={startScan}
              className="w-full px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              📹 打开摄像头扫描
            </button>
            <button
              onClick={stopScan}
              className="w-full mt-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              停止扫描
            </button>

            <video ref={videoRef} className="hidden" />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* 结果 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 识别结果</h3>
            {scanResult ? (
              <div>
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
                  {scanResult}
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(scanResult)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  复制结果
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <div className="text-6xl mb-4">📷</div>
                <p>上传图片或打开摄像头扫描二维码</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default QRCodePanel
