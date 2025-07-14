# 🚀 多平台媒体解析器

一个现代化的多平台无水印媒体解析工具，支持小红书、抖音、网易云音乐等主流平台的内容解析与下载。

## ✨ 功能特性

### 🎯 核心功能

-   **多平台支持**：小红书、抖音、网易云音乐、皮皮虾
-   **无水印下载**：自动去除平台水印，获取高清原图/原视频
-   **智能识别**：自动识别分享链接，粘贴即用
-   **批量下载**：一键下载所有图片、视频或音频
-   **实时预览**：解析结果即时预览，支持图片轮播和视频播放

### 🎨 用户体验

-   **响应式设计**：完美适配手机、平板、桌面设备
-   **现代化 UI**：渐变主题色，流畅动画效果
-   **操作便捷**：简洁直观的操作界面
-   **加载优化**：骨架屏加载，提升用户体验

### ⚡ 技术特性

-   **极速解析**：优化的 API 请求，快速获取媒体内容
-   **类型安全**：完整的 TypeScript 类型定义
-   **组件化架构**：高度可复用的 Vue 组件设计
-   **错误处理**：完善的错误提示和重试机制

## 🏗️ 技术栈

| 技术            | 用途        | 版本     |
| --------------- | ----------- | -------- |
| **Vue 3**       | 前端框架    | ^3.5.17  |
| **Vite**        | 构建工具    | ^7.0.2   |
| **TypeScript**  | 类型系统    | 内置支持 |
| **Vue Router**  | 路由管理    | ^4.5.1   |
| **Axios**       | HTTP 客户端 | ^1.10.0  |
| **FontAwesome** | 图标库      | ^6.7.2   |

## 📁 项目结构

```
xhs-parser/
├── public/                 # 静态资源
│   ├── favicon.ico        # 网站图标
│   ├── _redirects         # Netlify重定向规则
│   └── ...                # 其他静态文件
├── src/                   # 源代码目录
│   ├── components/        # Vue组件
│   │   ├── common/        # 通用组件
│   │   │   ├── ImageSection.vue    # 图片展示组件
│   │   │   ├── VideoSection.vue    # 视频播放组件
│   │   │   ├── Loading.vue         # 加载动画
│   │   │   ├── PostInfo.vue        # 帖子信息
│   │   │   └── ExampleButton.vue   # 示例按钮
│   │   ├── Tabs/          # 标签页组件
│   │   ├── XhsParser.vue  # 小红书解析
│   │   ├── DyParser.vue   # 抖音解析
│   │   ├── NeteaseParser.vue  # 网易云解析
│   │   └── PipixiaParser.vue  # 皮皮虾解析
│   ├── styles/            # 样式文件
│   │   ├── main.css       # 主样式
│   │   ├── variables.css  # CSS变量
│   │   └── common.css     # 通用样式
│   ├── utils/             # 工具函数
│   │   ├── api.ts         # API封装
│   │   ├── download.ts    # 下载功能
│   │   ├── xhsApi.ts      # 小红书API
│   │   ├── douyinApi.ts   # 抖音API
│   │   ├── neteaseApi.ts  # 网易云API
│   │   └── pipixiaApi.ts  # 皮皮虾API
│   ├── types/             # TypeScript类型定义
│   │   ├── xhs.d.ts       # 小红书类型
│   │   ├── douyin.d.ts    # 抖音类型
│   │   ├── netease.d.ts   # 网易云类型
│   │   └── pipixia.d.ts   # 皮皮虾类型
│   ├── router/            # 路由配置
│   │   └── index.js       # 路由定义
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── package.json           # 项目配置
├── vite.config.js         # Vite配置
├── netlify.toml          # Netlify部署配置
├── jsconfig.json         # JavaScript配置
├── index.html            # HTML模板
└── README.md             # 项目文档
```

## 🚀 快速开始

### 环境要求

-   Node.js >= 16.0.0
-   npm >= 7.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问地址：http://localhost:5173

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📱 支持平台

| 平台           | 支持内容   | 状态        |
| -------------- | ---------- | ----------- |
| **小红书**     | 图片、视频 | ✅ 完整支持 |
| **抖音**       | 视频       | ✅ 完整支持 |
| **网易云音乐** | 音频、歌词 | ✅ 完整支持 |
| **皮皮虾**     | 视频       | ✅ 完整支持 |

## 🎯 使用方法

1. **复制分享链接**：从支持的 APP 中复制内容分享链接
2. **粘贴解析**：在对应平台的输入框中粘贴链接
3. **获取内容**：点击解析按钮获取无水印内容
4. **下载保存**：一键下载所有媒体文件到本地

## 🔧 开发指南

### 添加新平台支持

1. 在 `src/components/` 创建新的解析组件
2. 在 `src/utils/` 添加对应的 API 处理文件
3. 在 `src/types/` 定义类型声明
4. 更新路由配置和标签页组件

### 样式定制

-   全局样式变量在 `src/styles/variables.css`
-   主题色可通过 CSS 变量快速修改
-   响应式断点已预设，支持移动端优先

## 🌐 在线体验

项目已部署至 Netlify，可在线体验：
[访问在线演示](https://xhs-parser.netlify.app/)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！
