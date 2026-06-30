Page({
  data: {
    loading: true,
    detail: null,
    error: null
  },

  onLoad(options) {
    const tripId = options.id
    if (tripId) {
      this.loadTrip(tripId)
    } else {
      this.setData({ loading: false, error: '缺少行程 ID' })
    }
  },

  async loadTrip(tripId) {
    this.setData({ loading: true, error: null })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('trips').doc(tripId).get()

      if (res.data) {
        const detail = this.formatDetail(res.data)
        this.setData({ loading: false, detail })
      } else {
        this.setData({ loading: false, error: '行程不存在' })
      }
    } catch (e) {
      this.setData({ loading: false, error: e.message || '加载失败' })
    }
  },

  formatDetail(trip) {
    const species = trip.species || []
    return {
      startTime: this.formatDateTime(trip.startTime),
      endTime: trip.endTime ? this.formatDateTime(trip.endTime) : null,
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
  },

  formatDateTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${h}:${min}`
  }
})
