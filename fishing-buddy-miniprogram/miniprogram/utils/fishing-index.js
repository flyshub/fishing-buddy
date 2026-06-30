/**
 * 钓鱼指数算法
 * 8 因子评分，每因子 0-20 分，总分 0-100
 * 从 Flutter calculator.dart 1:1 移植
 */

const DAYS_BEFORE_MONTH = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]

class FishingIndexCalculator {
  calculate(forecast) {
    const pressureScore = this._scorePressure(forecast.pressureHpa)
    const windScore = this._scoreWind(forecast.windSpeedMps)
    const tempScore = this._scoreTemperature(forecast.airTemp)
    const weatherScore = this._scoreWeather(forecast.weatherCondition)
    const moonScore = this._scoreMoonPhase(forecast.date)
    const solarTermScore = this._scoreSolarTerm(forecast.date)
    const delta = forecast.maxTemp - forecast.minTemp
    const deltaScore = this._scoreDayNightDelta(delta)
    const oxygenScore = this._scoreDissolvedOxygen(forecast)

    const factorScores = [
      { name: '气压', score: pressureScore },
      { name: '风力', score: windScore },
      { name: '温度', score: tempScore },
      { name: '天气', score: weatherScore },
      { name: '月相', score: moonScore },
      { name: '节气', score: solarTermScore },
      { name: '昼夜温差', score: deltaScore },
      { name: '溶氧量', score: oxygenScore }
    ]

    let totalScore = factorScores.reduce((sum, f) => sum + f.score, 0)
    totalScore = Math.max(0, Math.min(100, totalScore))
    totalScore = Math.round(totalScore * 100) / 100

    const recommendation = this._mapRecommendation(totalScore)

    return { totalScore, factorScores, recommendation }
  }

  _scorePressure(hpa) {
    const optimalMin = 1005
    const optimalMax = 1020
    if (hpa >= optimalMin && hpa <= optimalMax) return 20
    if (hpa < 950) return 0
    if (hpa > 1080) return 0
    if (hpa < optimalMin) {
      return 20 * (hpa - 950) / (optimalMin - 950)
    }
    return 20 * (1080 - hpa) / (1080 - optimalMax)
  }

  _scoreWind(mps) {
    if (mps <= 0) return 0
    if (mps >= 10) return 0
    if (mps >= 1 && mps <= 5) return 20
    if (mps < 1) {
      return 20 * mps / 1
    }
    return 20 * (10 - mps) / (10 - 5)
  }

  _scoreTemperature(temp) {
    if (temp >= 15 && temp <= 25) return 20
    if (temp <= -5) return 0
    if (temp >= 35) return 0
    if (temp < 15) {
      return 20 * (temp - (-5)) / (15 - (-5))
    }
    return 20 * (35 - temp) / (35 - 25)
  }

  _scoreWeather(condition) {
    switch (condition) {
      case '阴':
      case '多云':
        return 20
      case '晴':
        return 15
      case '小雨':
        return 12
      case '中雨':
        return 8
      case '大雨':
      case '暴雨':
      case '雪':
        return 5
      case '雷阵雨':
        return 3
      default:
        return 10
    }
  }

  _scoreMoonPhase(date) {
    const dayOfMonth = this._lunarDayOfMonth(date)
    const distanceToNew = dayOfMonth >= 14.77
      ? 29.53 - dayOfMonth
      : dayOfMonth
    const distanceToFull = dayOfMonth <= 14.77
      ? 14.77 - dayOfMonth
      : dayOfMonth - 14.77
    const minDistance = Math.min(distanceToNew, distanceToFull)
    if (minDistance <= 3) return 20
    return 20 * (1 - minDistance / 7.38)
  }

  _lunarDayOfMonth(date) {
    const dayOfYear = date.getDate() + DAYS_BEFORE_MONTH[date.getMonth()]
    return ((dayOfYear % 29.53) + 29.53) % 29.53
  }

  _scoreSolarTerm(date) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const inSpring = (month === 3 && day >= 21) || month === 4 || month === 5 || (month === 6 && day <= 21)
    const inAutumn = (month === 9 && day >= 23) || month === 10 || month === 11 || (month === 12 && day <= 21)
    if (inSpring || inAutumn) return 20
    return 10
  }

  _scoreDayNightDelta(delta) {
    if (delta <= 10) return 20
    if (delta >= 20) return 0
    return 20 * (20 - delta) / (20 - 10)
  }

  _scoreDissolvedOxygen(forecast) {
    return forecast.hasRainForecast ? 20 : 10
  }

  _mapRecommendation(score) {
    if (score >= 80) return 'stronglyRecommended'
    if (score >= 60) return 'recommended'
    if (score >= 40) return 'moderate'
    return 'notRecommended'
  }
}

module.exports = { FishingIndexCalculator }
