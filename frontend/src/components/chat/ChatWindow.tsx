'use client';

import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import Avatar from '@/components/ui/Avatar';

interface ChatWindowProps {
  roomId: string;
}

export default function ChatWindow({ roomId }: ChatWindowProps) {
  const { user } = useAuthStore();
  const rooms = useChatStore((s) => s.rooms);
  const room = rooms.find((r) => (r._id || r.id) === roomId);

  const getRoomDisplayName = (room: any) => {
    if (!room) return 'Chat Room';
    if (room.type === 'direct' && room.participantNames) {
      const otherId = room.participants.find((id: string) => id !== user?.id);
      return room.participantNames[otherId] || room.name;
    }
    return room.name;
  };

  const displayName = getRoomDisplayName(room);

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="px-8 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-5">
          <Avatar name={displayName} size="md" showStatus userId={room?.type === 'direct' ? room.participants.find(id => id !== user?.id) : undefined} />
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 truncate leading-tight text-lg tracking-tight">{displayName}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              {room?.type === 'direct' ? (
                <>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Online</p>
                </>
              ) : (
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{room?.participants?.length || 0} Members</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto relative scroll-smooth bg-slate-50"
        style={{
          backgroundImage: `radial-gradient(#e2e8f0 0.8px, transparent 0.8px)`,
          backgroundSize: '32px 32px',
        }}
      >
        <div className="max-w-4xl mx-auto h-full px-6">
          <MessageList roomId={roomId} />
        </div>
      </div>

      {/* Footer area */}
      <div className="bg-white border-t border-slate-200 px-8 py-4 z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto">
          <TypingIndicator roomId={roomId} />
          <MessageInput roomId={roomId} />
        </div>
      </div>
    </div>
  );
}
