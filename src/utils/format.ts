import { format, parseISO } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  if (!dateString) return ''
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd')
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return ''
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd HH:mm:ss')
  } catch {
    return dateString
  }
}

export function formatTaxRate(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`
}

export function formatInvoiceType(type: 'normal' | 'special'): string {
  return type === 'normal' ? '增值税普通发票' : '增值税专用发票'
}

export function formatStatus(status: 'draft' | 'verified' | 'void'): string {
  const map = { draft: '草稿', verified: '已查验', void: '已作废' }
  return map[status]
}

export function amountToChinese(num: number): string {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟']
  const bigUnits = ['', '万', '亿']

  if (num === 0) return '零元整'

  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)
  const jiao = Math.floor(decPart / 10)
  const fen = decPart % 10

  let result = ''

  if (intPart > 0) {
    const str = intPart.toString()
    const groups: string[] = []
    for (let i = str.length; i > 0; i -= 4) {
      groups.unshift(str.substring(Math.max(0, i - 4), i))
    }

    groups.forEach((group, gi) => {
      const groupIndex = groups.length - 1 - gi
      let groupResult = ''
      let zeroFlag = false

      for (let i = 0; i < group.length; i++) {
        const d = parseInt(group[i])
        const unitIndex = group.length - 1 - i

        if (d === 0) {
          zeroFlag = true
        } else {
          if (zeroFlag) {
            groupResult += digits[0]
            zeroFlag = false
          }
          groupResult += digits[d] + units[unitIndex]
        }
      }

      if (groupResult) {
        result += groupResult + bigUnits[groupIndex]
      }
    })

    result += '元'
  }

  if (jiao > 0) {
    result += digits[jiao] + '角'
  }
  if (fen > 0) {
    result += digits[fen] + '分'
  } else if (jiao === 0) {
    result += '整'
  }

  return result
}
