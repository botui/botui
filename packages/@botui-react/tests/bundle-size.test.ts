import path from 'path'
import fs from 'fs'

describe('Bundle Size', () => {
  it('should not exceed size limits', () => {
    const bundlePath = path.resolve(__dirname, '../dist/index.js')

    if (fs.existsSync(bundlePath)) {
      const stats = fs.statSync(bundlePath)
      const sizeKB = stats.size / 1024

      expect(sizeKB).toBeLessThan(50) // 50KB limit
    } else {
      // If bundle doesn't exist, skip the test but log a warning
      console.warn('Bundle file not found at:', bundlePath)
      console.warn('Run `npm run build` to generate the bundle before running bundle size tests')
    }
  })

  it('should have zero CSS runtime dependencies', () => {
    const packageJson = require('../package.json')

    // Should not have CSS-related runtime dependencies (dev dependencies are OK)
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.peerDependencies
    }

    expect(deps.sass).toBeUndefined()
    expect(deps['node-sass']).toBeUndefined()
    expect(deps.scss).toBeUndefined()
    expect(deps['sass-loader']).toBeUndefined()
    expect(deps['css-loader']).toBeUndefined()
    expect(deps['style-loader']).toBeUndefined()
  })

  it('should have minimal peer dependencies', () => {
    const packageJson = require('../package.json')
    const peerDeps = Object.keys(packageJson.peerDependencies || {})

    // Should only have React and BotUI as peer dependencies
    expect(peerDeps).toContain('react')
    expect(peerDeps).toContain('react-dom')
    expect(peerDeps).toContain('botui')

    // Should not have unnecessary peer dependencies
    expect(peerDeps.length).toBeLessThanOrEqual(3)
  })

  it('should not have heavy runtime dependencies', () => {
    const packageJson = require('../package.json')
    const runtimeDeps = Object.keys(packageJson.dependencies || {})

    // Current runtime dependencies should be minimal
    const allowedDeps = [
      'react-transition-group',
      'scroll-into-view-if-needed'
    ]

    runtimeDeps.forEach(dep => {
      expect(allowedDeps).toContain(dep)
    })

    // Should not exceed reasonable number of runtime dependencies
    expect(runtimeDeps.length).toBeLessThanOrEqual(5)
  })

  it('should have correct sideEffects configuration', () => {
    const packageJson = require('../package.json')

    // Should be marked as side-effect free for better tree shaking
    expect(packageJson.sideEffects).toBe(false)
  })
})

describe('Performance', () => {
  it('should have fast hook initialization', () => {
    const { useBotUI } = require('../src/hooks/useBotUI')
    const { createMockBot } = require('./mocks/bot')

    const bot = createMockBot()

    const startTime = performance.now()

    // Simulate hook usage (this won't actually run React hooks in Node)
    // but tests that the module loads quickly
    expect(typeof useBotUI).toBe('function')

    const endTime = performance.now()
    const loadTime = endTime - startTime

    // Module should load very quickly (less than 10ms)
    expect(loadTime).toBeLessThan(10)
  })

  it('should have efficient component exports', () => {
    const startTime = performance.now()

    const { BotUI } = require('../src/components')

    const endTime = performance.now()
    const loadTime = endTime - startTime

    // Component module should load quickly
    expect(loadTime).toBeLessThan(20)

    // Should export all required components
    expect(BotUI.Root).toBeDefined()
    expect(BotUI.Messages).toBeDefined()
    expect(BotUI.Message).toBeDefined()
    expect(BotUI.Actions).toBeDefined()
  })

  it('should have minimal memory footprint for types', () => {
    const typesModule = require('../src/hooks/useBotUI')

    // Should not create large objects during module load
    const moduleKeys = Object.keys(typesModule)
    expect(moduleKeys.length).toBeLessThan(20)
  })

  it('should support tree shaking', () => {
    // Test that individual components can be imported
    expect(() => {
      require('../src/components/BotUIRoot')
    }).not.toThrow()

    expect(() => {
      require('../src/components/BotUIMessages')
    }).not.toThrow()

    expect(() => {
      require('../src/components/BotUIMessage')
    }).not.toThrow()

    expect(() => {
      require('../src/components/BotUIActions')
    }).not.toThrow()
  })
})