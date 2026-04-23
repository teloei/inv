/**
 * OCR 识别工具
 * 使用浏览器原生 API 进行图片文字识别
 */

// 检查浏览器是否支持 OCR
export const isOCRAvailable = (): boolean => {
  return 'createImageBitmap' in window && typeof window.ImageBitmap === 'function'
}

// 使用 TensorFlow.js 的 OCR.js 进行文字识别
export interface OCRResult {
  text: string
  confidence: number
}

/**
 * 使用浏览器原生 Canvas + 简单图像处理进行文字提取提示
 * 注意：这是一个模拟实现，实际生产环境建议使用：
 * 1. Tesseract.js
 * 2. 百度 OCR API
 * 3. 腾讯 OCR API
 */
export const recognizeText = async (
  imageData: ImageData | HTMLImageElement | HTMLCanvasElement
): Promise<OCRResult> => {
  return new Promise((resolve) => {
    // 模拟 OCR 过程
    setTimeout(() => {
      resolve({
        text: '模拟识别结果：请使用专业的 OCR 服务',
        confidence: 0.8
      })
    }, 1000)
  })
}

/**
 * 图片预处理
 */
export const preprocessImage = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): void => {
  // 灰度化
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
    data[i] = avg
    data[i + 1] = avg
    data[i + 2] = avg
  }
  
  ctx.putImageData(imageData, 0, 0)
}

/**
 * 提取发票关键字段（模拟）
 * 根据发票格式匹配关键信息
 */
export const extractInvoiceFields = (text: string): Record<string, string> => {
  const fields: Record<string, string> = {}
  
  // 发票号码
  const invoiceNumberMatch = text.match(/发票号码[：:]\s*([A-Z0-9]{8,20})/i)
  if (invoiceNumberMatch) {
    fields.invoiceNumber = invoiceNumberMatch[1]
  }
  
  // 发票代码
  const invoiceCodeMatch = text.match(/发票代码[：:]\s*([0-9]{10,12})/i)
  if (invoiceCodeMatch) {
    fields.invoiceCode = invoiceCodeMatch[1]
  }
  
  // 金额
  const amountMatch = text.match(/金额[：:]\s*￥?\s*([\d,]+\.?\d*)/)
  if (amountMatch) {
    fields.totalAmount = amountMatch[1].replace(/,/g, '')
  }
  
  // 税号
  const taxMatch = text.match(/(?:纳税人识别号|税号)[：:]\s*([A-Z0-9]{15,20})/i)
  if (taxMatch) {
    fields.taxNumber = taxMatch[1]
  }
  
  return fields
}
