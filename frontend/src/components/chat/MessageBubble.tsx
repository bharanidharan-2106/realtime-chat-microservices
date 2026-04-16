'use client';

import { formatTime } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = formatTime(message.timestamp || message.createdAt || '');

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-indigo-500 text-white rounded-br-md'
            : 'bg-white text-gray-900 shadow-sm rounded-bl-md'
        }`}
      >
        {!isOwn && message.senderName && (
          <p className="text-xs font-semibold text-indigo-600 mb-1">{message.senderName}</p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-400'}`}>{time}</p>
      </div>
    </div>
  );
}
