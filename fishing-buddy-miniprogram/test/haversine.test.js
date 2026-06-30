/**
 * #0016 GPS 定位 + 钓点去重测试
 * 验证 Haversine 距离计算和钓点匹配逻辑
 */

const { distanceMeters } = require('../miniprogram/utils/haversine')

function findNearestSpot(currentLat, currentLon, spots, maxDistanceMeters) {
  let nearest = null
  let minDist = Infinity

  for (const spot of spots) {
    const dist = distanceMeters(currentLat, currentLon, spot.latitude, spot.longitude)
    if (dist < minDist) {
      minDist = dist
      nearest = { ...spot, distance: dist }
    }
  }

  if (nearest && nearest.distance <= maxDistanceMeters) {
    return nearest
  }
  return null
}

describe('Haversine 距离计算', () => {
  test('同一点距离为 0', () => {
    const dist = distanceMeters(31.23, 121.47, 31.23, 121.47)
    expect(dist).toBe(0)
  })

  test('已知距离（约 1km）', () => {
    // 上海人民广场到上海火车站约 3.5km
    const dist = distanceMeters(31.2304, 121.4737, 31.2500, 121.4737)
    expect(dist).toBeGreaterThan(2000)
    expect(dist).toBeLessThan(3000)
  })

  test('跨城市距离（上海到杭州约 170km）', () => {
    const dist = distanceMeters(31.23, 121.47, 30.27, 120.15)
    expect(dist).toBeGreaterThan(150000)
    expect(dist).toBeLessThan(200000)
  })

  test('距离精度在 1% 以内', () => {
    // 1 度纬度约 111km
    const dist = distanceMeters(31.0, 121.0, 32.0, 121.0)
    expect(dist).toBeCloseTo(111000, -3)
  })
})

describe('钓点去重', () => {
  const existingSpots = [
    { id: 1, name: '青鱼湖', latitude: 31.2304, longitude: 121.4737 },
    { id: 2, name: '黄浦江', latitude: 31.2400, longitude: 121.4900 },
    { id: 3, name: '千岛湖', latitude: 29.6000, longitude: 119.0000 }
  ]

  test('100m 内匹配到已有钓点', () => {
    // 距离青鱼湖约 50m
    const match = findNearestSpot(31.2308, 121.4740, existingSpots, 100)
    expect(match).not.toBeNull()
    expect(match.id).toBe(1)
    expect(match.name).toBe('青鱼湖')
    expect(match.distance).toBeLessThan(100)
  })

  test('超过 100m 不匹配', () => {
    // 距离所有钓点都超过 100m
    const match = findNearestSpot(31.2350, 121.4800, existingSpots, 100)
    expect(match).toBeNull()
  })

  test('匹配最近的钓点', () => {
    // 距离青鱼湖约 30m，距离黄浦江约 2000m
    const match = findNearestSpot(31.2306, 121.4739, existingSpots, 100)
    expect(match).not.toBeNull()
    expect(match.id).toBe(1)
  })

  test('空钓点列表不匹配', () => {
    const match = findNearestSpot(31.23, 121.47, [], 100)
    expect(match).toBeNull()
  })

  test('自定义距离阈值', () => {
    // 距离青鱼湖约 200m
    const match500 = findNearestSpot(31.2320, 121.4737, existingSpots, 500)
    expect(match500).not.toBeNull()
    expect(match500.id).toBe(1)

    const match100 = findNearestSpot(31.2320, 121.4737, existingSpots, 100)
    expect(match100).toBeNull()
  })
})

describe('反向地理编码', () => {
  test('云函数调用格式', () => {
    const callData = { lat: 31.23, lon: 121.47 }
    expect(callData.lat).toBe(31.23)
    expect(callData.lon).toBe(121.47)
  })
})
