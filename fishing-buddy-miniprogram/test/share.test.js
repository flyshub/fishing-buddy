/**
 * #0018 社交分享逻辑测试
 * 验证分享标题和路径生成
 */

function generateShareTitle(todayIndex) {
  if (!todayIndex || todayIndex.totalScore <= 0) {
    return '渔游记 - 钓鱼指数助手'
  }
  const score = Math.round(todayIndex.totalScore)
  const rec = todayIndex.recommendation || '渔游记'
  return `今天钓鱼指数 ${score}，${rec}`
}

function generateSharePath() {
  return '/pages/home/home'
}

describe('社交分享', () => {
  describe('分享标题', () => {
    test('有指数数据时生成动态标题', () => {
      const title = generateShareTitle({
        totalScore: 85,
        recommendation: '强烈建议出行'
      })
      expect(title).toBe('今天钓鱼指数 85，强烈建议出行')
    })

    test('建议出行等级', () => {
      const title = generateShareTitle({
        totalScore: 65,
        recommendation: '建议出行'
      })
      expect(title).toBe('今天钓鱼指数 65，建议出行')
    })

    test('可以尝试等级', () => {
      const title = generateShareTitle({
        totalScore: 45,
        recommendation: '可以尝试'
      })
      expect(title).toBe('今天钓鱼指数 45，可以尝试')
    })

    test('不建议出行等级', () => {
      const title = generateShareTitle({
        totalScore: 30,
        recommendation: '不建议出行'
      })
      expect(title).toBe('今天钓鱼指数 30，不建议出行')
    })

    test('无指数数据时使用默认标题', () => {
      const title = generateShareTitle(null)
      expect(title).toBe('渔游记 - 钓鱼指数助手')
    })

    test('指数为0时使用默认标题', () => {
      const title = generateShareTitle({ totalScore: 0, recommendation: '' })
      expect(title).toBe('渔游记 - 钓鱼指数助手')
    })
  })

  describe('分享路径', () => {
    test('路径指向首页', () => {
      const path = generateSharePath()
      expect(path).toBe('/pages/home/home')
    })
  })
})
