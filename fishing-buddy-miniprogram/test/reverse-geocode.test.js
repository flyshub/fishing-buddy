/**
 * #0016 反向地理编码云函数测试
 */

const mockFetch = jest.fn()
jest.mock('node-fetch', () => mockFetch)
jest.mock('wx-server-sdk', () => ({
  cloud: {
    init: jest.fn(),
    DYNAMIC_CURRENT_ENV: 'test'
  }
}))

const mockGeoResponse = {
  status: 0,
  result: {
    address: '上海市黄浦区南京东路',
    formatted_addresses: {
      recommend: '上海市黄浦区南京东路步行街'
    },
    address_component: {
      district: '黄浦区',
      street: '南京东路'
    }
  }
}

describe('reverse-geocode 云函数', () => {
  let handler

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.TENCENT_MAP_KEY = 'test-key'
    handler = require('../cloudfunctions/reverse-geocode/index')
  })

  test('缺少经纬度参数返回错误', async () => {
    const result = await handler.main({})
    expect(result.code).toBe(-1)
  })

  test('成功反向编码', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGeoResponse)
    })

    const result = await handler.main({ lat: 31.23, lon: 121.47 })
    expect(result.code).toBe(0)
    expect(result.data.address).toBe('上海市黄浦区南京东路')
    expect(result.data.recommend).toBe('上海市黄浦区南京东路步行街')
    expect(result.data.district).toBe('黄浦区')
  })

  test('API 返回失败状态', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 100, message: '参数错误' })
    })

    const result = await handler.main({ lat: 31.23, lon: 121.47 })
    expect(result.code).toBe(-4)
  })

  test('网络请求失败', async () => {
    mockFetch.mockRejectedValue(new Error('timeout'))

    const result = await handler.main({ lat: 31.23, lon: 121.47 })
    expect(result.code).toBe(-5)
  })
})
