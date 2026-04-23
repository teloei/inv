import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import InvoiceListPage from './pages/InvoiceListPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import InvoiceNewPage from './pages/InvoiceNewPage'
import QRCodePage from './pages/QRCodePage'
import OCRPage from './pages/OCRPage'
import VerifyPage from './pages/VerifyPage'
import ExportPage from './pages/ExportPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoices" element={<InvoiceListPage />} />
          <Route path="/invoices/new" element={<InvoiceNewPage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="/invoices/:id/edit" element={<InvoiceNewPage />} />
          <Route path="/qrcode" element={<QRCodePage />} />
          <Route path="/ocr" element={<OCRPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
