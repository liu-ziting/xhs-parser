# xhs-parser

多平台无水印图片/视频/音乐解析工具

## 目录结构说明

-   `public/`：静态资源目录（如重定向规则等）
-   `src/`：主源码目录
    -   `assets/`：静态资源（图片等）
    -   `components/`：Vue 组件
        -   `common/`：通用组件（如 Loading、PostInfo、VideoSection 等）
        -   `Tabs/`：顶部 Tab 导航组件
        -   `DyParser.vue`：抖音解析页面
        -   `NeteaseParser.vue`：网易云音乐解析页面
        -   `XhsParser.vue`：小红书解析页面
    -   `router/`：路由配置
    -   `styles/`：全局与变量样式
    -   `types/`：TypeScript 类型定义
    -   `utils/`：工具函数与 API 封装
    -   `App.vue`：主应用入口
    -   `main.js`：应用启动入口
-   `index.html`：主 HTML 文件
-   `package.json`：依赖与脚本配置
-   `README.md`：项目说明文档

## 功能说明

-   支持小红书、抖音、网易云音乐多平台无水印图片/视频/音乐解析
-   自动识别并提取分享链接，粘贴即用
-   一键下载全部图片、视频或音乐
-   解析结果自动滚动定位
-   响应式美观 UI，渐变主题色
-   组件化开发，结构清晰，易于扩展

## 支持平台

-   小红书（图片/视频）
-   抖音（视频）
-   网易云音乐（音频/歌词）

## 技术栈

-   Vue 3 + `<script setup>`
-   Vite 极速开发
-   TypeScript 类型安全
-   组件化 + 样式变量统一
-   axios 封装 API 请求

## 快速开始

```bash
npm install
npm run dev
```

本地开发默认地址：http://localhost:5173/

## 生产构建

```bash
npm run build
```

## 贡献与反馈

如有建议或问题，欢迎提 issue 或 PR。
