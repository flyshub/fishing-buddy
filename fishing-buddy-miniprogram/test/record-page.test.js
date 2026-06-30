/**
 * #0014 记录行程页面逻辑测试
 * 验证表单校验、数据转换、空军记录
 */

function validateForm(data) {
  const errors = []

  if (!data.date) errors.push('请选择日期')
  if (!data.time) errors.push('请选择时间')

  const validSpecies = data.species.filter(
    s => s.name.trim() !== '' && parseInt(s.count) > 0
  )

  if (validSpecies.length === 0) {
    errors.push('请至少添加一种渔获')
  }

  return { valid: errors.length === 0, errors, validSpecies }
}

function buildTripDocument(data, validSpecies, weatherData) {
  return {
    startTime: `${data.date}T${data.time}:00`,
    spot: {
      name: data.spotName || '未命名渔场',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0
    },
    positionName: data.positionName || null,
    bait: data.bait || null,
    gearType: data.gearType || null,
    maxLengthCm: data.maxLength ? parseFloat(data.maxLength) : null,
    totalWeightKg: data.weight ? parseFloat(data.weight) : 0,
    notes: data.notes || null,
    species: validSpecies.map(s => ({
      name: s.name.trim(),
      count: parseInt(s.count)
    })),
    weather: weatherData || null,
    createdAt: new Date().toISOString()
  }
}

function getTotalCount(species) {
  return species.reduce((sum, s) => sum + s.count, 0)
}

describe('记录行程页面', () => {
  describe('表单校验', () => {
    test('完整表单通过校验', () => {
      const result = validateForm({
        date: '2026-06-29',
        time: '08:00',
        species: [{ name: '鲫鱼', count: '5' }]
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('缺少日期失败', () => {
      const result = validateForm({
        date: '',
        time: '08:00',
        species: [{ name: '鲫鱼', count: '5' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('请选择日期')
    })

    test('缺少时间失败', () => {
      const result = validateForm({
        date: '2026-06-29',
        time: '',
        species: [{ name: '鲫鱼', count: '5' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('请选择时间')
    })

    test('没有有效鱼种失败', () => {
      const result = validateForm({
        date: '2026-06-29',
        time: '08:00',
        species: [{ name: '', count: '' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('请至少添加一种渔获')
    })

    test('鱼种数量为0失败', () => {
      const result = validateForm({
        date: '2026-06-29',
        time: '08:00',
        species: [{ name: '鲫鱼', count: '0' }]
      })
      expect(result.valid).toBe(false)
    })

    test('多种鱼种通过校验', () => {
      const result = validateForm({
        date: '2026-06-29',
        time: '08:00',
        species: [
          { name: '鲫鱼', count: '5' },
          { name: '鲤鱼', count: '2' }
        ]
      })
      expect(result.valid).toBe(true)
      expect(result.validSpecies).toHaveLength(2)
    })

    test('混合有效和无效鱼种只保留有效的', () => {
      const result = validateForm({
        date: '2026-06-29',
        time: '08:00',
        species: [
          { name: '鲫鱼', count: '5' },
          { name: '', count: '' },
          { name: '鲤鱼', count: '2' }
        ]
      })
      expect(result.valid).toBe(true)
      expect(result.validSpecies).toHaveLength(2)
    })
  })

  describe('空军记录', () => {
    test('空军时 species 为空数组', () => {
      const doc = buildTripDocument(
        {
          date: '2026-06-29',
          time: '08:00',
          spotName: '青鱼湖',
          species: []
        },
        [],
        null
      )
      expect(doc.species).toEqual([])
    })

    test('空军行程 totalCount 为 0', () => {
      expect(getTotalCount([])).toBe(0)
    })
  })

  describe('文档构建', () => {
    test('生成正确的嵌套文档结构', () => {
      const doc = buildTripDocument(
        {
          date: '2026-06-29',
          time: '08:00',
          spotName: '青鱼湖',
          positionName: '东岸浅滩',
          bait: '蚯蚓',
          gearType: '手竿',
          maxLength: '35',
          weight: '2.3',
          notes: '今天气压不错',
          species: []
        },
        [{ name: '鲫鱼', count: 5 }, { name: '鲤鱼', count: 2 }],
        { airTemp: 22, pressureHpa: 1012, windSpeedMps: 3, weatherCondition: '多云' }
      )

      expect(doc.startTime).toBe('2026-06-29T08:00:00')
      expect(doc.spot.name).toBe('青鱼湖')
      expect(doc.positionName).toBe('东岸浅滩')
      expect(doc.bait).toBe('蚯蚓')
      expect(doc.gearType).toBe('手竿')
      expect(doc.maxLengthCm).toBe(35)
      expect(doc.totalWeightKg).toBe(2.3)
      expect(doc.notes).toBe('今天气压不错')
      expect(doc.species).toEqual([
        { name: '鲫鱼', count: 5 },
        { name: '鲤鱼', count: 2 }
      ])
      expect(doc.weather).toEqual({
        airTemp: 22,
        pressureHpa: 1012,
        windSpeedMps: 3,
        weatherCondition: '多云'
      })
    })

    test('可选字段为 null', () => {
      const doc = buildTripDocument(
        {
          date: '2026-06-29',
          time: '08:00',
          species: []
        },
        [],
        null
      )

      expect(doc.positionName).toBeNull()
      expect(doc.bait).toBeNull()
      expect(doc.gearType).toBeNull()
      expect(doc.maxLengthCm).toBeNull()
      expect(doc.notes).toBeNull()
      expect(doc.weather).toBeNull()
    })

    test('默认重量为 0', () => {
      const doc = buildTripDocument(
        { date: '2026-06-29', time: '08:00', species: [] },
        [],
        null
      )
      expect(doc.totalWeightKg).toBe(0)
    })
  })

  describe('渔获统计', () => {
    test('计算总数量', () => {
      expect(getTotalCount([
        { name: '鲫鱼', count: 5 },
        { name: '鲤鱼', count: 2 }
      ])).toBe(7)
    })

    test('空列表总数量为 0', () => {
      expect(getTotalCount([])).toBe(0)
    })
  })
})
