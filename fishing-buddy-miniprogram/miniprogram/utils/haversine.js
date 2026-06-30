/**
 * Haversine 公式计算两点间距离（米）
 * TODO: #0016 从 Flutter haversine.dart 移植
 */

function distanceMeters(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371000 // 米
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.asin(Math.sqrt(a))
  return earthRadius * c
}

function toRadians(degrees) {
  return degrees * Math.PI / 180
}

module.exports = { distanceMeters }
