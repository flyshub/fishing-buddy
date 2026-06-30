Page({
  data: {
    loading: true,
    trips: [],
    error: null
  },

  onLoad() {
    this.loadTrips()
  },

  onShow() {
    this.loadTrips()
  },

  async loadTrips() {
    this.setData({ loading: true, error: null })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('trips')
        .orderBy('startTime', 'desc')
        .limit(100)
        .get()

      const trips = res.data.map(t => this.formatTrip(t))
      this.setData({ loading: false, trips })
    } catch (e) {
      this.setData({ loading: false, error: e.message || '加载失败' })
    }
  },

  formatTrip(trip) {
    const species = trip.species || []
    const totalCount = species.reduce((sum, s) => sum + (s.count || 0), 0)
    const d = new Date(trip.startTime)
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')

    return {
      id: trip._id,
      spotName: trip.spot?.name || '未命名渔场',
      date: `${m}/${day}`,
      time: `${h}:${min}`,
      speciesSummary: species.map(s => `${s.name}×${s.count}`).join('、'),
      totalCount,
      totalWeightKg: trip.totalWeightKg || 0,
      isNoCatch: species.length === 0
    }
  },

  onPullDownRefresh() {
    this.loadTrips().then(() => wx.stopPullDownRefresh())
  },

  onTapTrip(e) {
    const tripId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${tripId}`
    })
  },

  goAnalytics() {
    wx.navigateTo({
      url: '/pages/analytics/analytics'
    })
  }
})
