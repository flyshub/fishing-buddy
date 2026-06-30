const { FishingIndexCalculator } = require('../../utils/fishing-index')

const calculator = new FishingIndexCalculator()

Page({
  data: {
    loading: true,
    error: null,
    todayIndex: null,
    todayForecast: null,
    forecasts: [],
    recentTrips: []
  },

  onLoad() {
    this.loadData()
  },

  async loadData() {
    this.setData({ loading: true, error: null })

    try {
      const db = wx.cloud.database()

      // 获取用户定位
      let lat = 31.23
      let lon = 121.47
      try {
        const locRes = await new Promise((resolve, reject) => {
          wx.getLocation({ type: 'gcj02', success: resolve, fail: reject })
        })
        lat = locRes.latitude
        lon = locRes.longitude
      } catch (e) {
        console.warn('定位失败，使用默认坐标:', e)
      }

      // 获取天气数据
      let forecasts = []
      try {
        const weatherRes = await wx.cloud.callFunction({
          name: 'weather-proxy',
          data: { lat, lon }
        })

        if (weatherRes.result.code === 0) {
          forecasts = weatherRes.result.data
        }
      } catch (e) {
        console.error('天气获取失败:', e)
      }

      // 计算钓鱼指数
      let todayIndex = null
      let todayForecast = null
      if (forecasts.length > 0) {
        todayForecast = forecasts[0]
        todayIndex = calculator.calculate(todayForecast)
      }

      // 计算每天的指数
      const forecastCards = forecasts.map(f => {
        const result = calculator.calculate(f)
        return {
          date: f.date,
          weatherCondition: f.weatherCondition,
          minTemp: f.minTemp,
          maxTemp: f.maxTemp,
          windSpeedMps: f.windSpeedMps,
          pressureHpa: f.pressureHpa,
          totalScore: result.totalScore,
          recommendation: this.formatRecommendation(result.recommendation),
          scoreColor: this.formatScoreColor(result.totalScore),
          factorScores: result.factorScores
        }
      })

      // 获取最近行程
      let recentTrips = []
      try {
        const tripsRes = await db.collection('trips')
          .orderBy('startTime', 'desc')
          .limit(3)
          .get()
        recentTrips = tripsRes.data.map(t => this.formatTrip(t))
      } catch (e) {
        console.error('行程获取失败:', e)
      }

      this.setData({
        loading: false,
        todayIndex: todayIndex ? {
          totalScore: todayIndex.totalScore,
          recommendation: this.formatRecommendation(todayIndex.recommendation),
          scoreColor: this.formatScoreColor(todayIndex.totalScore),
          factorScores: todayIndex.factorScores,
          weatherCondition: todayForecast?.weatherCondition,
          minTemp: todayForecast?.minTemp,
          maxTemp: todayForecast?.maxTemp,
          windSpeedMps: todayForecast?.windSpeedMps
        } : null,
        todayForecast,
        forecasts: forecastCards,
        recentTrips
      })
    } catch (e) {
      this.setData({ loading: false, error: e.message || '加载失败' })
    }
  },

  formatScoreColor(score) {
    if (score >= 80) return 'green'
    if (score >= 60) return 'lightGreen'
    if (score >= 40) return 'orange'
    return 'red'
  },

  formatRecommendation(level) {
    switch (level) {
      case 'stronglyRecommended': return '强烈建议出行'
      case 'recommended': return '建议出行'
      case 'moderate': return '可以尝试'
      case 'notRecommended': return '不建议出行'
      default: return '未知'
    }
  },

  formatTrip(trip) {
    const species = trip.species || []
    const totalCount = species.reduce((sum, s) => sum + (s.count || 0), 0)
    return {
      id: trip._id,
      spotName: trip.spot?.name || '未命名渔场',
      date: this.formatDate(trip.startTime),
      speciesSummary: species.map(s => `${s.name}×${s.count}`).join('、'),
      totalCount,
      totalWeightKg: trip.totalWeightKg || 0,
      isNoCatch: species.length === 0
    }
  },

  formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${m}/${day} ${h}:${min}`
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  },

  onShareAppMessage() {
    const score = this.data.todayIndex?.totalScore || 0
    const rec = this.data.todayIndex?.recommendation || '渔游记'
    return {
      title: score > 0 ? `今天钓鱼指数 ${Math.round(score)}，${rec}` : '渔游记 - 钓鱼指数助手',
      path: '/pages/home/home'
    }
  },

  onTapTrip(e) {
    const tripId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${tripId}`
    })
  }
})
