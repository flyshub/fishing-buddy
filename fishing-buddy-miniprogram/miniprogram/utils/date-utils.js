/**
 * 日期工具函数
 */

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`
}

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${min}`
}

function getTimeSlot(hour) {
  if (hour < 5) return '凌晨'
  if (hour < 8) return '早晨'
  if (hour < 12) return '上午'
  if (hour < 17) return '下午'
  if (hour < 21) return '傍晚'
  return '深夜'
}

function isNoCatch(trip) {
  return !trip.species || trip.species.length === 0
}

function getTotalCount(trip) {
  if (!trip.species) return 0
  return trip.species.reduce((sum, s) => sum + (s.count || 0), 0)
}

module.exports = {
  formatDate,
  formatDateTime,
  formatTime,
  getTimeSlot,
  isNoCatch,
  getTotalCount
}
