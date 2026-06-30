---
number: 0001
title: "完成第一次出钓 — 端到端最小闭环"
status: ready-for-agent
created: 2026-06-05
updated: 2026-06-05
---

# 完成第一次出钓 — 端到端最小闭环

## What to build

用户从打开 APP → GPS 定位 → 地图选点 → 选择鱼种（鲫鱼 5 条）→ 选饵料 → 选钓具 → 结束出钓 → 记录出现在历史列表。这是整个 Fishing Buddy 最核心的行为路径，必须能跑通。

## 用户故事

- As a fisherman, I want the app to automatically detect my current GPS location when I start recording a trip, so that I don't have to manually enter coordinates. (US 2)
- As a fisherman, I want the app to auto-fetch weather data (air temperature, pressure, wind speed, weather condition) for my location from a weather API, so that each trip record includes accurate meteorological data without manual entry. (US 3)
- As a fisherman, I want to select fish species from a searchable in-app database (80-100 common species), so that I can quickly record my catch without typing. (US 8)
- As a fisherman, I want to record multiple species in a single trip with individual counts for each, so that I can summarize my catch as "5 鲫鱼, 2 鲤鱼" in one action. (US 10)
- As a fisherman, I want to optionally record the largest fish length (cm) and total catch weight, so that I can track my best catches over time. (US 11)
- As a fisherman, I want to select my bait type from a dropdown with custom add support, so that I can track which bait works best for me. (US 12)
- As a fisherman, I want to select my gear type (手竿/海竿/路亚/矶竿), so that I can later analyze which gear produces the best results. (US 13)
- As a fisherman, I want to manually confirm the end time of my trip, so that trip duration is accurate without extra effort. (US 14)
- As a fisherman, I want to see that trips where I caught nothing are recorded as 空军, so that my statistics accurately reflect my actual fishing experience. (US 19)

## Acceptance criteria

- [ ] Flutter 项目创建并通过编译（`flutter create`，Flutter 3.27+ / Dart 3.6+）
- [ ] 目录结构为 feature-first：`lib/features/{recommend, record, history, analytics, settings}/` + `lib/core/` + `lib/data/`
- [ ] 6 张 SQLite 表通过 drift 定义并代码生成通过：Trip、Spot、TripSpecies、TripSpeciesRecord、WeatherData、Settings
- [ ] 所有 DAO 的 CRUD 方法定义并通过 in-memory SQLite 测试
- [ ] 记录页打开时自动请求 GPS 权限并获取当前位置
- [ ] 记录页在地图上显示当前位置标记，用户可拖拽调整钓点
- [ ] GPS 坐标自动获取后调用天气 API 并加载天气数据（WeatherData 表写入）
- [ ] 从 GPS 坐标创建 Spot（含 100m 内已有 Spot 的 Haversine 去重）
- [ ] 鱼种选择支持从内置数据库（80-100 种）搜索和选择
- [ ] 一次 Trip 可添加多条鱼种，每条指定数量（TripSpecies 关联表）
- [ ] 支持选择饵料（下拉）和钓具类型（手竿/海竿/路亚/矶竿）
- [ ] 可选字段：最大鱼尺寸（cm）、总重量（kg/斤）
- [ ] 点击"结束出钓"按钮后数据完整持久化到数据库
- [ ] 记录出现在历史列表页面（按时间倒序，至少显示第一条）
- [ ] 历史列表每条记录显示：日期、钓点、钓位、鱼种列表、总尾数
- [ ] 所有中文 UI 使用简体中文
- [ ] 重量默认显示为斤（1 斤 = 500g），数据库内部存储为 kg
- [ ] `flutter analyze` 无错误
- [ ] 数据层单元测试通过（DAO CRUD + Haversine + 单位转换）

## Blocked by

None - can start immediately

## Notes

- 这是整个项目的基础，必须先完成。后续所有切片都依赖此切片提供的数据层和记录能力。
- 地图使用 `flutter_map` + OpenStreetMap（免费，无需 API key）
- Reverse geocode 可使用天气 API 供应商（和风天气）提供的地理编码服务，或单独使用
- 推荐页（Slice 2）可以并行开发，不依赖此切片
- 不实现：GPS 自动结束检测（15 分钟 idle）、拖拽后地址反查、自定义鱼种/饵料（后续 Slice 10）
- 当前版本只要求"记录一条完整数据"，不要求完善的错误处理和边界情况
