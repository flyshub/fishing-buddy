const cloud = require('wx-server-sdk')
const fetch = require('node-fetch')

const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast'

exports.main = async (event) => {
  const { lat, lon } = event
  const apiKey = process.env.OPENWEATHERMAP_API_KEY

  if (!lat || !lon) {
    return { code: -1, message: '缺少经纬度参数' }
  }

  if (!apiKey) {
    return { code: -2, message: '天气 API Key 未配置' }
  }

  try {
    const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=zh_cn`
    const response = await fetch(url, { timeout: 10000 })

    if (!response.ok) {
      return { code: -3, message: `API 返回 HTTP ${response.status}` }
    }

    const data = await response.json()
    const forecasts = parseForecasts(data)

    return { code: 0, data: forecasts }
  } catch (e) {
    return { code: -4, message: `天气数据获取失败: ${e.message}` }
  }
}

function parseForecasts(data) {
  if (!data.list) return []

  const dailyMap = {}

  for (const item of data.list) {
    const date = item.dt_txt.split(' ')[0]
    if (!dailyMap[date]) {
      dailyMap[date] = {
        temps: [],
        winds: [],
        conditions: [],
        pops: [],
        pressures: []
      }
    }
    dailyMap[date].temps.push(item.main.temp)
    dailyMap[date].winds.push(item.wind.speed)
    dailyMap[date].conditions.push(item.weather[0].description)
    dailyMap[date].pops.push((item.pop || 0) * 100)
    dailyMap[date].pressures.push(item.main.pressure)
  }

  const result = []
  for (const [date, d] of Object.entries(dailyMap)) {
    const tempMax = Math.max(...d.temps)
    const tempMin = Math.min(...d.temps)
    const avgPressure = d.pressures.reduce((a, b) => a + b, 0) / d.pressures.length
    const maxWind = Math.max(...d.winds)
    const maxPop = Math.max(...d.pops)
    const mainCondition = mode(d.conditions)

    result.push({
      date,
      airTemp: Math.round((tempMax + tempMin) / 2 * 10) / 10,
      minTemp: Math.round(tempMin * 10) / 10,
      maxTemp: Math.round(tempMax * 10) / 10,
      pressureHpa: Math.round(avgPressure),
      windSpeedMps: Math.round(maxWind * 10) / 10,
      weatherCondition: mainCondition,
      hasRainForecast: maxPop > 20
    })
  }

  return result.slice(0, 5)
}

function mode(arr) {
  if (!arr || arr.length === 0) return '未知'
  const freq = {}
  for (const item of arr) {
    freq[item] = (freq[item] || 0) + 1
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
}
