# AI Product Manager Portfolio

一个具有未来科技感的个人作品集网站，专为 AI 产品经理设计。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **图标**: Lucide React

## 设计特色

- 🎨 **赛博极简风格**: 深色主题 + 发光渐变
- 💫 **毛玻璃效果**: Glassmorphism 卡片
- ✨ **流畅动画**: Framer Motion 驱动的交互动画
- 📱 **响应式设计**: 完美适配移动端
- 🚀 **高性能**: Next.js 14 优化

## 页面结构

1. **Navbar**: 悬浮导航栏，带毛玻璃效果
2. **Hero Section**: 首屏视觉焦点，渐变标题 + 科技感背景
3. **About**: 关于我
4. **Philosophy**: Vibe Coding 工作理念
5. **Projects**: Bento Box 布局的项目展示
6. **Footer**: CTA 与社交链接

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

### 启动生产服务器

```bash
npm start
# 或
yarn start
```

## 自定义内容

你可以修改以下文件来自定义内容：

- `app/page.tsx`: 主页面内容
- `components/Hero.tsx`: 首屏内容
- `components/Philosophy.tsx`: 工作理念
- `components/Projects.tsx`: 项目展示
- `components/Footer.tsx`: 底部内容和联系方式

## 项目结构

```
.
├── app/
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 主页面
├── components/
│   ├── Navbar.tsx        # 导航栏
│   ├── Hero.tsx          # 首屏
│   ├── Philosophy.tsx    # 工作理念
│   ├── Projects.tsx      # 项目展示
│   └── Footer.tsx        # 底部
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## License

MIT
