Page({
  data: {
    weightUnit: 'jin'
  },

  onLoad() {
    this.loadSettings()
  },

  async loadSettings() {
    try {
      const db = wx.cloud.database()
      const res = await db.collection('settings')
        .where({ key: 'weightUnit' })
        .get()
      if (res.data.length > 0) {
        this.setData({ weightUnit: res.data[0].value })
      }
    } catch (e) {
      console.log('使用默认设置')
    }
  },

  async onUnitChange(e) {
    const unit = e.detail.value
    this.setData({ weightUnit: unit })

    try {
      const db = wx.cloud.database()
      await db.collection('settings').where({ key: 'weightUnit' }).update({
        data: { value: unit }
      })
    } catch (e) {
      // 如果记录不存在则创建
      try {
        const db = wx.cloud.database()
        await db.collection('settings').add({
          data: { key: 'weightUnit', value: unit }
        })
      } catch (e2) {
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    }

    wx.showToast({ title: '设置已保存', icon: 'success' })
  }
})
