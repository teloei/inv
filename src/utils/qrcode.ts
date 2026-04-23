import QRCode from 'qrcode'

export async function generateQRCode(text: string): Promise<string> {
  try {
    const url = await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: '#1e40af',
        light: '#ffffff',
      },
    })
    return url
  } catch (err) {
    console.error('QR Code generation failed:', err)
    throw new Error('二维码生成失败')
  }
}

export function generateInvoiceQRContent(invoice: {
  invoiceCode: string
  invoiceNumber: string
  totalAmount: number
  invoiceDate: string
}): string {
  return `${invoice.invoiceCode},${invoice.invoiceNumber},${invoice.totalAmount},${invoice.invoiceDate}`
}

export function downloadQRCode(dataUrl: string, filename?: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename || `qrcode_${Date.now()}.png`
  link.click()
}

// 解析二维码内容（简化版，实际需要使用 jsQR 等库）
export async function parseQRCode(imageData: string): Promise<string> {
  // 这里是一个模拟实现
  // 实际使用中需要调用专业的二维码识别库或 API
  return new Promise((resolve) => {
    setTimeout(() => {
      // 尝试解析 JSON 格式的数据
      try {
        const data = JSON.parse(imageData)
        resolve(JSON.stringify(data, null, 2))
      } catch {
        // 如果不是 JSON，直接返回原始数据
        resolve(imageData)
      }
    }, 500)
  })
}
