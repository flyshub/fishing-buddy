---
number: 0008
title: "数据管理：备份/恢复 + 自定义鱼种/饵料 + 单位切换"
status: ready-for-agent
created: 2026-06-05
updated: 2026-06-05
---

# 数据管理：备份/恢复 + 自定义鱼种/饵料 + 单位切换

## What to build

设置页完整功能：重量单位切换（斤 ↔ 公斤）、自定义鱼种和饵料管理（增删查）、JSON 数据备份/恢复、CSV 导出。这是用户数据安全和个性化的最后一块拼图。

## 用户故事

- As a fisherman, I want to add custom species not in the database, so that I can record rare or exotic catches and reuse them later. (US 9)
- As a fisherman, I want to export my data as a JSON backup file, so that I can restore it on a new phone. (US 28)
- As a fisherman, I want to import a previously exported JSON backup, so that I can recover my data on a new device. (US 29)
- As a fisherman, I want to export my trip data as a CSV file, so that I can analyze it in spreadsheet software. (US 30)
- As a fisherman, I want the app to default to using 斤 for weight (with a setting to switch to kg), so that the numbers feel natural to me. (US 32)

## Acceptance criteria

### 单位切换

- [ ] 设置页有重量单位切换开关（斤 / 公斤）
- [ ] 切换后全局生效（所有展示层的重量值自动转换）
- [ ] 数据库内部始终存储为 kg，展示层转换
- [ ] 单位转换正确：1 kg = 2 斤
- [ ] 单位设置持久化到 Settings 表（key-value 存储）
- [ ] 新建 Trip 后单位切换，历史记录的重量值实时转换

### 自定义鱼种管理

- [ ] 设置页可查看内置鱼种列表（80-100 种）
- [ ] 设置页可查看用户自定义鱼种
- [ ] 用户可添加不在数据库中的自定义鱼种名称
- [ ] 用户可删除自定义鱼种
- [ ] 删除自定义鱼种不影响已有 Trip 记录（已有记录中的鱼种名称保持不变）

### 自定义饵料管理

- [ ] 设置页可查看内置饵料列表
- [ ] 设置页可查看用户自定义饵料
- [ ] 用户可添加自定义饵料名称
- [ ] 用户可删除自定义饵料
- [ ] 删除自定义饵料不影响已有 Trip 记录

### JSON 备份/恢复

- [ ] 设置页有"导出数据"按钮，生成完整 JSON 文件
- [ ] JSON 包含所有表数据（Trip、Spot、TripSpecies、TripSpeciesRecord、WeatherData、Settings）
- [ ] JSON 包含 schema_version 字段（用于未来兼容性）
- [ ] JSON 导出文件可通过系统分享面板分享
- [ ] 设置页有"导入数据"按钮，选择 JSON 文件导入
- [ ] 导入前验证 JSON 结构（必需字段缺失时显示清晰错误信息）
- [ ] 导入前提示用户确认"是否清空现有数据后导入"
- [ ] 用户确认后执行导入，清空所有表后写入导入数据
- [ ] 导入成功后提示"数据恢复成功"并返回主页面
- [ ] 导入失败后保持现有数据不变（原子性保证）

### CSV 导出

- [ ] 设置页有"导出 CSV"按钮，导出所有 Trip 记录
- [ ] CSV 包含列：日期、钓点、钓位、鱼种、数量、重量、天气条件、气压、风力、气温
- [ ] CSV 使用 UTF-8 BOM 编码（确保 Excel 正确显示中文）
- [ ] CSV 导出文件可通过系统分享面板分享

## Blocked by

- 0001-first-trip-end-to-end（需要数据层 Settings 表和完整 Trip 数据）

## Notes

- JSON 导入导出使用 `json_serializable` 进行序列化/反序列化
- CSV 导出使用 Dart 标准库 `dart:io` 的 `IOSink` 手动生成
- JSON 导入的 schema_version 当前固定为 "1.0.0"，未来 schema 变更时递增
- 系统分享使用 `share_plus` 包
- 重量单位切换是一个全局状态管理问题（推荐 Provider 或 riverpod），切换后所有页面重新渲染
- 自定义鱼种/饵料管理是简单的 CRUD 界面，不涉及业务逻辑复杂性
- 此 Slice 是最后一个功能切片，完成后 APP 所有核心功能就绪
