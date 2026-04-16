'use client';

import { useState } from 'react';
import { getChatSocket } from '@/lib/socket';

interface MessageInputProps {
  roomId: string;
}

export default function MessageInput({ roomId }: MessageInputProps) {
  const [content, setContent] = useState('');

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const socket = getChatSocket();
    socket.emit('send_message', { roomId, content: content.trim() });
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const handleTyping = () => {
    const socket = getChatSocket();
    socket.emit('typing', { roomId });
  };

  return (
    <form onSubmit={sendMessage} className="p-4 border-t bg-white flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleTyping}
        placeholder="Type a message..."
        className="input-field flex-1"
      />
      <button type="submit" className="btn-primary px-6">
        Send
      </button>
    </form>
  );
}
