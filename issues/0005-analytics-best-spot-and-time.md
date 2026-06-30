---
number: 0005
title: "分析：最佳钓点 + 最佳时段"
status: ready-for-agent
created: 2026-06-05
updated: 2026-06-05
---

# 分析：最佳钓点 + 最佳时段

## What to build

分析页展示两个图表：最佳钓点排名列表 + 最佳时段热力图。验证 Spot 关联查询和时间段聚合能力。

## 用户故事

- As a fisherman, I want to know my best 钓点 (spot) ranked by average catch, so that I can know where to go back. (US 22)
- As a fisherman, I want to know the best time-of-day slot (凌晨/早晨/上午/下午/傍晚) for my catches, so that I can optimize my departure times. (US 23)

## Acceptance criteria

- [ ] 分析页展示最佳钓点排名列表（按平均渔获量降序）
- [ ] 每个钓点显示：名称、总出钓次数、平均尾数、总尾数
- [ ] 有至少一条 Trip 数据时才展示（空状态处理）
- [ ] 最佳时段热力图/柱状图正确渲染
- [ ] 时段分为 5 个槽位：凌晨 (< 5:00)、早晨 (5:00-8:00)、上午 (8:00-12:00)、下午 (12:00-17:00)、傍晚 (17:00-21:00)
- [ ] 每个时段显示：平均渔获量、出钓次数
- [ ] 时段数据从 Trip.start_time 提取（取 start_time 所在槽位）
- [ ] 聚合 SQL 查询正确：
  - 最佳钓点：`GROUP BY spot_id SELECT AVG(total_count) FROM trip JOIN tripspecies ON trip_id ORDER BY avg DESC`
  - 最佳时段：从 start_time 提取槽位，`GROUP BY time_slot SELECT AVG(count) FROM trip ORDER BY avg DESC`
- [ ] 数据层单元测试通过（聚合查询结果验证）
- [ ] `flutter analyze` 无错误

## Blocked by

- 0001-first-trip-end-to-end（需要 Trip + Spot + TripSpecies 数据）

## Notes

- 最佳钓点按"平均渔获量（尾数）"排序，不是按总渔获量（避免去得最多=最好的偏差）
- 时段槽位的边界时间（5:00, 8:00, 12:00, 17:00）为左闭右开区间
- 如果用户只有 1-2 条 Trip 数据，图表可能不直观，但仍应展示
- 此 Slice 和 Slice 6（鱼种分布 + 趋势 + 饵料 + 天气）将共同完成完整的分析页
