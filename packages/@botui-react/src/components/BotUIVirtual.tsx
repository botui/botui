// packages/@botui-react/src/components/BotUIVirtual.tsx
import React, { useEffect, useRef, useMemo, CSSProperties } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useBotUIContext } from '../context/BotUIContext';
import type { IBlock } from '../../../botui/src/types.js';

interface BotUIVirtualProps {
  height: number;
  itemHeight?: number; // Default: 80px, consider using react-window-dynamic for variable heights
  width?: number | string;
  className?: string;
  overscan?: number; // Default: 5
  children: (props: { index: number; style: React.CSSProperties; message: IBlock }) => React.ReactNode;
}

export function BotUIVirtual({
  height,
  itemHeight = 80,
  width = '100%',
  className,
  overscan = 5,
  children
}: BotUIVirtualProps) {
  const { messages } = useBotUIContext();
  const listRef = useRef<List>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages.length]);

  const itemData = useMemo(() => ({ messages, children }), [messages, children]);

  return (
    <List
      ref={listRef}
      className={className}
      height={height}
      width={width}
      itemCount={messages.length}
      itemSize={itemHeight}
      itemData={itemData}
      overscanCount={overscan}
    >
      {VirtualMessageItem}
    </List>
  );
}

// Wrapper component to pass message data to the children render prop
function VirtualMessageItem({ index, style, data }: {
  index: number;
  style: CSSProperties;
  data: { messages: IBlock[]; children: Function };
}) {
  const { messages, children } = data;
  const message = messages[index];

  if (!message) return null;

  return children({ index, style, message });
}