'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import Avatar from '@/components/ui/Avatar';

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user } = useAuthStore();
  const { rooms, activeRoomId } = useChatStore();
  const pathname = usePathname();
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">ChatPlatform</h1>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-700 flex items-center gap-3">
        <Avatar name={user?.username || '?'} size="sm" />
        <div className="truncate">
          <p className="font-medium text-sm truncate">{user?.username}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-2">
        <button
          onClick={() => navigateTo('/rooms')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === '/rooms' ? 'bg-gray-700' : 'hover:bg-gray-800'
          }`}
        >
          + Browse / Create Rooms
        </button>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        <p className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wider">Rooms</p>
        {rooms.map((room) => {
          const id = room._id || room.id;
          const isActive = activeRoomId === id;
          return (
            <button
              key={id}
              onClick={() => navigateTo(`/chat/${id}`)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                isActive ? 'bg-indigo-600' : 'hover:bg-gray-800'
              }`}
            >
              <span className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-xs">
                {room.name[0]?.toUpperCase()}
              </span>
              <span className="truncate">{room.name}</span>
            </button>
          );
        })}
        {rooms.length === 0 && (
          <p className="px-3 py-4 text-sm text-gray-500 text-center">No rooms yet</p>
        )}
      </div>

      {/* Settings */}
      <div className="p-2 border-t border-gray-700">
        <button
          onClick={() => navigateTo('/settings')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === '/settings' ? 'bg-gray-700' : 'hover:bg-gray-800'
          }`}
        >
          Settings
        </button>
      </div>
    </div>
  );
}
