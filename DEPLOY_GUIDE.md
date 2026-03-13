# 智能客服平台部署指南

## 项目结构

```
vibe_coding/
├── app/                    # 前端 Next.js 代码
├── backend/               # 后端 Node.js API
├── lib/                   # 前端工具库
├── types/                 # TypeScript 类型定义
├── render.yaml           # Render 部署配置
└── netlify.toml          # Netlify 部署配置
```

## 部署步骤

### 第一步：推送代码到 GitHub

1. 在 GitHub 创建新仓库（例如：`smart-customer-service`）
2. 初始化本地仓库并推送：

```bash
cd d:\vibe_coding
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/smart-customer-service.git
git push -u origin main
```

### 第二步：部署后端到 Render

#### 2.1 创建 PostgreSQL 数据库

1. 访问 https://dashboard.render.com/
2. 点击 "New" → "PostgreSQL"
3. 配置：
   - Name: `smart-customer-service-db`
   - Database: `customer_service`
   - User: `customer_service`
   - Plan: **Free**
4. 点击 "Create Database"
5. 等待创建完成，复制 **Internal Database URL**

#### 2.2 创建 Web Service

1. 点击 "New" → "Web Service"
2. 连接 GitHub 仓库
3. 配置：
   - Name: `smart-customer-service-api`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. 环境变量：
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=postgresql://... (从上一步复制)
   JWT_SECRET=your-super-secret-key
   ZHIPU_API_KEY=74c6860477614d52b82d4507bccf193b.1uhK8u4bhpNuOCWh
   FRONTEND_URL=https://smart-customer-service.netlify.app
   ```
5. 点击 "Create Web Service"
6. 等待部署完成，复制服务 URL（例如：`https://smart-customer-service-api.onrender.com`）

### 第三步：部署前端到 Netlify

#### 3.1 准备前端构建

1. 修改 `next.config.js`：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

2. 修改 `lib/api.ts` 中的 API 地址：

```typescript
const API_BASE_URL = 'https://smart-customer-service-api.onrender.com/api';
```

#### 3.2 部署到 Netlify

**方式一：通过 Git 自动部署（推荐）**

1. 访问 https://app.netlify.com/
2. 点击 "Add new site" → "Import an existing project"
3. 选择 GitHub 仓库
4. 配置构建设置：
   - Base directory: (留空)
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 环境变量：
   ```
   NEXT_PUBLIC_API_URL=https://smart-customer-service-api.onrender.com/api
   ```
6. 点击 "Deploy site"

**方式二：手动上传**

1. 本地构建：
```bash
cd d:\vibe_coding
npm install
npm run build
```

2. 访问 https://app.netlify.com/
3. 点击 "Add new site" → "Deploy manually"
4. 拖拽 `dist` 文件夹上传

### 第四步：验证部署

1. **测试后端 API**：
   ```
   https://smart-customer-service-api.onrender.com/health
   ```
   应该返回：`{"status":"ok"}`

2. **访问前端网站**：
   ```
   https://smart-customer-service.netlify.app
   ```

3. **测试功能**：
   - 注册账号
   - 创建知识库
   - 上传文档
   - 开始对话

## 故障排查

### 后端无法连接数据库
- 检查 DATABASE_URL 是否正确
- 确认 PostgreSQL 服务状态

### 前端无法连接后端
- 检查 CORS 配置（FRONTEND_URL 环境变量）
- 确认 API 地址是否正确

### 文档上传失败
- 检查 Render 磁盘空间
- 确认文件大小限制（50MB）

## 重要提示

1. **Render 免费版限制**：
   - 服务会在 15 分钟无活动后休眠
   - 首次访问可能需要等待 30 秒唤醒

2. **数据持久化**：
   - PostgreSQL 数据会持久保存
   - 上传的文件在 Render 免费版中可能在重启后丢失

3. **安全建议**：
   - 生产环境请使用更强的 JWT_SECRET
   - 定期备份数据库
