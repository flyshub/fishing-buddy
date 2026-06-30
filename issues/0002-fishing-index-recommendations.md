---
number: 0002
title: "查看钓鱼指数推荐"
status: ready-for-agent
created: 2026-06-05
updated: 2026-06-05
---

# 查看钓鱼指数推荐

## What to build

用户打开 APP 首页 → 看到未来 7 天钓鱼指数卡片 → 点击某天展开 8 因素评分详情。这是 Fishing Buddy 的主入口和核心卖点。

## 用户故事

- As a fisherman, I want to open the app and immediately see a 7-day fishing index forecast for my location, so that I can decide which days to go out. (US 1)
- As a fisherman, I want the fishing index to be scored out of 100 based on 8 factors (pressure, wind, temperature, weather, moon phase, solar term, day-night delta, dissolved oxygen), so that I can understand why a day is recommended or not. (US 15)
- As a fisherman, I want to see the individual score contribution of each of the 8 factors, so that I can understand what's driving the recommendation. (US 16)
- As a fisherman, I want to see future 7-day forecasts, not just today, so that I can plan multiple trips ahead. (US 17)
- As a fisherman, I want the app to be fast to start with no login or setup, so that I can immediately check the fishing index when I'm about to leave. (US 33)

## Acceptance criteria

- [ ] 推荐页为 APP 首页（main.dart 默认路由指向推荐页）
- [ ] 首页展示未来 7 天钓鱼指数卡片列表
- [ ] 每张卡片显示：日期、总评分（0-100）、推荐等级
- [ ] 推荐等级映射正确：≥ 80 强烈推荐 / 60-79 推荐 / 40-59 一般 / < 40 不建议
- [ ] 卡片可展开，展示 8 个因素的各自分数（0-20）
- [ ] FishingIndexCalculator 是纯 Dart 逻辑，不依赖任何外部依赖
- [ ] 8 因素评分逻辑：
  - 气压：1005-1020 hPa 满分，范围外线性递减
  - 风力：1-5 m/s 满分，0 m/s 和 > 10 m/s 为 0 分，中间线性
  - 温度：15-25°C 满分，< 5°C 或 > 35°C 为 0 分，中间线性
  - 天气：分类打分（阴天 20，晴 15，小雨 12，大雨/雪 5，雷雨 3）
  - 月相：新月/满月前后 3 天满分，上下弦日最低
  - 节气：春分-夏至、秋分-冬至为最佳区间满分
  - 昼夜温差：≤ 10°C 满分，> 20°C 为 0 分，中间线性递减
  - 溶氧量：降雨 20 分，无降雨 10 分
- [ ] 总分 = 8 因素之和（最大 100），精确到小数点后 2 位
- [ ] WeatherClient 接口定义，可通过 Mock 测试
- [ ] FishingIndexCalculator 单元测试 100% 覆盖所有 8 因素的边界条件
- [ ] WeatherClient 测试覆盖成功解析、超时、无效响应三种场景
- [ ] 天气 API 不可用时显示降级状态（不崩溃，显示"数据暂不可用"）
- [ ] `flutter analyze` 无错误
- [ ] 数据层单元测试通过（所有边界条件验证）

## Blocked by

None - can start immediately

## Notes

- 此切片独立于数据层（Slice 1），不需要已有 Trip 数据
- 天气 API 使用 和风天气，返回 7 天预报数据
- 月相和节气在本地计算（使用 `lunar` 包或自定义实现）
- 溶氧量用降雨作为代理：有未来 24h 降雨预报则 20 分，否则 10 分
- 推荐页 UI 不要求像素完美，但要有良好的可读性和视觉层次
- 推荐页的数据源是 WeatherClient，不是本地数据库
