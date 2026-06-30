---
number: 0019
title: "单位切换 + 设置（B 阶段）"
status: ready-for-agent
created: 2026-06-29
updated: 2026-06-29
---

## Parent

#0010 微信小程序迁移

## What to build

实现重量单位切换（斤/kg）和设置页面。单位设置持久化到云数据库，所有展示重量的位置（历史列表、详情页、Analytics）统一使用用户选择的单位。

## Acceptance criteria

- [ ] 设置页面提供重量单位切换（斤 / kg），默认斤
- [ ] 单位设置存储到云数据库 settings 集合（_openid + key/value）
- [ ] 历史列表页展示重量时根据单位设置转换（内部存储 kg，展示时 ×2 显示斤）
- [ ] 行程详情页展示重量时根据单位设置转换
- [ ] Analytics 图表中的重量数据根据单位设置转换
- [ ] 切换单位后所有页面实时更新（无需重启小程序）
- [ ] 记录行程时总重量输入始终以 kg 为单位，展示层转换

## Blocked by

- #0015 历史列表 + 行程详情
