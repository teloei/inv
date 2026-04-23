import React from 'react'
import ExportPanel from '../components/ExportPanel'

const ExportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📤 导出管理</h2>
      <ExportPanel />
    </div>
  )
}

export default ExportPage
