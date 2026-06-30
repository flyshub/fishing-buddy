# Fishing Buddy — Domain Glossary

This file is the canonical vocabulary for the Fishing Buddy (渔游记) domain.
All agent output, code naming, and issue descriptions must use these terms.
If a concept is not listed here, it is not yet in scope.

---

## Core Entities

### Trip
A single fishing outing — from departure to return.
Each trip has one timestamp range (`start_time`, `end_time`), one 钓点 (spot),
one 钓位 (position), and a list of species caught (or zero species for 空军).

Synonyms: 出钓, 钓鱼记录, 钓一次

### Spot (钓点)
A named fishing location (e.g. "青鱼湖", "黄浦江外滩段").
Spots are deduplicated by GPS proximity (within 100 m the same spot is assumed).
Reverse geocoding suggests a name on the first visit.

### Position (钓位)
A specific fishing spot within a 钓点.
Example: within the "青鱼湖" 钓点, there may be "东岸浅滩", "北堤深水区", etc.
Each position has its own catch history and analytics.

### Species (鱼种)
A fish species the user catches.
Maintained by a searchable in-app database (80–100 common CN freshwater + marine species).
Custom species added by the user are appended to the database for future use.

### Bait (饵料)
The type of bait used during a trip.
Stored as a dropdown selection from a curated bait database, with custom add support.

### Gear Type (钓具类型)
The category of fishing rod/gear used.
Values: 手竿, 海竿, 路亚, 矶竿, and user-defined.

---

## Trip Attributes

| Term | Definition | Source |
|---|---|---|
| `start_time` | When the trip began | Auto (GPS session start) |
| `end_time` | When the trip ended | Manual confirm or GPS idle detection (15 min) |
| `spot` | Fishing location name | Auto (GPS + reverse geocode) |
| `position` | Sub-location within a 钓点 | Manual |
| `species_list` | List of species caught, each with a count | Manual (from fish database) |
| `max_length_cm` | Length of the largest fish caught (cm) | Manual, optional |
| `total_weight_kg` | Total weight of all fish caught (kg or 斤) | Manual, optional |
| `bait` | Bait type used | Manual |
| `gear_type` | Fishing gear category | Manual |
| `air_temp` | Air temperature at trip time | Auto (和风天气 API) |
| `pressure_hpa` | Atmospheric pressure in hectopascals | Auto (和风天气 API) |
| `wind_speed_m_s` | Wind speed in meters per second | Auto (和风天气 API) |
| `weather_condition` | Weather description (晴/阴/雨/雪/…) | Auto (和风天气 API) |
| `notes` | Free-form user notes | Manual |

---

## Analytics Metrics

### 空军 (No-catch trip)
A trip where no species were recorded at all.
Trips without species are flagged as 空军 automatically when the user ends the session.

### 中鱼率 (Catch rate)
Percentage of trips where at least one fish was caught.
`中鱼率 = (trips_with_catch / total_trips) × 100`

### 钓鱼指数 (Fishing index)
A 0–100 score indicating how suitable a day is for fishing.
Computed from 8 factors, each scoring 0–20:

| Factor | Optimal range | Notes |
|---|---|---|
| 气压 (pressure) | 1005–1020 hPa | Low pressure suppresses biting |
| 风力 (wind speed) | 1–5 m/s (~2–3 级) | Light wind oxygenates; strong wind hinders casting |
| 温度 (temperature) | 15–25 °C | Most species are most active in this range |
| 天气 (weather) | 阴天 > 晴 > 雨 | Cloudy fish are less wary |
| 月相 (moon phase) | New moon / full moon | Traditional fishing wisdom |
| 节气 (solar term) | Spring / Autumn | "春钓滩、秋钓金" |
| 昼夜温差 (day-night delta) | < 10 °C | Stable water temperature |
| 溶氧量 (dissolved oxygen) | High | Post-rain and inflow zones have higher DO |

### 出钓频率 (Fishing frequency)
Number of trips per calendar month, shown as a bar chart.

### 最佳钓点 (Best spot)
The 钓点 with the highest average catch (by count or weight).

### 最佳时段 (Best time slot)
The time-of-day segment (凌晨/早晨/上午/下午/傍晚) with the best average catch.

### 鱼种分布 (Species distribution)
Pie or bar chart showing relative frequency of each species across all trips.

### 渔获趋势 (Catch trend)
Line chart of trip catch count/weight over time.

### 饵料效率 (Bait efficiency)
Comparison of average catch per trip, grouped by bait type.

### 天气关联 (Weather correlation)
Grouped bar chart comparing catch performance under different weather conditions.

---

## Unit System

- Default weight unit: **斤 (jin)** (1 斤 = 500 g)
- Switchable to **公斤 (kg)** in Settings
- Length: always **厘米 (cm)**

---

## Release Policy

No catch-and-release tracking. All catches are treated as removed from the water.

---

## Migration Decisions (Flutter → 微信小程序)

### Target Platform
微信小程序（原生 WXML/WXSS/JS），目标用户为中国钓鱼爱好者，通过微信社交传播获客，无需安装。

### Data Storage
微信云开发（CloudBase），MongoDB 风格文档数据库。嵌套文档结构：Trip 文档内嵌 species 数组和 weather 对象，Spot 信息冗余嵌入 Trip 避免二次查询。

### Feature Scope
渐进式：MVP（钓鱼指数 + 记录行程 + 历史列表）→ B 阶段（Analytics 图表 + 设置）。

### Weather API
OpenWeatherMap（免费 1000 次/天，提供气压数据）。通过云函数代理调用，API Key 存云函数环境变量。

### Fish Species / Bait Database
MVP 阶段前端硬编码 80-100 种鱼列表，零网络开销。后续版本迁移至云数据库支持用户自定义。

### GPS / Location
完整版：wx.getLocation 获取经纬度 + 腾讯地图反向地理编码自动命名钓点 + Haversine 100m 去重匹配历史钓点。

### Charts
wx-charts（纯 Canvas，~50KB），B 阶段用于出钓频率、鱼种分布、渔获趋势等图表。

### Navigation
3 Tab 结构：首页（合并钓鱼指数 + 7天预报 + 最近行程）、记录、历史。行程详情/设置做子页面跳转。

### Social Sharing
onShareAppMessage 基础转发 + 自定义分享卡片（标题 + 缩略图）。

### Testing
完整测试覆盖：算法单测 + 云函数测试 + 页面逻辑测试。

### Weather Data Source Change
原 Flutter 版本使用和风天气（`and_feng_weather_client.dart`），迁移到 OpenWeatherMap。CONTEXT.md 中 `Trip Attributes` 的天气来源标记需更新。
