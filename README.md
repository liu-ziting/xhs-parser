# xhs-parser

多平台无水印图片/视频解析下载工具

支持小红书、抖音、皮皮虾三大平台，一键获取高清无水印图片和视频，界面美观，体验流畅。

## 功能特性

-   支持小红书、抖音、皮皮虾无水印图片/视频解析与下载
-   自动识别分享链接，粘贴即用
-   一键下载全部图片或视频
-   解析结果自动滚动定位
-   响应式美观 UI，支持渐变主题色
-   代码结构规范，易于扩展

## 技术栈

-   Vue 3 + `<script setup>` 语法糖
-   Vite 极速开发
-   TypeScript 类型安全
-   组件化开发，样式变量统一
-   axios 封装 API 请求

## 目录结构

```
src/
  components/
    XhsParser/    # 小红书解析相关组件
    DyParser/     # 抖音解析相关组件
    PipixiaParser/# 皮皮虾解析相关组件
    common/       # 通用组件（Tabs、Loading等）
  utils/          # API 封装、下载工具
  types/          # 类型声明
  styles/         # 全局样式与变量
  router/         # 路由配置
  App.vue
  main.ts
```

## 快速开始

```bash
npm install
npm run dev
```

本地开发默认 http://localhost:5173/，也可通过本机 IP 访问。

## 生产构建

```bash
npm run build
```

## 贡献与反馈

如有建议或问题，欢迎提 issue 或 PR。
