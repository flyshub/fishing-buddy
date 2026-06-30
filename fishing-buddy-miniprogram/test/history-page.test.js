/**
 * #0015 历史列表 + 行程详情逻辑测试
 */

function formatTripSummary(trip) {
  const species = trip.species || []
  const totalCount = species.reduce((sum, s) => sum + (s.count || 0), 0)
  return {
    id: trip._id,
    spotName: trip.spot?.name || '未命名渔场',
    date: formatDate(trip.startTime),
    time: formatTime(trip.startTime),
    speciesSummary: species.map(s => `${s.name}×${s.count}`).join('、'),
    totalCount,
    totalWeightKg: trip.totalWeightKg || 0,
    isNoCatch: species.length === 0
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${min}`
}

function formatDetail(trip) {
  const species = trip.species || []
  return {
    startTime: formatDateTime(trip.startTime),
    endTime: trip.endTime ? formatDateTime(trip.endTime) : null,
    spotName: trip.spot?.name || '未命名渔场',
    positionName: trip.positionName,
    gearType: trip.gearType,
    maxLengthCm: trip.maxLengthCm,
    totalWeightKg: trip.totalWeightKg || 0,
    bait: trip.bait,
    species: species.map(s => ({
      name: s.name,
      count: s.count
    })),
    totalCount: species.reduce((sum, s) => sum + (s.count || 0), 0),
    weather: trip.weather,
    notes: trip.notes,
    isNoCatch: species.length === 0
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return ''
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`
}

describe('历史列表', () => {
  const mockTrips = [
    {
      _id: 'trip-1',
      spot: { name: '青鱼湖' },
      startTime: '2026-06-29T08:00:00',
      species: [{ name: '鲫鱼', count: 5 }, { name: '鲤鱼', count: 2 }],
      totalWeightKg: 2.3
    },
    {
      _id: 'trip-2',
      spot: { name: '黄浦江' },
      startTime: '2026-06-28T14:30:00',
      species: [],
      totalWeightKg: 0
    },
    {
      _id: 'trip-3',
      spot: { name: '千岛湖' },
      startTime: '2026-06-27T06:15:00',
      species: [{ name: '草鱼', count: 1 }],
      totalWeightKg: 5.0
    }
  ]

  test('行程摘要包含必要字段', () => {
    const summary = formatTripSummary(mockTrips[0])
    expect(summary.id).toBe('trip-1')
    expect(summary.spotName).toBe('青鱼湖')
    expect(summary.date).toBe('2026-06-29')
    expect(summary.time).toBe('08:00')
    expect(summary.speciesSummary).toBe('鲫鱼×5、鲤鱼×2')
    expect(summary.totalCount).toBe(7)
    expect(summary.isNoCatch).toBe(false)
  })

  test('空军行程标记', () => {
    const summary = formatTripSummary(mockTrips[1])
    expect(summary.isNoCatch).toBe(true)
    expect(summary.totalCount).toBe(0)
    expect(summary.speciesSummary).toBe('')
  })

  test('多条行程按时间格式化', () => {
    const summaries = mockTrips.map(formatTripSummary)
    expect(summaries).toHaveLength(3)
    expect(summaries[0].date).toBe('2026-06-29')
    expect(summaries[2].date).toBe('2026-06-27')
  })

  test('无钓点名时使用默认值', () => {
    const trip = { _id: 'x', spot: null, startTime: '2026-06-29T08:00:00', species: [] }
    const summary = formatTripSummary(trip)
    expect(summary.spotName).toBe('未命名渔场')
  })
})

describe('行程详情', () => {
  test('完整行程详情', () => {
    const trip = {
      _id: 'trip-1',
      startTime: '2026-06-29T08:00:00',
      endTime: '2026-06-29T12:00:00',
      spot: { name: '青鱼湖' },
      positionName: '东岸浅滩',
      gearType: '手竿',
      maxLengthCm: 35,
      totalWeightKg: 2.3,
      bait: '蚯蚓',
      species: [{ name: '鲫鱼', count: 5 }],
      weather: { airTemp: 22, pressureHpa: 1012, windSpeedMps: 3, weatherCondition: '多云' },
      notes: '今天气压不错'
    }

    const detail = formatDetail(trip)
    expect(detail.startTime).toBe('2026-06-29 08:00')
    expect(detail.endTime).toBe('2026-06-29 12:00')
    expect(detail.spotName).toBe('青鱼湖')
    expect(detail.positionName).toBe('东岸浅滩')
    expect(detail.gearType).toBe('手竿')
    expect(detail.maxLengthCm).toBe(35)
    expect(detail.totalWeightKg).toBe(2.3)
    expect(detail.bait).toBe('蚯蚓')
    expect(detail.species).toEqual([{ name: '鲫鱼', count: 5 }])
    expect(detail.weather).toBeTruthy()
    expect(detail.notes).toBe('今天气压不错')
    expect(detail.isNoCatch).toBe(false)
  })

  test('可选字段为空时不影响展示', () => {
    const trip = {
      _id: 'trip-2',
      startTime: '2026-06-29T08:00:00',
      spot: { name: '黄浦江' },
      species: [],
      totalWeightKg: 0
    }

    const detail = formatDetail(trip)
    expect(detail.endTime).toBeNull()
    expect(detail.positionName).toBeUndefined()
    expect(detail.gearType).toBeUndefined()
    expect(detail.weather).toBeUndefined()
    expect(detail.isNoCatch).toBe(true)
  })
})
