import React from 'react'
import VerifyPanel from '../components/VerifyPanel'

const VerifyPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">🔍 发票查验</h2>
      <VerifyPanel />
    </div>
  )
}

export default VerifyPage
