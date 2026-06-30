/**
 * #0013 首页数据处理逻辑测试
 * 验证钓鱼指数展示、预报列表、最近行程的数据转换
 */

const { FishingIndexCalculator } = require('../miniprogram/utils/fishing-index')

function makeForecast(overrides = {}) {
  return {
    date: new Date('2026-06-29T12:00:00'),
    airTemp: 22,
    minTemp: 18,
    maxTemp: 26,
    pressureHpa: 1012,
    windSpeedMps: 3,
    weatherCondition: '多云',
    hasRainForecast: false,
    ...overrides
  }
}

function formatScoreColor(score) {
  if (score >= 80) return 'green'
  if (score >= 60) return 'lightGreen'
  if (score >= 40) return 'orange'
  return 'red'
}

function formatRecommendationText(level) {
  switch (level) {
    case 'stronglyRecommended': return '强烈建议出行'
    case 'recommended': return '建议出行'
    case 'moderate': return '可以尝试'
    case 'notRecommended': return '不建议出行'
    default: return '未知'
  }
}

function formatDayCard(forecast, indexResult) {
  return {
    date: forecast.date,
    weatherCondition: forecast.weatherCondition,
    minTemp: forecast.minTemp,
    maxTemp: forecast.maxTemp,
    windSpeedMps: forecast.windSpeedMps,
    totalScore: indexResult.totalScore,
    recommendation: formatRecommendationText(indexResult.recommendation),
    scoreColor: formatScoreColor(indexResult.totalScore),
    factorScores: indexResult.factorScores
  }
}

describe('首页数据处理', () => {
  const calc = new FishingIndexCalculator()

  describe('分数颜色映射', () => {
    test('>=80 绿色', () => {
      expect(formatScoreColor(85)).toBe('green')
      expect(formatScoreColor(80)).toBe('green')
    })

    test('>=60 浅绿', () => {
      expect(formatScoreColor(70)).toBe('lightGreen')
      expect(formatScoreColor(60)).toBe('lightGreen')
    })

    test('>=40 橙色', () => {
      expect(formatScoreColor(50)).toBe('orange')
      expect(formatScoreColor(40)).toBe('orange')
    })

    test('<40 红色', () => {
      expect(formatScoreColor(30)).toBe('red')
      expect(formatScoreColor(0)).toBe('red')
    })
  })

  describe('推荐等级文案', () => {
    test('stronglyRecommended → 强烈建议出行', () => {
      expect(formatRecommendationText('stronglyRecommended')).toBe('强烈建议出行')
    })

    test('recommended → 建议出行', () => {
      expect(formatRecommendationText('recommended')).toBe('建议出行')
    })

    test('moderate → 可以尝试', () => {
      expect(formatRecommendationText('moderate')).toBe('可以尝试')
    })

    test('notRecommended → 不建议出行', () => {
      expect(formatRecommendationText('notRecommended')).toBe('不建议出行')
    })
  })

  describe('日期卡片格式化', () => {
    test('包含完整预报信息', () => {
      const forecast = makeForecast()
      const indexResult = calc.calculate(forecast)
      const card = formatDayCard(forecast, indexResult)

      expect(card.date).toBeInstanceOf(Date)
      expect(card.weatherCondition).toBe('多云')
      expect(card.minTemp).toBe(18)
      expect(card.maxTemp).toBe(26)
      expect(card.totalScore).toBeGreaterThan(0)
      expect(card.recommendation).toBeTruthy()
      expect(card.scoreColor).toBeTruthy()
      expect(card.factorScores).toHaveLength(8)
    })
  })

  describe('7天预报列表', () => {
    test('可以处理多天预报', () => {
      const forecasts = Array.from({ length: 7 }, (_, i) => {
        const date = new Date('2026-06-29T12:00:00')
        date.setDate(date.getDate() + i)
        return makeForecast({ date })
      })

      const cards = forecasts.map(f => {
        const result = calc.calculate(f)
        return formatDayCard(f, result)
      })

      expect(cards).toHaveLength(7)
      cards.forEach(card => {
        expect(card.totalScore).toBeGreaterThanOrEqual(0)
        expect(card.totalScore).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('最近行程格式化', () => {
    test('行程卡片包含必要字段', () => {
      const trip = {
        _id: 'trip-1',
        spot: { name: '青鱼湖', latitude: 31.23, longitude: 121.47 },
        startTime: new Date('2026-06-29T08:00:00'),
        species: [{ name: '鲫鱼', count: 5 }],
        totalWeightKg: 2.3
      }

      const card = {
        id: trip._id,
        spotName: trip.spot.name,
        date: trip.startTime,
        speciesSummary: trip.species.map(s => `${s.name}×${s.count}`).join('、'),
        totalCount: trip.species.reduce((sum, s) => sum + s.count, 0),
        totalWeightKg: trip.totalWeightKg,
        isNoCatch: trip.species.length === 0
      }

      expect(card.id).toBe('trip-1')
      expect(card.spotName).toBe('青鱼湖')
      expect(card.speciesSummary).toBe('鲫鱼×5')
      expect(card.totalCount).toBe(5)
      expect(card.isNoCatch).toBe(false)
    })

    test('空军行程标记', () => {
      const trip = {
        _id: 'trip-2',
        spot: { name: '黄浦江' },
        startTime: new Date('2026-06-28T14:00:00'),
        species: [],
        totalWeightKg: 0
      }

      const card = {
        id: trip._id,
        spotName: trip.spot.name,
        isNoCatch: trip.species.length === 0
      }

      expect(card.isNoCatch).toBe(true)
    })
  })
})
