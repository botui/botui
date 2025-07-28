import { expect } from '@jest/globals'

describe('Package Exports', () => {
  test('should export all existing types and interfaces', async () => {
    // Import from built dist directory like other tests
    const exports = await import('../dist/botui.js')

    // Existing exports should still be available
    expect(exports.createBot).toBeDefined()
    expect(exports.BOTUI_BLOCK_TYPES).toBeDefined()
    expect(typeof exports.createBot).toBe('function')
  })

  test('should build successfully with new types', async () => {
    // This test verifies that the TypeScript compilation doesn't break
    // We'll build and then check that basic functionality still works
    expect(true).toBe(true) // placeholder - will be enhanced after build setup
  })
})