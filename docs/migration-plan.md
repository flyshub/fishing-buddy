# 迁移计划：Flutter → 微信小程序

**基于 11 项决策点的完整迁移方案**

---

## 技术栈总览

```
┌─────────────────────────────────────────────────┐
│              微信小程序前端                        │
│  WXML + WXSS + JS + wx-charts                   │
│  3 Tab: 首页 | 记录 | 历史                        │
├─────────────────────────────────────────────────┤
│              云开发后端                            │
│  云函数: weather-proxy, reverse-geocode          │
│  云数据库: trips, spots (嵌套文档)                │
│  云存储: 分享卡片图片                              │
├─────────────────────────────────────────────────┤
│              第三方服务                            │
│  OpenWeatherMap API (天气+气压)                   │
│  腾讯地图 WebService (反向地理编码)                │
└─────────────────────────────────────────────────┘
```

---

## 目录结构

```
fishing-buddy-miniprogram/
├── miniprogram/
│   ├── app.js                    # 小程序入口
│   ├── app.json                  # 全局配置（TabBar、页面路由）
│   ├── app.wxss                  # 全局样式
│   ├── pages/
│   │   ├── home/                 # 首页（指数 + 预报 + 最近行程）
│   │   │   ├── home.js
│   │   │   ├── home.json
│   │   │   ├── home.wxml
│   │   │   └── home.wxss
│   │   ├── record/               # 记录行程
│   │   │   ├── record.js
│   │   │   ├── record.json
│   │   │   ├── record.wxml
│   │   │   └── record.wxss
│   │   ├── history/              # 历史列表
│   │   │   ├── history.js
│   │   │   ├── history.json
│   │   │   ├── history.wxml
│   │   │   └── history.wxss
│   │   └── detail/               # 行程详情（子页面）
│   │       ├── detail.js
│   │       ├── detail.json
│   │       ├── detail.wxml
│   │       └── detail.wxss
│   ├── components/
│   │   ├── fishing-index/        # 钓鱼指数卡片组件
│   │   ├── forecast-card/        # 天气预报卡片
│   │   ├── trip-card/            # 行程列表项
│   │   ├── species-picker/       # 鱼种选择器
│   │   └── bait-picker/          # 饵料选择器
│   ├── utils/
│   │   ├── fishing-index.js      # 钓鱼指数算法（纯计算）
│   │   ├── haversine.js          # GPS 距离计算
│   │   ├── species-data.js       # 内置鱼种列表
│   │   ├── bait-data.js          # 内置饵料列表
│   │   └── date-utils.js         # 日期工具
│   └── images/                   # 静态资源
├── cloudfunctions/
│   ├── weather-proxy/            # OpenWeatherMap 代理
│   │   ├── index.js
│   │   └── package.json
│   └── reverse-geocode/          # 腾讯地图反向编码
│       ├── index.js
│       └── package.json
├── project.config.json           # 项目配置
└── README.md
```

---

## 分阶段实施

### Phase 1: MVP（核心功能）

#### Step 1.1 — 项目脚手架
- 创建小程序项目结构
- 配置 `app.json`（TabBar 3页、权限声明）
- 初始化云开发环境
- **验证**: 项目能在开发者工具中编译运行

#### Step 1.2 — 钓鱼指数算法移植
- 将 `features/recommend/calculator.dart` 移植为 `utils/fishing-index.js`
- 8 因子评分逻辑 1:1 移植（气压、风力、温度、天气、月相、节气、昼夜温差、溶氧量）
- `DayWeatherForecast` 和 `FishingIndexResult` 模型定义
- **验证**: 单元测试覆盖所有 8 因子的边界条件（气压 1005/1020、风速 1/5 等）

#### Step 1.3 — 云函数：天气代理
- `cloudfunctions/weather-proxy/index.js`
- 调用 OpenWeatherMap `/data/2.5/forecast`（免费 5 天预报，含气压）
- API Key 存云函数环境变量
- 返回 `DayWeatherForecast[]` 结构
- **验证**: 云函数部署后能返回真实天气数据

#### Step 1.4 — 首页
- `pages/home/` 实现
- 组件：`fishing-index`（今日指数大卡片）、`forecast-card`（7天预报列表）、`trip-card`（最近3条行程）
- 调用云函数获取天气 → 计算指数 → 渲染
- **验证**: 首页能显示今日钓鱼指数和7天预报

#### Step 1.5 — 记录行程
- `pages/record/` 实现
- 表单：出发时间、钓点名（手填）、装备类型、鱼种（从内置列表选）、数量、饵料、重量、备注
- 提交写入云数据库 `trips` 集合（嵌套文档）
- GPS 定位：`wx.getLocation` 获取经纬度 → 调用反向编码云函数 → 自动填入钓点名
- **验证**: 提交后数据正确写入云数据库

#### Step 1.6 — 历史列表
- `pages/history/` 实现
- 查询云数据库 `trips` 集合，按 `startTime` 降序
- 空军标记、渔获摘要展示
- 点击跳转行程详情页
- **验证**: 列表正确展示，空军标记正常

#### Step 1.7 — 行程详情
- `pages/detail/` 实现
- 展示完整行程信息：时间、钓点、装备、鱼种列表、天气、备注
- **验证**: 详情页数据完整

### Phase 2: 功能完善（B 阶段）

#### Step 2.1 — 钓点去重
- `utils/haversine.js` 移植
- 记录行程时查询历史钓点，100m 内自动匹配
- 云数据库查询附近钓点

#### Step 2.2 — Analytics 图表
- 集成 wx-charts
- 出钓频率柱状图（按月）
- 鱼种分布饼图
- 渔获趋势折线图
- 中鱼率数字卡片

#### Step 2.3 — 社交分享
- `onShareAppMessage` 自定义分享卡片
- 分享标题：「今天钓鱼指数 XX，强烈建议出行」
- 缩略图：从首页 Canvas 截取

#### Step 2.4 — 设置页面
- 单位切换（斤/kg）
- 鱼种管理（后续迁移云数据库）

### Phase 3: 测试与发布

#### Step 3.1 — 测试
- 钓鱼指数算法单测（Jest）
- 云函数单元测试
- 页面逻辑测试
- 端到端流程测试

#### Step 3.2 — 提审发布
- 小程序代码包体积检查（主包 < 2MB）
- 提交微信审核
- 发布上线

---

## 云数据库 Schema

### `trips` 集合（嵌套文档）

```json
{
  "_id": "auto",
  "_openid": "用户微信openid",
  "startTime": "2026-06-29T08:00:00Z",
  "endTime": "2026-06-29T12:00:00Z",
  "spot": {
    "name": "青鱼湖",
    "latitude": 31.2304,
    "longitude": 121.4737
  },
  "positionName": "东岸浅滩",
  "bait": "蚯蚓",
  "gearType": "手竿",
  "maxLengthCm": 35.5,
  "totalWeightKg": 2.3,
  "notes": "今天气压不错",
  "species": [
    { "name": "鲫鱼", "count": 5 },
    { "name": "鲤鱼", "count": 2 }
  ],
  "weather": {
    "airTemp": 22.5,
    "pressureHpa": 1012.0,
    "windSpeedMps": 3.2,
    "weatherCondition": "多云"
  },
  "createdAt": "2026-06-29T12:05:00Z"
}
```

### 查询索引

- `trips`: `_openid + startTime`（用户历史列表）
- `trips`: `spot.latitude + spot.longitude`（钓点去重）

---

## 验收标准

### MVP 阶段
- [ ] 首页显示今日钓鱼指数（8 因子完整计算）
- [ ] 首页显示 7 天天气预报
- [ ] 可记录行程（时间、钓点、鱼种、数量、饵料等）
- [ ] 记录时自动获取 GPS 定位
- [ ] 历史列表展示所有行程
- [ ] 空军行程正确标记
- [ ] 行程详情页信息完整
- [ ] 数据存储在云数据库，用户间隔离

### B 阶段
- [ ] 钓点 100m 去重匹配
- [ ] 出钓频率柱状图
- [ ] 鱼种分布饼图
- [ ] 渔获趋势折线图
- [ ] 分享卡片自定义标题和缩略图
- [ ] 单位切换（斤/kg）

### 测试
- [ ] 钓鱼指数算法 100% 覆盖率
- [ ] 云函数单元测试通过
- [ ] 主包体积 < 2MB
