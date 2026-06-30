const { SPECIES_LIST } = require('../../utils/species-data')
const { BAIT_LIST } = require('../../utils/bait-data')
const { formatDate: fmtDate, formatTime: fmtTime } = require('../../utils/date-utils')

Page({
  data: {
    date: '',
    time: '',
    spotName: '',
    positionName: '',
    gearType: '',
    maxLength: '',
    species: [{ name: '', count: '' }],
    bait: '',
    weight: '',
    notes: '',
    submitting: false,
    speciesList: SPECIES_LIST,
    baitList: BAIT_LIST,
    showSpeciesPicker: false,
    showBaitPicker: false,
    pickingIndex: 0
  },

  onLoad() {
    const now = new Date()
    this.setData({
      date: fmtDate(now),
      time: fmtTime(now)
    })
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value })
  },

  onTimeChange(e) {
    this.setData({ time: e.detail.value })
  },

  onSpotInput(e) {
    this.setData({ spotName: e.detail.value })
  },

  onPositionInput(e) {
    this.setData({ positionName: e.detail.value })
  },

  onGearInput(e) {
    this.setData({ gearType: e.detail.value })
  },

  onMaxLengthInput(e) {
    this.setData({ maxLength: e.detail.value })
  },

  onBaitInput(e) {
    this.setData({ bait: e.detail.value })
  },

  onWeightInput(e) {
    this.setData({ weight: e.detail.value })
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },

  onSpeciesNameInput(e) {
    const idx = e.currentTarget.dataset.index
    const species = [...this.data.species]
    species[idx].name = e.detail.value
    this.setData({ species })
  },

  onSpeciesCountInput(e) {
    const idx = e.currentTarget.dataset.index
    const species = [...this.data.species]
    species[idx].count = e.detail.value
    this.setData({ species })
  },

  openSpeciesPicker(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({ showSpeciesPicker: true, pickingIndex: idx })
  },

  onSpeciesSelected(e) {
    const name = e.detail.value
    const idx = this.data.pickingIndex
    const species = [...this.data.species]
    species[idx].name = name
    this.setData({ species, showSpeciesPicker: false })
  },

  closeSpeciesPicker() {
    this.setData({ showSpeciesPicker: false })
  },

  openBaitPicker() {
    this.setData({ showBaitPicker: true })
  },

  onBaitSelected(e) {
    const bait = e.detail.value
    this.setData({ bait, showBaitPicker: false })
  },

  closeBaitPicker() {
    this.setData({ showBaitPicker: false })
  },

  addSpecies() {
    const species = [...this.data.species, { name: '', count: '' }]
    this.setData({ species })
  },

  removeSpecies(e) {
    const idx = e.currentTarget.dataset.index
    if (this.data.species.length <= 1) return
    const species = this.data.species.filter((_, i) => i !== idx)
    this.setData({ species })
  },

  async submit() {
    const { date, time, species } = this.data

    if (!date || !time) {
      wx.showToast({ title: '请选择日期和时间', icon: 'none' })
      return
    }

    const validSpecies = species.filter(
      s => s.name.trim() !== '' && parseInt(s.count) > 0
    )

    if (validSpecies.length === 0) {
      wx.showToast({ title: '请至少添加一种渔获', icon: 'none' })
      return
    }

    this.setData({ submitting: true })

    try {
      const db = wx.cloud.database()

      // 获取 GPS 坐标
      let latitude = 0
      let longitude = 0
      try {
        const locRes = await new Promise((resolve, reject) => {
          wx.getLocation({ type: 'gcj02', success: resolve, fail: reject })
        })
        latitude = locRes.latitude
        longitude = locRes.longitude
      } catch (e) {
        console.warn('定位失败:', e)
      }

      const tripDoc = {
        startTime: `${date}T${time}:00+08:00`,
        spot: {
          name: this.data.spotName || '未命名渔场',
          latitude,
          longitude
        },
        positionName: this.data.positionName || null,
        bait: this.data.bait || null,
        gearType: this.data.gearType || null,
        maxLengthCm: this.data.maxLength ? parseFloat(this.data.maxLength) : null,
        totalWeightKg: this.data.weight ? parseFloat(this.data.weight) : 0,
        notes: this.data.notes || null,
        species: validSpecies.map(s => ({
          name: s.name.trim(),
          count: parseInt(s.count)
        })),
        weather: null,
        createdAt: new Date().toISOString()
      }

      await db.collection('trips').add({ data: tripDoc })

      wx.showToast({ title: '记录成功！', icon: 'success' })

      // 重置表单
      const now = new Date()
      this.setData({
        spotName: '',
        positionName: '',
        gearType: '',
        maxLength: '',
        species: [{ name: '', count: '' }],
        bait: '',
        weight: '',
        notes: '',
        date: fmtDate(now),
        time: fmtTime(now),
        submitting: false
      })
    } catch (e) {
      console.error('保存失败:', e)
      wx.showToast({ title: '保存失败: ' + e.message, icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})
