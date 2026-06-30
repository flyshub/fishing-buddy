# PRD: Fishing Buddy — Full Application

**Status:** ready-for-agent  
**Created:** 2026-06-05  
**Scope:** All 5 app pages, data layer, recommendation engine, analytics

---

## Problem Statement

Fishing enthusiasts in China have no lightweight, privacy-focused tool to record their fishing trips, analyze historical catch data, and get weather-informed recommendations for the best fishing days. Existing solutions are either too heavy (full social platforms), lack local-first architecture, or don't integrate the specific weather factors that matter for fishing (barometric pressure, wind, moon phase).

## Solution

A Flutter cross-platform app (iOS + Android) called **Fishing Buddy（渔游记）** that runs entirely on-device. Users record trips with auto-detected GPS and weather data, analyze their fishing patterns over time, and get daily recommendations based on 8 environmental factors.

## User Stories

1. As a fisherman, I want to open the app and immediately see a 7-day fishing index forecast for my location, so that I can decide which days to go out.

2. As a fisherman, I want the app to automatically detect my current GPS location when I start recording a trip, so that I don't have to manually enter coordinates.

3. As a fisherman, I want the app to auto-fetch weather data (air temperature, pressure, wind speed, weather condition) for my location from a weather API, so that each trip record includes accurate meteorological data without manual entry.

4. As a fisherman, I want to select a fishing spot from the map with my finger, so that I can precisely mark where I'm fishing.

5. As a fisherman, I want the app to suggest a spot name via reverse geocoding on my first visit to a location, so that I don't have to type a new name every time.

6. As a fisherman, I want the app to automatically match a previously visited spot when I return to within 100m of a past location, so that my history stays clean.

7. As a fisherman, I want to enter a sub-location name (钓位, e.g., "东岸浅滩") for the current trip, so that I can distinguish different spots within the same body of water.

8. As a fisherman, I want to select fish species from a searchable in-app database (80-100 common species), so that I can quickly record my catch without typing.

9. As a fisherman, I want to add custom species not in the database, so that I can record rare or exotic catches and reuse them later.

10. As a fisherman, I want to record multiple species in a single trip with individual counts for each, so that I can summarize my catch as "5 鲫鱼, 2 鲤鱼" in one action.

11. As a fisherman, I want to optionally record the largest fish length (cm) and total catch weight, so that I can track my best catches over time.

12. As a fisherman, I want to select my bait type from a dropdown with custom add support, so that I can track which bait works best for me.

13. As a fisherman, I want to select my gear type (手竿/海竿/路亚/矶竿), so that I can later analyze which gear produces the best results.

14. As a fisherman, I want to manually confirm the end time of my trip or have it auto-detected after GPS idle for 15 minutes, so that trip duration is accurate without extra effort.

15. As a fisherman, I want the fishing index to be scored out of 100 based on 8 factors (pressure, wind, temperature, weather, moon phase, solar term, day-night delta, dissolved oxygen), so that I can understand why a day is recommended or not.

16. As a fisherman, I want to see the individual score contribution of each of the 8 factors, so that I can understand what's driving the recommendation.

17. As a fisherman, I want to see future 7-day forecasts, not just today, so that I can plan multiple trips ahead.

18. As a fisherman, I want to view all my past trips in a list, filterable by date, spot, or species, so that I can find specific trips quickly.

19. As a fisherman, I want to see that trips where I caught nothing are recorded as 空军, so that my statistics accurately reflect my actual fishing experience.

20. As a fisherman, I want to see my 中鱼率 (catch rate) as a percentage, so that I can track my success rate over time.

21. As a fisherman, I want a monthly bar chart showing how many trips I've made each month, so that I can see my fishing frequency trends.

22. As a fisherman, I want to know my best 钓点 (spot) ranked by average catch, so that I know where to go back.

23. As a fisherman, I want to know the best time-of-day slot (凌晨/早晨/上午/下午/傍晚) for my catches, so that I can optimize my departure times.

24. As a fisherman, I want a pie or bar chart showing the distribution of species I've caught, so that I can see what I'm most successful with.

25. As a fisherman, I want a line chart showing my catch count/weight trend over time, so that I can see if I'm improving.

26. As a fisherman, I want to compare the average catch by bait type, so that I can know which bait is most effective.

27. As a fisherman, I want to compare catch performance across different weather conditions (晴天/阴天/雨天), so that I can understand weather impact on my personal results.

28. As a fisherman, I want to export my data as a JSON backup file, so that I can restore it on a new phone.

29. As a fisherman, I want to import a previously exported JSON backup, so that I can recover my data on a new device.

30. As a fisherman, I want to export my trip data as a CSV file, so that I can analyze it in spreadsheet software.

31. As a fisherman, I want to generate a nice-looking fishing catch screenshot to share, so that I can post on social media.

32. As a fisherman, I want the app to default to using 斤 for weight (with a setting to switch to kg), so that the numbers feel natural to me.

33. As a fisherman, I want the app to be fast to start with no login or setup, so that I can immediately check the fishing index when I'm about to leave.

34. As a fisherman, I want the app to work completely offline for recording and analyzing past trips, so that I can use it even at remote fishing spots without signal.

35. As a fisherman, I want my catch and trip data to stay on my device only, so that my fishing habits remain private.

## Implementation Decisions

### Architecture

- **Flutter 3.27+ / Dart 3.6+** for cross-platform (iOS + Android)
- **Feature-first directory structure**: `lib/features/{recommend, record, history, analytics, settings}/` with a shared `lib/core/` for utilities and `lib/data/` for the data layer
- **SQLite via drift** for all persistent data — chosen over Hive/Isar because analytics requires complex GROUP BY, date-range queries, and aggregations that relational databases handle natively

### Data Model

The domain model is defined in `CONTEXT.md` and maps to 6 entity tables:

1. **Trip** — trip_id, start_time, end_time, spot_id, position_name, bait, gear_type, max_length_cm, total_weight_kg, notes
2. **Spot** — spot_id, name, latitude, longitude, created_at (deduplicated by lat/lon proximity < 100m)
3. **TripSpecies** — trip_id, species_name, count (associative table: one trip can have multiple species, each with a count)
4. **TripSpeciesRecord** — trip_id, species_name, length_cm (optional per-species length)
5. **WeatherData** — id, trip_id, air_temp, pressure_hpa, wind_speed_m_s, weather_condition, fetched_at
6. **Settings** — key-value store for user preferences (weight unit: 斤/kg, any future settings)

### Fishing Index Algorithm

- 8 factors, each scoring 0-20, total 0-100
- Factors: 气压 (pressure 1005-1020 hPa), 风力 (wind 1-5 m/s), 温度 (temp 15-25°C), 天气 (weather: cloudy > sunny > rainy), 月相 (moon phase: new/full), 节气 (solar term: spring/autumn), 昼夜温差 (day-night delta < 10°C), 溶氧量 (dissolved oxygen proxy: high after rain/inflow)
- Pure Dart logic, no external dependencies
- Scored against future-date weather forecasts from the weather API

### Weather Integration

- Provider: 和风天气 API (free tier)
- Called at trip recording time (past trip) and recommendation time (future forecast)
- Returns: air_temp, pressure_hpa, wind_speed_m_s, weather_condition
- Mockable via a WeatherClient interface for testing

### Unit System

- Default weight unit: 斤 (1 斤 = 500g)
- Switchable to kg in Settings
- All storage is internally in kg; display layer converts to 斤 by default

### Unit Conversion in Data

- `total_weight_kg` is stored in kilograms internally
- Display values in 斤 are computed at the presentation layer

### Fish Species Database

- 80-100 species curated for CN freshwater + common marine
- Stored as a local reference table in SQLite
- User-added species are appended at runtime and persisted
- Search is a full-text query on species name and pinyin (future enhancement)

### Bait Database

- Local reference table in SQLite
- User can add custom bait types

### Spot Deduplication

- When a new GPS location is captured, query the Spot table for any existing spot within 100m (Haversine formula)
- If found, match to existing spot; if not, create a new spot with a reverse-geocoded name suggestion

### Analytics Queries

- 出钓频率: GROUP BY strftime('%Y-%m', start_time)
- 最佳钓点: GROUP BY spot_id ORDER BY avg(count) DESC
- 最佳时段: Derive time-of-day slot from start_time, GROUP BY slot ORDER BY avg(count) DESC
- 鱼种分布: GROUP BY species_name ORDER BY count DESC
- 渔获趋势: ORDER BY start_time (line chart data)
- 饵料效率: GROUP BY bait ORDER BY avg(count) DESC
- 天气关联: GROUP BY weather_condition ORDER BY avg(count) DESC

### Export & Sharing

- CSV: Export trip records as rows with all fields
- JSON: Full data export for backup (all tables, round-trip importable)
- PNG: Auto-generate a visually appealing screenshot of catch summary using flutter_chart_export or canvas painting

### Settings

- Weight unit toggle (斤 / kg)
- Fish species management (view, edit, delete custom species)
- Bait management (view, edit, delete custom bait types)
- Data export/import (JSON backup)
- CSV export

### No Social Features

- No user accounts, no cloud sync, no community, no friend system
- Data is 100% on-device

### No Release Tracking

- No catch-and-release recording. All catches are treated as removed.

## Testing Decisions

### What makes a good test

- Test external behavior, not implementation details. For example, test that "fishing index is 85 when pressure=1010, wind=3, temp=20, weather='阴天'" rather than testing internal function calls.
- Use in-memory SQLite for all data-layer tests.
- Mock the WeatherClient interface for tests that depend on weather data.

### Test layers (highest first)

1. **Fishing index algorithm** (unit tests) — Pure Dart, 100% coverage of all 8 factors' scoring logic, including boundary conditions (pressure at exact 1005/1020, wind at exactly 1/5, etc.)
2. **Data layer** (unit tests) — All DAO methods for Trip, Spot, TripSpecies CRUD and analytics queries (GROUP BY aggregations). Verify SQL results, not ORM internals.
3. **Weather API wrapper** (unit tests) — Mock the HTTP client. Test successful parsing, timeout handling, invalid response handling, rate limit behavior.
4. **Feature integration** (integration tests) — End-to-end flow: start trip → GPS captured → weather loaded → species selected → save → verify in history → query analytics.

### What is out of scope for tests

- Widget tests (Flutter UI testing) — skip for now, too brittle and low ROI
- Pixel-perfect visual tests
- Performance benchmarking

## Out of Scope

- User accounts, login, or registration
- Cloud synchronization
- Social features (community, sharing within the app, friend system)
- Catch-and-release tracking
- Real-time fishing activity tracking (GPS only at start/end, not continuous tracking during the trip)
- Fish identification from photos
- Multi-language support (Chinese only, with English model names in the species database)
- Apple Watch / Wear OS companion apps
- Widget/home-screen integration
- Push notifications
- In-app purchases or subscriptions
- Map rendering with terrain/topographic layers (standard map tile only)

## Further Notes

- The app should feel snappy — no loading spinners for local data. Weather API calls should show a "loading" state at most.
- The fishing index card on the home page should be the most prominent element — it's the app's main value proposition.
- All Chinese UI text should use simplified Chinese as the display language.
- The species database should include common pinyin or English aliases to help users search (e.g., searching "鲫鱼" or "crucian" both find "鲫鱼").
- Weather API key will be provided as a runtime configuration value (not hardcoded).
- The app should gracefully handle the case where the weather API is unavailable (show trips without weather data, show "N/A" for index when forecast data is missing).
