---
number: 0004
title: "分析：出钓频率 + 中鱼率"
status: ready-for-agent
created: 2026-06-05
updated: 2026-06-05
---

# 分析：出钓频率 + 中鱼率

## What to build

分析页顶部展示两个关键指标：出钓频率（近 12 月柱状图）+ 中鱼率百分比。这是分析页最小但有价值的部分，验证数据查询 → 图表渲染的完整链路。

## 用户故事

- As a fisherman, I want to see my 中鱼率 (catch rate) as a percentage, so that I can track my success rate over time. (US 20)
- As a fisherman, I want a monthly bar chart showing how many trips I've made each month, so that I can see my fishing frequency trends. (US 21)

## Acceptance criteria

- [ ] 分析页顶部展示中鱼率百分比（格式如"67.3%"，精确到小数点后 1 位）
- [ ] 中鱼率计算正确：`非空军 Trip 数 / 总 Trip 数 × 100`
- [ ] 数据为空时中鱼率显示 0% 或"暂无数据"
- [ ] 近 12 个月出钓频率柱状图正确渲染
- [ ] 柱状图 X 轴为月份（YYYY-MM 格式），Y 轴为出钓次数
- [ ] 月份排序从左到右递增
- [ ] 空月的柱子高度为 0（不省略）
- [ ] 柱状图有清晰标签（X 轴月份、Y 轴"出钓次数"）
- [ ] 使用 `fl_chart` 库渲染图表
- [ ] 聚合 SQL 查询正确：`GROUP BY strftime('%Y-%m', start_time) SELECT COUNT(*) FROM trip`
- [ ] 数据层单元测试通过（查询结果验证）
- [ ] `flutter analyze` 无错误

## Blocked by

- 0001-first-trip-end-to-end（需要 Trip 数据存在）

## Notes

- 分析页的初始页面设计为"概览视图"，包含这两个核心指标
- 后续 Slice 5 和 Slice 6 会添加更多图表到同一页面
- 当前版本分析页不需要筛选器，数据来自所有 Trip
- 图表库使用 `fl_chart`（Flutter 最流行的图表库）
- 12 个月是硬编码的固定范围，未来可改为可配置
