const cloud = require('wx-server-sdk')
const fetch = require('node-fetch')

const BASE_URL = 'https://apis.map.qq.com/ws/geocoder/v1'

exports.main = async (event) => {
  const { lat, lon } = event
  const apiKey = process.env.TENCENT_MAP_KEY

  if (!lat || !lon) {
    return { code: -1, message: '缺少经纬度参数' }
  }

  if (!apiKey) {
    return { code: -2, message: '地图 API Key 未配置' }
  }

  try {
    const url = `${BASE_URL}/location=${lat},${lon}&key=${apiKey}`
    const response = await fetch(url, { timeout: 10000 })

    if (!response.ok) {
      return { code: -3, message: `API 返回 HTTP ${response.status}` }
    }

    const data = await response.json()

    if (data.status !== 0) {
      return { code: -4, message: data.message || '反向编码失败' }
    }

    const result = data.result || {}
    const address = result.address || ''
    const formattedAddresses = result.formatted_addresses || {}
    const recommend = formattedAddresses.recommend || address

    // 提取简洁地名
    const addrComponent = result.address_component || {}
    const district = addrComponent.district || ''
    const street = addrComponent.street || ''
    const shortName = recommend || `${district}${street}`

    return {
      code: 0,
      data: {
        address,
        recommend,
        shortName,
        district,
        street
      }
    }
  } catch (e) {
    return { code: -5, message: `反向编码失败: ${e.message}` }
  }
}
