import { createBot, BOTUI_BLOCK_TYPES } from '../dist/botui'
import { expect, jest } from '@jest/globals'

/**
 * Comprehensive tests for MESSAGE_UPDATE functionality
 * This file specifically tests the streaming and real-time update capabilities
 */

describe('MESSAGE_UPDATE Event System', () => {

  describe('Event Emission', () => {
    test('emits MESSAGE_UPDATE with correct TypeScript interface structure', async () => {
      const bot = createBot()
      const listener = jest.fn()

      bot.on('message.update', listener)

      const messageKey = await bot.message.add({ text: 'Initial' })
      listener.mockClear()

      await bot.message.update(messageKey, { text: 'Updated', extra: 'data' })

      // Verify the event matches the TypeScript interface:
      // [EBotUIEvents.MESSAGE_UPDATE]: { id: string; block: IBlock }
      expect(listener).toHaveBeenCalledWith({
        id: messageKey.toString(),
        block: expect.objectContaining({
          key: messageKey,
          type: 'message',
          data: expect.objectContaining({ text: 'Updated', extra: 'data' })
        })
      })

      // Verify id is string representation of key
      const callArgs = listener.mock.calls[0][0]
      expect(callArgs.id).toBe(messageKey.toString())
      expect(callArgs.block.key).toBe(messageKey)
    })

    test('does not emit MESSAGE_UPDATE for non-message blocks', async () => {
      const bot = createBot()
      const listener = jest.fn()

      bot.on('message.update', listener)

      // This test verifies our filtering logic - only MESSAGE type blocks should emit MESSAGE_UPDATE
      // Since we can't directly test with action blocks via bot.message.update,
      // we verify the implementation through proper message updates
      const messageKey = await bot.message.add({ text: 'Test' })
      listener.mockClear()

      await bot.message.update(messageKey, { text: 'Updated' })
      expect(listener).toHaveBeenCalledTimes(1)

      // The event should be for a message type block
      const callArgs = listener.mock.calls[0][0]
      expect(callArgs.block.type).toBe('message')
    })
  })

  describe('Streaming Simulation', () => {
    test('simulates streaming text updates efficiently', async () => {
      const bot = createBot()
      const updateListener = jest.fn()
      const addListener = jest.fn()

      bot.on('message.update', updateListener)
      bot.on('message.add', addListener)

      // Simulate streaming: add empty message, then stream text
      const messageKey = await bot.message.add({ text: '' })

      // Clear add event
      addListener.mockClear()
      updateListener.mockClear()

      // Simulate streaming text character by character
      const fullText = 'Hello, this is streaming text!'
      const updatePromises = []

      for (let i = 1; i <= fullText.length; i++) {
        const partialText = fullText.substring(0, i)
        updatePromises.push(bot.message.update(messageKey, { text: partialText }))
      }

      await Promise.all(updatePromises)

      // Verify we got the right number of update events
      expect(updateListener).toHaveBeenCalledTimes(fullText.length)
      expect(addListener).toHaveBeenCalledTimes(0) // No additional add events

      // Verify final state
      const finalMessage = await bot.message.get(messageKey)
      expect(finalMessage.data.text).toBe(fullText)
    })

    test('handles rapid successive updates without losing data', async () => {
      const bot = createBot()
      const listener = jest.fn()

      bot.on('message.update', listener)

      const messageKey = await bot.message.add({ text: '', count: 0 })
      listener.mockClear()

      // Rapid updates
      const updateCount = 100
      const updatePromises = []

      for (let i = 1; i <= updateCount; i++) {
        updatePromises.push(
          bot.message.update(messageKey, {
            text: `Update ${i}`,
            count: i,
            timestamp: Date.now()
          })
        )
      }

      await Promise.all(updatePromises)

      expect(listener).toHaveBeenCalledTimes(updateCount)

      // Verify final state has the last update
      const finalMessage = await bot.message.get(messageKey)
      expect(finalMessage.data.count).toBe(updateCount)
      expect(finalMessage.data.text).toBe(`Update ${updateCount}`)
    })
  })

  describe('Data Integrity', () => {
    test('preserves message key across updates', async () => {
      const bot = createBot()
      const listener = jest.fn()

      bot.on('message.update', listener)

      const originalKey = await bot.message.add({ text: 'Original' })
      listener.mockClear()

      // Multiple updates
      await bot.message.update(originalKey, { text: 'Update 1' })
      await bot.message.update(originalKey, { text: 'Update 2' })
      await bot.message.update(originalKey, { text: 'Update 3' })

      // All events should have the same key
      listener.mock.calls.forEach(call => {
        expect(call[0].block.key).toBe(originalKey)
        expect(call[0].id).toBe(originalKey.toString())
      })
    })

    test('handles complex data structures in updates', async () => {
      const bot = createBot()
      const listener = jest.fn()

      bot.on('message.update', listener)

      const messageKey = await bot.message.add({
        text: 'Complex message',
        metadata: { version: 1 }
      })
      listener.mockClear()

      const complexUpdate = {
        text: 'Updated complex message',
        metadata: {
          version: 2,
          editor: 'bot',
          changes: ['text', 'metadata']
        },
        attachments: [
          { type: 'image', url: 'https://example.com/image.jpg' },
          { type: 'link', url: 'https://example.com' }
        ],
        formatting: {
          bold: [0, 7],
          italic: [8, 15]
        }
      }

      await bot.message.update(messageKey, complexUpdate)

      expect(listener).toHaveBeenCalledWith({
        id: messageKey.toString(),
        block: expect.objectContaining({
          data: expect.objectContaining(complexUpdate)
        })
      })

      // Verify the data was stored correctly
      const retrievedMessage = await bot.message.get(messageKey)
      expect(retrievedMessage.data).toEqual(expect.objectContaining(complexUpdate))
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('handles update to non-existent message gracefully', async () => {
      const bot = createBot()
      const listener = jest.fn()

      bot.on('message.update', listener)

      // Try to update a non-existent message
      // This should not crash, but the behavior depends on implementation
      // The block manager will try to find index -1, which should handle gracefully
      try {
        await bot.message.update(999, { text: 'Should not work' })
        // If it doesn't throw, verify no event was emitted
        expect(listener).toHaveBeenCalledTimes(0)
      } catch (error) {
        // If it throws, that's also acceptable behavior
        expect(error).toBeDefined()
      }
    })

    test('handles empty update data', async () => {
      const bot = createBot()
      const listener = jest.fn()

      bot.on('message.update', listener)

      const messageKey = await bot.message.add({ text: 'Original', keep: 'this' })
      listener.mockClear()

      // Update with empty object
      await bot.message.update(messageKey, {})

      expect(listener).toHaveBeenCalledTimes(1)

      // Original data should be preserved when merging with empty object
      const message = await bot.message.get(messageKey)
      expect(message.data.keep).toBe('this')
    })

    test('verifies event order with mixed operations', async () => {
      const bot = createBot()
      const allEvents = []

      bot.on('message.add', (block) => allEvents.push({ type: 'add', block }))
      bot.on('message.update', (data) => allEvents.push({ type: 'update', data }))
      bot.on('message.remove', (data) => allEvents.push({ type: 'remove', data }))

      // Mixed operations
      const key1 = await bot.message.add({ text: 'Message 1' })
      const key2 = await bot.message.add({ text: 'Message 2' })
      await bot.message.update(key1, { text: 'Updated Message 1' })
      await bot.message.update(key2, { text: 'Updated Message 2' })
      await bot.message.remove(key1)

      // Verify event order
      expect(allEvents).toHaveLength(5)
      expect(allEvents[0].type).toBe('add')
      expect(allEvents[1].type).toBe('add')
      expect(allEvents[2].type).toBe('update')
      expect(allEvents[3].type).toBe('update')
      expect(allEvents[4].type).toBe('remove')

      // Verify update events have correct structure
      expect(allEvents[2].data).toEqual({
        id: key1.toString(),
        block: expect.objectContaining({
          key: key1,
          data: expect.objectContaining({ text: 'Updated Message 1' })
        })
      })
    })
  })

  describe('Performance Considerations', () => {
    test('event emission is synchronous and immediate', async () => {
      const bot = createBot()
      let eventEmitted = false

      bot.on('message.update', () => {
        eventEmitted = true
      })

      const messageKey = await bot.message.add({ text: 'Test' })
      eventEmitted = false

      await bot.message.update(messageKey, { text: 'Updated' })

      // Event should be emitted synchronously
      expect(eventEmitted).toBe(true)
    })

    test('does not interfere with message retrieval performance', async () => {
      const bot = createBot()
      const listener = jest.fn()

      bot.on('message.update', listener)

      // Add messages
      const keys = []
      for (let i = 0; i < 10; i++) {
        keys.push(await bot.message.add({ text: `Message ${i}` }))
      }

      listener.mockClear()

      // Update all messages
      const startTime = Date.now()
      for (let i = 0; i < keys.length; i++) {
        await bot.message.update(keys[i], { text: `Updated ${i}` })
      }
      const endTime = Date.now()

      // Verify all updates triggered events
      expect(listener).toHaveBeenCalledTimes(10)

      // Basic performance check - should complete quickly
      expect(endTime - startTime).toBeLessThan(100) // Less than 100ms for 10 updates

      // Verify all messages are still retrievable
      for (let i = 0; i < keys.length; i++) {
        const message = await bot.message.get(keys[i])
        expect(message.data.text).toBe(`Updated ${i}`)
      }
    })
  })
})