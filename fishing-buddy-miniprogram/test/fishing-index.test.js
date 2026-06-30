/**
 * #0012 钓鱼指数算法测试
 * 验证 8 因子评分逻辑，从 Flutter calculator.dart 1:1 移植
 */

const { FishingIndexCalculator } = require('../miniprogram/utils/fishing-index')

function makeForecast(overrides = {}) {
  return {
    date: new Date('2026-06-29T12:00:00'),
    airTemp: 20,
    minTemp: 15,
    maxTemp: 25,
    pressureHpa: 1012,
    windSpeedMps: 3,
    weatherCondition: '多云',
    hasRainForecast: false,
    ...overrides
  }
}

describe('FishingIndexCalculator', () => {
  const calc = new FishingIndexCalculator()

  describe('总分和推荐等级', () => {
    test('理想条件下总分应接近满分', () => {
      const result = calc.calculate(makeForecast())
      expect(result.totalScore).toBeGreaterThan(80)
      expect(result.recommendation).toBe('stronglyRecommended')
    })

    test('极端恶劣条件总分应很低', () => {
      const result = calc.calculate(makeForecast({
        pressureHpa: 940,
        windSpeedMps: 15,
        airTemp: -10,
        minTemp: -15,
        maxTemp: -5,
        weatherCondition: '暴雨',
        hasRainForecast: false
      }))
      expect(result.totalScore).toBeLessThan(80)
      expect(result.recommendation).not.toBe('stronglyRecommended')
    })

    test('返回 8 个因子分数', () => {
      const result = calc.calculate(makeForecast())
      expect(result.factorScores).toHaveLength(8)
      expect(result.factorScores.map(f => f.name)).toEqual([
        '气压', '风力', '温度', '天气', '月相', '节气', '昼夜温差', '溶氧量'
      ])
    })

    test('总分不超过因子之和（clamp 逻辑）', () => {
      const result = calc.calculate(makeForecast())
      const sum = result.factorScores.reduce((s, f) => s + f.score, 0)
      expect(result.totalScore).toBeLessThanOrEqual(sum)
      expect(result.totalScore).toBeLessThanOrEqual(100)
    })

    test('总分不超过 100', () => {
      const result = calc.calculate(makeForecast({
        pressureHpa: 1012,
        windSpeedMps: 3,
        airTemp: 20,
        weatherCondition: '多云',
        hasRainForecast: true
      }))
      expect(result.totalScore).toBeLessThanOrEqual(100)
    })
  })

  describe('气压因子', () => {
    test('1005-1020 hPa 范围内满分', () => {
      const result = calc.calculate(makeForecast({ pressureHpa: 1010 }))
      const pressure = result.factorScores.find(f => f.name === '气压')
      expect(pressure.score).toBe(20)
    })

    test('恰好 1005 hPa 满分', () => {
      const result = calc.calculate(makeForecast({ pressureHpa: 1005 }))
      const pressure = result.factorScores.find(f => f.name === '气压')
      expect(pressure.score).toBe(20)
    })

    test('恰好 1020 hPa 满分', () => {
      const result = calc.calculate(makeForecast({ pressureHpa: 1020 }))
      const pressure = result.factorScores.find(f => f.name === '气压')
      expect(pressure.score).toBe(20)
    })

    test('950 hPa 以下为 0 分', () => {
      const result = calc.calculate(makeForecast({ pressureHpa: 940 }))
      const pressure = result.factorScores.find(f => f.name === '气压')
      expect(pressure.score).toBe(0)
    })

    test('1080 hPa 以上为 0 分', () => {
      const result = calc.calculate(makeForecast({ pressureHpa: 1090 }))
      const pressure = result.factorScores.find(f => f.name === '气压')
      expect(pressure.score).toBe(0)
    })

    test('低于最优范围线性递减', () => {
      const result = calc.calculate(makeForecast({ pressureHpa: 977.5 }))
      const pressure = result.factorScores.find(f => f.name === '气压')
      // 977.5 = (977.5 - 950) / (1005 - 950) * 20 = 27.5/55 * 20 = 10
      expect(pressure.score).toBe(10)
    })

    test('高于最优范围线性递减', () => {
      const result = calc.calculate(makeForecast({ pressureHpa: 1050 }))
      const pressure = result.factorScores.find(f => f.name === '气压')
      // (1080 - 1050) / (1080 - 1020) * 20 = 30/60 * 20 = 10
      expect(pressure.score).toBe(10)
    })
  })

  describe('风力因子', () => {
    test('1-5 m/s 范围内满分', () => {
      const result = calc.calculate(makeForecast({ windSpeedMps: 3 }))
      const wind = result.factorScores.find(f => f.name === '风力')
      expect(wind.score).toBe(20)
    })

    test('0 m/s 为 0 分', () => {
      const result = calc.calculate(makeForecast({ windSpeedMps: 0 }))
      const wind = result.factorScores.find(f => f.name === '风力')
      expect(wind.score).toBe(0)
    })

    test('10 m/s 以上为 0 分', () => {
      const result = calc.calculate(makeForecast({ windSpeedMps: 12 }))
      const wind = result.factorScores.find(f => f.name === '风力')
      expect(wind.score).toBe(0)
    })

    test('0-1 m/s 线性递增', () => {
      const result = calc.calculate(makeForecast({ windSpeedMps: 0.5 }))
      const wind = result.factorScores.find(f => f.name === '风力')
      expect(wind.score).toBe(10)
    })

    test('5-10 m/s 线性递减', () => {
      const result = calc.calculate(makeForecast({ windSpeedMps: 7.5 }))
      const wind = result.factorScores.find(f => f.name === '风力')
      expect(wind.score).toBe(10)
    })
  })

  describe('温度因子', () => {
    test('15-25°C 范围内满分', () => {
      const result = calc.calculate(makeForecast({ airTemp: 20 }))
      const temp = result.factorScores.find(f => f.name === '温度')
      expect(temp.score).toBe(20)
    })

    test('-5°C 以下为 0 分', () => {
      const result = calc.calculate(makeForecast({ airTemp: -10 }))
      const temp = result.factorScores.find(f => f.name === '温度')
      expect(temp.score).toBe(0)
    })

    test('35°C 以上为 0 分', () => {
      const result = calc.calculate(makeForecast({ airTemp: 40 }))
      const temp = result.factorScores.find(f => f.name === '温度')
      expect(temp.score).toBe(0)
    })

    test('5°C 时得分 10', () => {
      const result = calc.calculate(makeForecast({ airTemp: 5 }))
      const temp = result.factorScores.find(f => f.name === '温度')
      // (5 - (-5)) / (15 - (-5)) * 20 = 10/20 * 20 = 10
      expect(temp.score).toBe(10)
    })

    test('30°C 时得分 10', () => {
      const result = calc.calculate(makeForecast({ airTemp: 30 }))
      const temp = result.factorScores.find(f => f.name === '温度')
      // (35 - 30) / (35 - 25) * 20 = 5/10 * 20 = 10
      expect(temp.score).toBe(10)
    })
  })

  describe('天气因子', () => {
    const weatherCases = [
      { condition: '阴', expected: 20 },
      { condition: '多云', expected: 20 },
      { condition: '晴', expected: 15 },
      { condition: '小雨', expected: 12 },
      { condition: '中雨', expected: 8 },
      { condition: '大雨', expected: 5 },
      { condition: '暴雨', expected: 5 },
      { condition: '雪', expected: 5 },
      { condition: '雷阵雨', expected: 3 },
      { condition: '未知', expected: 10 }
    ]

    weatherCases.forEach(({ condition, expected }) => {
      test(`"${condition}" 得分 ${expected}`, () => {
        const result = calc.calculate(makeForecast({ weatherCondition: condition }))
        const weather = result.factorScores.find(f => f.name === '天气')
        expect(weather.score).toBe(expected)
      })
    })
  })

  describe('月相因子', () => {
    test('新月附近（约1月1日）得分高', () => {
      // Day 1 of year, lunar day ≈ 1 % 29.53 = 1, close to new moon
      const result = calc.calculate(makeForecast({
        date: new Date('2026-01-01T12:00:00')
      }))
      const moon = result.factorScores.find(f => f.name === '月相')
      expect(moon.score).toBe(20)
    })

    test('满月附近（约1月15日）得分高', () => {
      // Day 15, lunar day ≈ 15 % 29.53 = 15, close to full moon (14.77)
      const result = calc.calculate(makeForecast({
        date: new Date('2026-01-15T12:00:00')
      }))
      const moon = result.factorScores.find(f => f.name === '月相')
      expect(moon.score).toBe(20)
    })
  })

  describe('节气因子', () => {
    test('春季（4月）满分', () => {
      const result = calc.calculate(makeForecast({
        date: new Date('2026-04-15T12:00:00')
      }))
      const solar = result.factorScores.find(f => f.name === '节气')
      expect(solar.score).toBe(20)
    })

    test('秋季（10月）满分', () => {
      const result = calc.calculate(makeForecast({
        date: new Date('2026-10-15T12:00:00')
      }))
      const solar = result.factorScores.find(f => f.name === '节气')
      expect(solar.score).toBe(20)
    })

    test('夏季（7月）基础分', () => {
      const result = calc.calculate(makeForecast({
        date: new Date('2026-07-15T12:00:00')
      }))
      const solar = result.factorScores.find(f => f.name === '节气')
      expect(solar.score).toBe(10)
    })

    test('冬季（1月）基础分', () => {
      const result = calc.calculate(makeForecast({
        date: new Date('2026-01-15T12:00:00')
      }))
      const solar = result.factorScores.find(f => f.name === '节气')
      expect(solar.score).toBe(10)
    })
  })

  describe('昼夜温差因子', () => {
    test('温差 <= 10°C 满分', () => {
      const result = calc.calculate(makeForecast({
        minTemp: 15, maxTemp: 25
      }))
      const delta = result.factorScores.find(f => f.name === '昼夜温差')
      expect(delta.score).toBe(20)
    })

    test('温差 >= 20°C 为 0 分', () => {
      const result = calc.calculate(makeForecast({
        minTemp: 5, maxTemp: 25
      }))
      const delta = result.factorScores.find(f => f.name === '昼夜温差')
      expect(delta.score).toBe(0)
    })

    test('温差 15°C 得分 10', () => {
      const result = calc.calculate(makeForecast({
        minTemp: 10, maxTemp: 25
      }))
      const delta = result.factorScores.find(f => f.name === '昼夜温差')
      // (20 - 15) / (20 - 10) * 20 = 5/10 * 20 = 10
      expect(delta.score).toBe(10)
    })
  })

  describe('溶氧量因子', () => {
    test('有降雨预报得满分', () => {
      const result = calc.calculate(makeForecast({ hasRainForecast: true }))
      const oxygen = result.factorScores.find(f => f.name === '溶氧量')
      expect(oxygen.score).toBe(20)
    })

    test('无降雨预报基础分', () => {
      const result = calc.calculate(makeForecast({ hasRainForecast: false }))
      const oxygen = result.factorScores.find(f => f.name === '溶氧量')
      expect(oxygen.score).toBe(10)
    })
  })
})
