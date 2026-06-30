# ADR 0001: 从 Flutter 迁移到微信小程序

**Status:** accepted  
**Date:** 2026-06-29

## Context

Fishing Buddy（渔游记）当前使用 Flutter 3.27 跨平台框架，目标用户为中国国内钓鱼爱好者。核心矛盾：Flutter App 需要下载安装，传播路径长；微信小程序无需安装，可直接转发给好友/群聊，天然适合社交传播。

## Decision

将技术栈从 Flutter 迁移到原生微信小程序（WXML/WXSS/JS），使用微信云开发作为后端。

### 关键取舍

| 维度 | Flutter 保留 | 微信小程序获得 |
|------|-------------|--------------|
| 离线能力 | SQLite 本地存储，无网络可用 | ❌ 依赖网络 |
| 跨平台 | iOS + Android 一套代码 | ❌ 仅微信内 |
| 持续 GPS | 可做后台定位、空闲检测 | ❌ 仅前台单次获取 |
| 社交传播 | 需下载安装 | ✅ 转发即达 |
| 用户获取 | 应用商店审核 | ✅ 搜索/扫码/分享 |
| 后端运维 | 自建或第三方 | ✅ 云开发免运维 |
| 用户体系 | 需自己实现 | ✅ 微信 openid 自动绑定 |

### 技术选型

- **存储**: 微信云开发（CloudBase），嵌套文档结构
- **天气 API**: OpenWeatherMap（免费，有气压数据），云函数代理
- **图表**: wx-charts（纯 Canvas，~50KB）
- **GPS**: wx.getLocation + 腾讯地图反向编码 + Haversine 去重
- **分享**: onShareAppMessage + 自定义卡片
- **测试**: 完整覆盖（算法 + 云函数 + 页面）

## Consequences

- 失离线能力和跨平台能力，换取微信生态传播优势
- 云数据库嵌套文档设计取代关系型 SQLite schema
- 和风天气 API 替换为 OpenWeatherMap
- 鱼种/饵料数据库 MVP 阶段硬编码，后续迁移云数据库
- 导航从 4 Tab 简化为 3 Tab（首页合并钓鱼指数）
