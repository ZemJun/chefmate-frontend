# ChefMate AI - 前端 (React)

欢迎来到 ChefMate AI 的前端部分！本项目基于 React 和 Material-UI (MUI) 构建，提供一个现代、美观且响应式的用户界面，与后端 API 进行交互。

## 功能特性

- **现代 UI/UX**: 使用 [Material-UI](https://mui.com/) 构建，提供精致、一致的用户体验。
- **响应式设计**: 适配桌面、平板和移动设备。
- **流畅动画**: 使用 [Framer Motion](https://www.framer.com/motion/) 为页面过渡和组件交互添加平滑动画。
- **状态管理**: 通过 React Context (AuthProvider, NotificationProvider) 管理全局状态。
- **组件化开发**: 清晰的组件结构，易于维护和扩展。
- **动态路由**: 使用 [React Router](https://reactrouter.com/) 管理页面导航。
- **自定义 Hooks**: 封装可复用的逻辑（如 `useApi`, `useFavorite`）。

## 技术栈

- **框架**: [React](https://react.dev/) 18+
- **UI 库**: [Material-UI (MUI)](https://mui.com/)
- **路由**: [React Router](https://reactrouter.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **API 请求**: [Axios](https://axios-http.com/)
- **表单组件**: [React Select](https://react-select.com/)
- **包管理器**: npm 或 yarn

---

## 环境搭建与运行指南

### 1. 先决条件

- Node.js 16+
- npm (Node.js 包管理器) 或 yarn

### 2. 进入前端目录

### 3. 安装依赖

使用 npm 或 yarn 安装项目所需的所有库。

**使用 npm:**
```bash
npm install
```

**使用 yarn:**
```bash
yarn install
```

### 4. 配置后端 API 地址

前端应用需要知道后端 API 的地址才能与之通信。

打开 `src/api/api.js` 文件，找到 `axios.create` 部分，并确保 `baseURL` 指向您正在运行的后端服务器地址。

```javascript
// src/api/api.js

const apiClient = axios.create({
  // 确保这里的地址和端口与您的后端服务一致
  baseURL: 'http://127.0.0.1:8000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 5. 运行开发服务器

一切就绪！现在可以启动前端应用了。

**使用 npm:**
```bash
npm start
```

**使用 yarn:**
```bash
yarn start
```

您的浏览器将自动打开 `http://localhost:3000`，您可以在此与 ChefMate AI 应用进行交互。

---

## 项目结构概览

```
src/
├── api/          # 存放所有 API 请求函数
├── components/   # 可复用的 UI 组件 (如 Layout, RecipeCard)
├── context/      # React Context (全局状态管理)
├── hooks/        # 自定义 React Hooks
├── pages/        # 页面级组件 (每个路由对应一个页面)
├── App.js        # 应用主路由和布局
└── index.js      # 应用入口，主题配置
```

## 注意事项

- **CORS 跨域问题**: 后端 `settings.py` 中的 `CORS_ALLOW_ALL_ORIGINS = True` 设置仅适用于开发环境。在生产部署时，应将其配置为只允许您的前端域名访问。
- **后端服务**: 在启动前端应用前，请确保后端 Django 服务正在运行，否则前端将无法获取数据。