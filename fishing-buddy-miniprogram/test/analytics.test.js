/**
 * #0017 Analytics 图表逻辑测试
 * 验证出钓频率、鱼种分布、渔获趋势、饵料效率、中鱼率计算
 */

function calcCatchRate(trips) {
  if (trips.length === 0) return 0
  const withCatch = trips.filter(t => (t.species || []).length > 0).length
  return Math.round((withCatch / trips.length) * 100)
}

function calcFrequencyPerMonth(trips) {
  const freq = {}
  for (const trip of trips) {
    const d = new Date(trip.startTime)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    freq[key] = (freq[key] || 0) + 1
  }
  return Object.entries(freq)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }))
}

function calcSpeciesDistribution(trips) {
  const dist = {}
  for (const trip of trips) {
    for (const s of (trip.species || [])) {
      dist[s.name] = (dist[s.name] || 0) + s.count
    }
  }
  return Object.entries(dist)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }))
}

function calcBaitEfficiency(trips) {
  const baitData = {}
  for (const trip of trips) {
    const bait = trip.bait
    if (!bait) continue
    const totalCount = (trip.species || []).reduce((sum, s) => sum + s.count, 0)
    if (!baitData[bait]) baitData[bait] = { total: 0, count: 0 }
    baitData[bait].total += totalCount
    baitData[bait].count += 1
  }
  return Object.entries(baitData)
    .map(([bait, data]) => ({
      bait,
      avgCount: Math.round((data.total / data.count) * 10) / 10,
      tripCount: data.count
    }))
    .sort((a, b) => b.avgCount - a.avgCount)
}

function calcCatchTrend(trips) {
  return trips
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .map(t => ({
      date: t.startTime.split('T')[0],
      totalCount: (t.species || []).reduce((sum, s) => sum + s.count, 0),
      totalWeightKg: t.totalWeightKg || 0
    }))
}

describe('Analytics', () => {
  const mockTrips = [
    {
      _id: '1', startTime: '2026-06-01T08:00:00',
      species: [{ name: '鲫鱼', count: 5 }], totalWeightKg: 2.0, bait: '蚯蚓'
    },
    {
      _id: '2', startTime: '2026-06-15T14:00:00',
      species: [{ name: '鲤鱼', count: 3 }, { name: '鲫鱼', count: 2 }],
      totalWeightKg: 3.5, bait: '蚯蚓'
    },
    {
      _id: '3', startTime: '2026-06-20T06:00:00',
      species: [], totalWeightKg: 0, bait: null
    },
    {
      _id: '4', startTime: '2026-07-01T10:00:00',
      species: [{ name: '草鱼', count: 1 }], totalWeightKg: 5.0, bait: '玉米'
    },
    {
      _id: '5', startTime: '2026-07-15T09:00:00',
      species: [{ name: '鲫鱼', count: 8 }], totalWeightKg: 3.0, bait: '商品饵'
    }
  ]

  describe('中鱼率', () => {
    test('计算中鱼率百分比', () => {
      expect(calcCatchRate(mockTrips)).toBe(80)
    })

    test('全部空军时为 0', () => {
      expect(calcCatchRate([{ species: [] }, { species: [] }])).toBe(0)
    })

    test('全部中鱼时为 100', () => {
      expect(calcCatchRate([{ species: [{ count: 1 }] }])).toBe(100)
    })

    test('空列表为 0', () => {
      expect(calcCatchRate([])).toBe(0)
    })
  })

  describe('出钓频率', () => {
    test('按月分组统计', () => {
      const freq = calcFrequencyPerMonth(mockTrips)
      expect(freq).toEqual([
        { month: '2026-06', count: 3 },
        { month: '2026-07', count: 2 }
      ])
    })

    test('空列表返回空', () => {
      expect(calcFrequencyPerMonth([])).toEqual([])
    })
  })

  describe('鱼种分布', () => {
    test('按数量降序排列', () => {
      const dist = calcSpeciesDistribution(mockTrips)
      expect(dist[0].name).toBe('鲫鱼')
      expect(dist[0].count).toBe(15) // 5+2+8
      expect(dist[1].name).toBe('鲤鱼')
      expect(dist[1].count).toBe(3)
    })

    test('只统计有渔获的行程', () => {
      const dist = calcSpeciesDistribution(mockTrips)
      const names = dist.map(d => d.name)
      expect(names).toContain('鲫鱼')
      expect(names).toContain('鲤鱼')
      expect(names).toContain('草鱼')
    })
  })

  describe('饵料效率', () => {
    test('按平均渔获降序', () => {
      const eff = calcBaitEfficiency(mockTrips)
      expect(eff.length).toBe(3)
      expect(eff[0].bait).toBe('商品饵')
      expect(eff[0].avgCount).toBe(8)
    })

    test('计算饵料使用次数', () => {
      const eff = calcBaitEfficiency(mockTrips)
      const earthworm = eff.find(e => e.bait === '蚯蚓')
      expect(earthworm.tripCount).toBe(2)
      expect(earthworm.avgCount).toBe(5) // (5+5)/2
    })

    test('无饵料行程被忽略', () => {
      const eff = calcBaitEfficiency(mockTrips)
      expect(eff.every(e => e.bait !== null)).toBe(true)
    })
  })

  describe('渔获趋势', () => {
    test('按时间升序', () => {
      const trend = calcCatchTrend(mockTrips)
      expect(trend[0].date).toBe('2026-06-01')
      expect(trend[trend.length - 1].date).toBe('2026-07-15')
    })

    test('包含总数量和总重量', () => {
      const trend = calcCatchTrend(mockTrips)
      expect(trend[0].totalCount).toBe(5)
      expect(trend[0].totalWeightKg).toBe(2.0)
    })

    test('空军行程总数量为 0', () => {
      const trend = calcCatchTrend(mockTrips)
      const noCatch = trend.find(t => t.date === '2026-06-20')
      expect(noCatch.totalCount).toBe(0)
    })
  })
})
