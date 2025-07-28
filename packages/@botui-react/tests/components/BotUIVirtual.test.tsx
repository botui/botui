import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { BotUIVirtual } from '../../src/components';
import { BotUIProvider } from '../../src/context/BotUIContext';
import { createMockBot } from '../mocks/bot';
import '@testing-library/jest-dom';
import { Message } from '../../src/hooks/useBotUI';

describe('BotUIVirtual', () => {
  it('should render virtualized messages', async () => {
    const bot = createMockBot();

    render(
      <BotUIProvider bot={bot}>
        <BotUIVirtual height={200} itemHeight={50}>
          {({ message, style }) => (
            <div style={style} data-testid="virtual-message">
              {message.content}
            </div>
          )}
        </BotUIVirtual>
      </BotUIProvider>
    );

    act(() => {
      const messageAddCall = bot.on.mock.calls.find(call => call[0] === 'message.add');
      if (messageAddCall) {
        const handleMessageAdd = messageAddCall[1];
        handleMessageAdd({ id: '1', content: 'Hello', type: 'bot', timestamp: new Date() });
        handleMessageAdd({ id: '2', content: 'Hi', type: 'human', timestamp: new Date() });
      }
    });

    const messageElements = screen.getAllByTestId('virtual-message');
    expect(messageElements.length).toBe(2);
    expect(messageElements[0]).toHaveTextContent('Hello');
    expect(messageElements[1]).toHaveTextContent('Hi');
  });
});