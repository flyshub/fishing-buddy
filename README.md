# 渔游记（Fishing Buddy）

微信小程序 — 钓鱼指数助手

## 功能

- **钓鱼指数** — 8 因子评分（气压、风力、温度、天气、月相、节气、昼夜温差、溶氧量），每日 0-100 分
- **7 天预报** — 天气数据 + 钓鱼指数，提前规划行程
- **记录行程** — 钓点、鱼种、饵料、重量、GPS 定位
- **历史管理** — 行程列表、详情查看、空军标记
- **数据分析** — 出钓频率、鱼种分布、饵料效率、渔获趋势
- **社交分享** — 转发给微信好友，自定义分享卡片
- **单位切换** — 斤 / kg

## 技术栈

- 微信小程序原生开发（WXML + WXSS + JS）
- 微信云开发（CloudBase）— 云数据库 + 云函数
- OpenWeatherMap API（天气 + 气压）
- 腾讯地图 API（反向地理编码）
- Jest（单元测试）

## 快速开始

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入 `fishing-buddy-miniprogram/` 目录
3. AppID 先用测试号
4. 开通云开发环境

### 运行测试

```bash
cd fishing-buddy-miniprogram
npm install
npm test
```

## 云函数部署

| 云函数 | 用途 | 环境变量 |
|--------|------|---------|
| `weather-proxy` | OpenWeatherMap 天气代理 | `OPENWEATHERMAP_API_KEY` |
| `reverse-geocode` | 腾讯地图反向编码 | `TENCENT_MAP_KEY` |

## 目录结构

```
fishing-buddy-miniprogram/
├── miniprogram/
│   ├── pages/        (home, record, history, detail, analytics, settings)
│   ├── utils/        (fishing-index, haversine, species-data, bait-data, date-utils)
│   └── images/
├── cloudfunctions/   (weather-proxy, reverse-geocode)
└── test/             (161 项测试)
```

## License

MIT
