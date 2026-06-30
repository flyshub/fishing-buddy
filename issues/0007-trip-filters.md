---
number: 0007
title: "钓鱼记录筛选"
status: ready-for-agent
created: 2026-06-05
updated: 2026-06-05
---

# 钓鱼记录筛选

## What to build

历史页面增加筛选功能：按时间范围、按钓点、按鱼种筛选，支持多条件组合（AND 逻辑）。用户能快速定位到特定的出钓记录。

## 用户故事

- As a fisherman, I want to view all my past trips in a list, filterable by date, spot, or species, so that I can find specific trips quickly. (US 18)

## Acceptance criteria

- [ ] 历史页面顶部有筛选控件区域（默认折叠，点击展开）
- [ ] 筛选条件 1：按月份/日期范围筛选（起始日期 - 结束日期）
- [ ] 筛选条件 2：按钓点筛选（下拉选择，从已有 Spot 列表）
- [ ] 筛选条件 3：按鱼种筛选（下拉选择，从已有 Species 列表）
- [ ] 多个筛选条件可组合（AND 逻辑）
- [ ] 筛选结果为空时显示友好提示"没有找到符合条件的出钓记录"
- [ ] 有筛选条件时显示"清除筛选"按钮，一键重置所有筛选
- [ ] 筛选结果仍按时间倒序排列
- [ ] 筛选不改变 Trip 摘要的展示格式
- [ ] 筛选查询使用 SQL WHERE + 参数化查询（防止 SQL 注入）
- [ ] 筛选不修改原始数据（纯查询过滤）
- [ ] 数据层单元测试通过（各筛选条件 + 组合条件的 SQL 验证）
- [ ] `flutter analyze` 无错误

## Blocked by

- 0001-first-trip-end-to-end（需要历史列表页和数据层基础能力）

## Notes

- 时间范围筛选使用 Android/iOS 原生日期选择器（`showDatePicker`）
- 钓点/鱼种下拉列表从数据库查询已有值（DISTINCT），避免硬编码
- 组合筛选的 SQL 动态构建（仅添加有值的 WHERE 子句）
- 此 Slice 不涉及分页或虚拟列表优化（用户数据量预期 < 500 条）
- 筛选控件的 UI 不需要过于精美，但需要清晰可操作
