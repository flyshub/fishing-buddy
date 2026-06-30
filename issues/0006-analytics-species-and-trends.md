---
number: 0006
title: "分析：鱼种分布 + 渔获趋势 + 饵料效率 + 天气关联"
status: ready-for-agent
created: 2026-06-05
updated: 2026-06-05
---

# 分析：鱼种分布 + 渔获趋势 + 饵料效率 + 天气关联

## What to build

分析页剩余四个图表：鱼种分布饼图、渔获趋势折线图、饵料效率对比柱状图、天气关联分组柱状图。验证 Species、Bait、WeatherData 的关联查询能力。

## 用户故事

- As a fisherman, I want a pie or bar chart showing the distribution of species I've caught, so that I can see what I'm most successful with. (US 24)
- As a fisherman, I want a line chart showing my catch count/weight trend over time, so that I can see if I'm improving. (US 25)
- As a fisherman, I want to compare the average catch by bait type, so that I can know which bait is most effective. (US 26)
- As a fisherman, I want to compare catch performance across different weather conditions (晴天/阴天/雨天), so that I can understand weather impact on my personal results. (US 27)

## Acceptance criteria

- [ ] 鱼种分布饼图正确渲染，每个扇区显示鱼种名称和百分比
- [ ] 饼图按总数量降序排列
- [ ] 数量最多的 3 种鱼种直接标注名称在扇区上，其余合并为"其他"
- [ ] 渔获趋势折线图正确渲染：X 轴为日期（从早到晚），Y 轴为渔获量
- [ ] 折线图同时显示两条线：尾数（蓝色）和重量（橙色）
- [ ] 重量单位使用设置中的当前单位（斤或公斤，Slice 8 完成后可切换）
- [ ] 饵料效率对比柱状图：X 轴为饵料类型，Y 轴为平均渔获量
- [ ] 饵料效率仅考虑有饵料记录的 Trip
- [ ] 天气关联分组柱状图：分组基于 weather_condition（晴天/阴天/雨天/雪天等）
- [ ] 每组柱状图显示两个柱：平均尾数 + 平均重量
- [ ] 天气数据通过 WeatherData 表关联查询（非空 weather_condition 过滤）
- [ ] 聚合 SQL 查询正确：
  - 鱼种分布：`GROUP BY species_name SELECT SUM(count) FROM tripspecies ORDER BY sum DESC`
  - 渔获趋势：`SELECT start_time, total_count, total_weight_kg FROM trip ORDER BY start_time`
  - 饵料效率：`GROUP BY bait SELECT AVG(count) FROM trip JOIN tripspecies ON trip_id`
  - 天气关联：`GROUP BY weather_condition SELECT AVG(count), AVG(weight) FROM trip JOIN weatherdata ON trip_id`
- [ ] 数据层单元测试通过（所有 4 个聚合查询验证）
- [ ] 各图表在数据不足时有友好的空状态展示
- [ ] `flutter analyze` 无错误

## Blocked by

- 0001-first-trip-end-to-end（需要 Trip + Species + Bait + WeatherData 数据）

## Notes

- 这是分析页的最后一个子切片，完成此 Slice 后分析页 7 个模块全部就绪
- 重量单位（斤/公斤）切换功能由 Slice 8 实现，当前版本使用默认斤
- 饼图"其他"类别的阈值：合并所有占比 < 5% 的鱼种为一个扇区
- 折线图只显示有重量数据的点（部分 Trip 可能未记录重量）
- 天气关联需要 WeatherData 表有非空 weather_condition 记录（Slice 1 会确保这一点）
