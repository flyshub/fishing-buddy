---
number: 0012
title: "天气代理 + 钓鱼指数算法"
status: ready-for-agent
created: 2026-06-29
updated: 2026-06-29
---

## Parent

#0010 微信小程序迁移

## What to build

实现两个端到端的计算路径：(1) 云函数 weather-proxy 调用 OpenWeatherMap API 返回 7 天预报数据；(2) 前端 utils/fishing-index.js 实现 8 因子钓鱼指数算法。两个模块集成后，输入经纬度即可获得每日钓鱼指数评分。

## Acceptance criteria

- [ ] 云函数 weather-proxy 部署成功，输入 lat/lon 返回 7 天天气预报
- [ ] 云函数正确调用 OpenWeatherMap `/data/2.5/forecast`，API Key 从环境变量读取
- [ ] 返回数据映射为 DayWeatherForecast 结构（date、airTemp、minTemp、maxTemp、pressureHpa、windSpeedMps、weatherCondition、hasRainForecast）
- [ ] 钓鱼指数算法 8 因子评分逻辑正确移植（气压 1005-1020、风力 1-5、温度 15-25、天气分类、月相、节气、昼夜温差、溶氧量）
- [ ] 每因子 0-20 分，总分 0-100，推荐等级映射正确（>=80 强烈建议、>=60 建议、>=40 可以尝试、<40 不建议）
- [ ] 单元测试覆盖所有 8 因子边界条件
- [ ] 云函数测试用 mock HTTP，验证成功/失败/超时场景

## Blocked by

- #0011 项目脚手架
