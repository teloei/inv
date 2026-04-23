import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { path: '/', icon: '📊', label: '仪表盘' },
  { path: '/invoices', icon: '📄', label: '发票管理' },
  { path: '/qrcode', icon: '📱', label: '二维码' },
  { path: '/ocr', icon: '🔍', label: 'OCR识别' },
  { path: '/verify', icon: '✓', label: '发票查验' },
  { path: '/export', icon: '📤', label: '导出' },
  { path: '/settings', icon: '⚙️', label: '设置' },
]

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>
            📑 发票助手
          </h1>
          <span className={`text-2xl ${sidebarOpen && 'hidden'}`}>📑</span>
        </div>

        {/* 菜单 */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 mx-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* 折叠按钮 */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-slate-700 text-gray-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? '◀ 收起' : '▶ 展开'}
        </button>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {menuItems.find(item => item.path === location.pathname)?.label || '发票助手'}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </span>
          </div>
        </header>

        {/* 内容 */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
