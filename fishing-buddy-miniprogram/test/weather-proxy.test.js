/**
 * #0012 天气代理云函数测试
 * Mock HTTP 请求，验证数据解析逻辑
 */

const mockFetch = jest.fn()
jest.mock('node-fetch', () => mockFetch)
jest.mock('wx-server-sdk', () => ({
  cloud: {
    init: jest.fn(),
    DYNAMIC_CURRENT_ENV: 'test'
  }
}))

const mockResponse = {
  list: [
    {
      dt_txt: '2026-06-29 12:00:00',
      main: { temp: 22, pressure: 1012 },
      wind: { speed: 3.5 },
      weather: [{ description: '多云' }],
      pop: 0.1
    },
    {
      dt_txt: '2026-06-29 15:00:00',
      main: { temp: 25, pressure: 1010 },
      wind: { speed: 4.0 },
      weather: [{ description: '多云' }],
      pop: 0.3
    },
    {
      dt_txt: '2026-06-30 12:00:00',
      main: { temp: 18, pressure: 1008 },
      wind: { speed: 2.0 },
      weather: [{ description: '小雨' }],
      pop: 0.6
    }
  ]
}

describe('weather-proxy 云函数', () => {
  let handler

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.OPENWEATHERMAP_API_KEY = 'test-key'
    handler = require('../cloudfunctions/weather-proxy/index')
  })

  test('缺少经纬度参数返回错误', async () => {
    const result = await handler.main({})
    expect(result.code).toBe(-1)
    expect(result.message).toContain('缺少经纬度')
  })

  test('成功获取天气数据', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await handler.main({ lat: 31.23, lon: 121.47 })
    expect(result.code).toBe(0)
    expect(result.data).toBeDefined()
    expect(Array.isArray(result.data)).toBe(true)
  })

  test('解析每日预报数据', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await handler.main({ lat: 31.23, lon: 121.47 })
    const day1 = result.data[0]

    expect(day1.date).toBe('2026-06-29')
    expect(day1.airTemp).toBe(23.5)
    expect(day1.minTemp).toBe(22)
    expect(day1.maxTemp).toBe(25)
    expect(day1.weatherCondition).toBe('多云')
    expect(day1.pressureHpa).toBe(1011)
  })

  test('有降雨预报时 hasRainForecast 为 true', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await handler.main({ lat: 31.23, lon: 121.47 })
    const day2 = result.data.find(d => d.date === '2026-06-30')
    expect(day2.hasRainForecast).toBe(true)
  })

  test('API 返回非 200 状态码', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401
    })

    const result = await handler.main({ lat: 31.23, lon: 121.47 })
    expect(result.code).toBe(-3)
  })

  test('网络请求失败', async () => {
    mockFetch.mockRejectedValue(new Error('Request timeout'))

    const result = await handler.main({ lat: 31.23, lon: 121.47 })
    expect(result.code).toBe(-4)
    expect(result.message).toContain('timeout')
  })

  test('返回最多 5 天预报', async () => {
    const manyDays = {
      list: Array.from({ length: 40 }, (_, i) => ({
        dt_txt: `2026-0${7 + Math.floor(i / 8)}-${1 + (i % 8)} 12:00:00`,
        main: { temp: 20, pressure: 1010 },
        wind: { speed: 3 },
        weather: [{ description: '晴' }],
        pop: 0
      }))
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(manyDays)
    })

    const result = await handler.main({ lat: 31.23, lon: 121.47 })
    expect(result.data.length).toBeLessThanOrEqual(5)
  })
})
