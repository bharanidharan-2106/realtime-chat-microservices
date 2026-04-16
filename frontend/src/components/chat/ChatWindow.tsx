'use client';

import { useChatStore } from '@/stores/chatStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  roomId: string;
}

export default function ChatWindow({ roomId }: ChatWindowProps) {
  const rooms = useChatStore((s) => s.rooms);
  const room = rooms.find((r) => (r._id || r.id) === roomId);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
          {room?.name?.[0]?.toUpperCase() || '#'}
        </div>
        <div>
          <h2 className="font-semibold">{room?.name || 'Chat Room'}</h2>
          <p className="text-xs text-gray-500">{room?.participants?.length || 0} members</p>
        </div>
      </div>

      {/* Messages */}
      <MessageList roomId={roomId} />

      {/* Typing indicator */}
      <TypingIndicator roomId={roomId} />

      {/* Input */}
      <MessageInput roomId={roomId} />
    </div>
  );
}
