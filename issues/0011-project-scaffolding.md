---
number: 0011
title: "项目脚手架"
status: ready-for-agent
created: 2026-06-29
updated: 2026-06-29
---

## Parent

#0010 微信小程序迁移

## What to build

创建微信小程序项目的完整脚手架，包括目录结构、全局配置、云开发环境初始化、TabBar 导航框架。完成后项目能在微信开发者工具中编译运行，3 个 Tab 页面可切换。

## Acceptance criteria

- [ ] 项目目录结构符合迁移计划（miniprogram/pages、miniprogram/components、miniprogram/utils、cloudfunctions）
- [ ] app.json 配置 3 TabBar（首页、记录、历史），页面路由正确
- [ ] app.wxss 定义全局样式变量（主题色、间距、字体）
- [ ] 云开发环境初始化完成（app.js 中调用 wx.cloud.init）
- [ ] 4 个空页面可正常跳转（home、record、history、detail）
- [ ] project.config.json 配置正确，开发者工具可编译运行
- [ ] .gitignore 排除 node_modules、miniprogram_npm、云函数依赖

## Blocked by

None - can start immediately
