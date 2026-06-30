/**
 * #0019 单位切换 + 设置逻辑测试
 * 验证斤/kg 转换和设置管理
 */

function kgToJin(kg) {
  return Math.round(kg * 2 * 10) / 10
}

function formatWeight(kg, unit) {
  if (unit === 'jin') {
    return `${kgToJin(kg)} 斤`
  }
  return `${kg} kg`
}

function getDefaultUnit() {
  return 'jin'
}

function validateUnit(unit) {
  return unit === 'jin' || unit === 'kg'
}

describe('单位转换', () => {
  describe('kg 转斤', () => {
    test('1kg = 2斤', () => {
      expect(kgToJin(1)).toBe(2)
    })

    test('0.5kg = 1斤', () => {
      expect(kgToJin(0.5)).toBe(1)
    })

    test('2.3kg = 4.6斤', () => {
      expect(kgToJin(2.3)).toBe(4.6)
    })

    test('0kg = 0斤', () => {
      expect(kgToJin(0)).toBe(0)
    })

    test('四舍五入到一位小数', () => {
      expect(kgToJin(1.234)).toBe(2.5)
    })
  })

  describe('重量格式化', () => {
    test('斤单位显示', () => {
      expect(formatWeight(2.3, 'jin')).toBe('4.6 斤')
    })

    test('kg单位显示', () => {
      expect(formatWeight(2.3, 'kg')).toBe('2.3 kg')
    })

    test('默认斤单位', () => {
      expect(formatWeight(1, getDefaultUnit())).toBe('2 斤')
    })
  })

  describe('单位验证', () => {
    test('jin 是有效单位', () => {
      expect(validateUnit('jin')).toBe(true)
    })

    test('kg 是有效单位', () => {
      expect(validateUnit('kg')).toBe(true)
    })

    test('其他值无效', () => {
      expect(validateUnit('g')).toBe(false)
      expect(validateUnit('')).toBe(false)
    })
  })
})

describe('设置管理', () => {
  test('默认单位为斤', () => {
    expect(getDefaultUnit()).toBe('jin')
  })
})
