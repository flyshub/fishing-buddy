# Issue #0009: 引入 Repository 层统一数据模型

**状态:** `needs-triage`  
**优先级:** 中  
**关联:** 0003 (记录空军), 0004-0007 (分析和筛选)

---

## 问题描述

当前 `AppDatabase` 同时承担了两个职责：
1. 简单的 CRUD（insertTrip, insertWeatherData 等）
2. 复杂分析聚合查询（getFrequencyPerMonth, getBestSpots 等）

这导致两个问题：

### 1. 模型不统一

`lib/data/models.dart` 定义了领域模型（`Trip` 包含 `isNoCatch`、`totalCount` 等派生属性），但 `AppDatabase.getAllTripsOrdered()` 返回的是 drift 生成的类型 `(drift.Trip, List<drift.TripSpecy>, WeatherDataData?)`，而不是 `models.dart` 中的 `Trip`。

未来 `record/`、`analytics/`、`history/` 等模块会直接操作 drift 类型，导致两套模型并行的风险。

### 2. 分析查询结果不封装

`getFrequencyPerMonth()` 返回 `List<(String, int)>`，`getBestSpots()` 返回 `List<(String, spotName, int, double avgCount)>`，`getCatchTrend()` 返回 `List<(DateTime, int, double)>`——这些都是裸元组，没有命名、没有类型安全。图表代码会散落 `row.readString()` 调用。

---

## 目标

在 `AppDatabase` 和未来 feature 模块之间引入 **Repository 层**，做两件事：

1. **统一模型** — 让 `AppDatabase` 返回的数据转换为 `lib/data/models.dart` 中定义的领域模型
2. **封装分析查询** — 把分析结果转换为稳定的返回值类型

---

## 验收标准

- [ ] `AppDatabase` 只负责数据持久化，不直接暴露给 UI 层
- [ ] `lib/data/models.dart` 中的 `Trip`、`Spot` 等是唯一的领域模型
- [ ] `getAllTripsOrdered()` 返回 `List<Trip>`（包含 `isNoCatch`、`totalCount` 等派生属性）
- [ ] 分析查询结果使用命名类而非裸元组
- [ ] 所有现有测试仍然通过（68/68）
- [ ] 新增 Repository 层测试

---

## 实现计划

### Step 1: 扩展 `Trip` 模型

当前 `lib/data/models.dart` 中的 `Trip` 已有 `species` 字段，但缺少从数据库行构建的工厂方法：

```dart
class Trip {
  // ... existing fields
  
  /// 从 drift 类型构建领域模型。
  factory Trip.fromDb({
    required drift.Trip row,
    required List<drift.TripSpecy> speciesRows,
    drift.WeatherDataData? weatherRow,
  }) {
    return Trip(
      id: row.id,
      startTime: row.startTime,
      endTime: row.endTime,
      spotId: row.spotId,
      positionName: row.positionName,
      bait: row.bait,
      gearType: row.gearType,
      maxLengthCm: row.maxLengthCm,
      totalWeightKg: row.totalWeightKg,
      notes: row.notes,
      species: speciesRows.map((s) => TripSpecies(
        speciesName: s.speciesName,
        count: s.count,
      )).toList(),
      weather: weatherRow != null ? WeatherData(
        airTemp: weatherRow.airTemp,
        pressureHpa: weatherRow.pressureHpa,
        windSpeedMps: weatherRow.windSpeedMps,
        weatherCondition: weatherRow.weatherCondition,
      ) : null,
    );
  }
}
```

### Step 2: 创建 `trip_repository.dart`

```dart
// lib/data/trip_repository.dart

class TripRepository {
  final AppDatabase db;

  TripRepository(this.db);

  Future<Trip> insertTrip(...) async {
    final tripId = await db.insertTrip(...);
    // ... fetch the inserted trip with species + weather
    return Trip.fromDb(...);
  }

  Future<List<Trip>> getAllTripsOrdered() async {
    final dbRows = await db.getAllTripsOrdered();
    return dbRows
        .map((r) => Trip.fromDb(
          row: r.$1,
          speciesRows: r.$2,
          weatherRow: r.$3,
        ))
        .toList();
  }

  // 分析查询封装
  Future<List<FishingFrequency>> getFrequencyPerMonth({
    required int lastMonths,
  }) async {
    final rows = await db.getFrequencyPerMonth(lastMonths: lastMonths);
    return rows.map((r) => FishingFrequency(month: r.$1, count: r.$2)).toList();
  }
  // ...
}
```

### Step 3: 创建分析结果模型

```dart
// lib/data/analytics_models.dart

class FishingFrequency {
  final String month;    // "2026-06"
  final int count;
  const FishingFrequency({required this.month, required this.count});
}

class BestSpot {
  final String spotName;
  final int tripCount;
  final double avgCount;
  const BestSpot({
    required this.spotName,
    required this.tripCount,
    required this.avgCount,
  });
}

// ... 其他分析结果类型
```

### Step 4: 更新测试

- `app_database_test.dart` — 保持不变（验证数据库层）
- `analytics_test.dart` — 保持不变（验证数据库层）
- 新增 `trip_repository_test.dart` — 验证 Repository 层转换逻辑

---

## 非目标

- 不修改 `AppDatabase` 中的 SQL 查询逻辑
- 不修改 `lib/data/models.dart` 中的现有字段
- 不创建 Widget 测试
