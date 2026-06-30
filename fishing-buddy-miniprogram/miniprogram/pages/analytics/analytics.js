Page({
  data: {
    loading: true,
    catchRate: 0,
    frequencyData: [],
    speciesData: [],
    baitData: [],
    trendData: []
  },

  onLoad() {
    this.loadAnalytics()
  },

  async loadAnalytics() {
    this.setData({ loading: true })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('trips')
        .orderBy('startTime', 'desc')
        .limit(100)
        .get()

      const trips = res.data

      const catchRate = this.calcCatchRate(trips)
      const frequencyData = this.calcFrequency(trips)
      const speciesData = this.calcSpecies(trips)
      const baitData = this.calcBait(trips)
      const trendData = this.calcTrend(trips)

      this.setData({
        loading: false,
        catchRate,
        frequencyData,
        speciesData,
        baitData,
        trendData
      })
    } catch (e) {
      this.setData({ loading: false })
    }
  },

  calcCatchRate(trips) {
    if (trips.length === 0) return 0
    const withCatch = trips.filter(t => (t.species || []).length > 0).length
    return Math.round((withCatch / trips.length) * 100)
  },

  calcFrequency(trips) {
    const freq = {}
    for (const trip of trips) {
      const d = new Date(trip.startTime)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      freq[key] = (freq[key] || 0) + 1
    }
    return Object.entries(freq)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }))
  },

  calcSpecies(trips) {
    const dist = {}
    for (const trip of trips) {
      for (const s of (trip.species || [])) {
        dist[s.name] = (dist[s.name] || 0) + s.count
      }
    }
    return Object.entries(dist)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }))
  },

  calcBait(trips) {
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
  },

  calcTrend(trips) {
    return trips
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .map(t => ({
        date: t.startTime.split('T')[0],
        totalCount: (t.species || []).reduce((sum, s) => sum + s.count, 0),
        totalWeightKg: t.totalWeightKg || 0
      }))
  }
})
