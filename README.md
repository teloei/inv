# 发票助手 (Invoice Assistant)

财务专用发票管理工具，支持发票录入、查验、二维码生成、OCR识别等完整功能。

## 功能特性

### 核心功能
- 📝 **发票管理** - 发票信息的增删改查，支持批量操作
- 📱 **二维码** - 开票二维码生成，支持扫码录入
- 🔍 **发票查验** - 对接税务系统进行真伪查验
- 🖼️ **OCR识别** - 拍照或上传图片自动识别发票信息
- 💾 **数据存储** - 本地存储 + 云端同步
- 📤 **导出打印** - 支持导出 Excel、PDF、打印

### 技术栈
- React 18 + TypeScript
- Vite (构建工具)
- Tailwind CSS (样式)
- React Router (路由)
- Zustand (状态管理)
- Lucide React (图标)

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 部署

### Vercel 部署
```bash
npm i -g vercel
vercel
```

### Cloudflare Pages 部署
```bash
npm run build
# 将 dist 目录部署到 Cloudflare Pages
```

## 项目结构

```
src/
├── components/     # UI 组件
├── pages/          # 页面
├── services/      # API 服务
├── stores/        # 状态管理
├── utils/         # 工具函数
├── types/         # TypeScript 类型
└── styles/        # 全局样式
```

## License

MIT
