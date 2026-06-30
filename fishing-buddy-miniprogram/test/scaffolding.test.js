/**
 * #0011 项目脚手架验证测试
 * 验证项目结构、配置文件、页面声明正确
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const MINI = path.join(ROOT, 'miniprogram')
const CLOUD = path.join(ROOT, 'cloudfunctions')

function exists(p) {
  return fs.existsSync(path.join(ROOT, p))
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf-8'))
}

describe('项目脚手架', () => {
  describe('目录结构', () => {
    test('miniprogram 目录存在', () => {
      expect(exists('miniprogram')).toBe(true)
    })

    test('cloudfunctions 目录存在', () => {
      expect(exists('cloudfunctions')).toBe(true)
    })

    test('4 个页面目录存在', () => {
      const pages = ['home', 'record', 'history', 'detail']
      pages.forEach(p => {
        expect(exists(`miniprogram/pages/${p}`)).toBe(true)
      })
    })

    test('5 个组件目录存在', () => {
      const components = [
        'fishing-index', 'forecast-card', 'trip-card',
        'species-picker', 'bait-picker'
      ]
      components.forEach(c => {
        expect(exists(`miniprogram/components/${c}`)).toBe(true)
      })
    })

    test('utils 目录存在', () => {
      expect(exists('miniprogram/utils')).toBe(true)
    })

    test('2 个云函数目录存在', () => {
      expect(exists('cloudfunctions/weather-proxy')).toBe(true)
      expect(exists('cloudfunctions/reverse-geocode')).toBe(true)
    })
  })

  describe('配置文件', () => {
    test('project.config.json 存在且有效', () => {
      const config = readJson('project.config.json')
      expect(config.miniprogramRoot).toBe('miniprogram/')
      expect(config.cloudfunctionRoot).toBe('cloudfunctions/')
      expect(config.projectname).toBe('fishing-buddy')
    })

    test('app.json 存在且配置正确', () => {
      const app = readJson('miniprogram/app.json')
      expect(app.pages).toContain('pages/home/home')
      expect(app.pages).toContain('pages/record/record')
      expect(app.pages).toContain('pages/history/history')
      expect(app.pages).toContain('pages/detail/detail')
      expect(app.cloud).toBe(true)
    })

    test('app.json TabBar 配置 3 个 tab', () => {
      const app = readJson('miniprogram/app.json')
      expect(app.tabBar.list).toHaveLength(3)
      expect(app.tabBar.list[0].pagePath).toBe('pages/home/home')
      expect(app.tabBar.list[1].pagePath).toBe('pages/record/record')
      expect(app.tabBar.list[2].pagePath).toBe('pages/history/history')
    })

    test('app.json TabBar 颜色配置正确', () => {
      const app = readJson('miniprogram/app.json')
      expect(app.tabBar.selectedColor).toBe('#2196F3')
    })
  })

  describe('云开发初始化', () => {
    test('app.js 包含 wx.cloud.init 调用', () => {
      const appJs = fs.readFileSync(
        path.join(MINI, 'app.js'), 'utf-8'
      )
      expect(appJs).toContain('wx.cloud.init')
    })
  })

  describe('页面文件完整性', () => {
    const pages = ['home', 'record', 'history', 'detail']

    pages.forEach(page => {
      describe(`${page} 页面`, () => {
        test(`${page}.js 存在`, () => {
          expect(exists(`miniprogram/pages/${page}/${page}.js`)).toBe(true)
        })

        test(`${page}.json 存在`, () => {
          expect(exists(`miniprogram/pages/${page}/${page}.json`)).toBe(true)
        })

        test(`${page}.wxml 存在`, () => {
          expect(exists(`miniprogram/pages/${page}/${page}.wxml`)).toBe(true)
        })

        test(`${page}.wxss 存在`, () => {
          expect(exists(`miniprogram/pages/${page}/${page}.wxss`)).toBe(true)
        })
      })
    })
  })

  describe('utils 文件', () => {
    test('fishing-index.js 存在', () => {
      expect(exists('miniprogram/utils/fishing-index.js')).toBe(true)
    })

    test('haversine.js 存在', () => {
      expect(exists('miniprogram/utils/haversine.js')).toBe(true)
    })

    test('species-data.js 存在', () => {
      expect(exists('miniprogram/utils/species-data.js')).toBe(true)
    })

    test('bait-data.js 存在', () => {
      expect(exists('miniprogram/utils/bait-data.js')).toBe(true)
    })

    test('date-utils.js 存在', () => {
      expect(exists('miniprogram/utils/date-utils.js')).toBe(true)
    })
  })
})
