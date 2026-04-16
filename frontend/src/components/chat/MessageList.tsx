'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  roomId: string;
}

export default function MessageList({ roomId }: MessageListProps) {
  const messages = useChatStore((s) => s.messages[roomId] || []);
  const user = useAuthStore((s) => s.user);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50">
      {messages.length === 0 && (
        <p className="text-center text-gray-400 mt-8">No messages yet. Start the conversation!</p>
      )}
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id || msg._id}
          message={msg}
          isOwn={msg.senderId === user?.id}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
