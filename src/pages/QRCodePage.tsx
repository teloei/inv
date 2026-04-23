import React from 'react'
import QRCodePanel from '../components/QRCodePanel'

const QRCodePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📱 二维码工具</h2>
      <QRCodePanel />
    </div>
  )
}

export default QRCodePage
