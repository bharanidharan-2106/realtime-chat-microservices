'use client';

import { getInitials } from '@/lib/utils';
import { usePresenceStore } from '@/stores/presenceStore';

interface AvatarProps {
  name: string;
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
};

export default function Avatar({ name, userId, size = 'md', showStatus = false }: AvatarProps) {
  const isOnline = usePresenceStore((s) => (userId ? s.isOnline(userId) : false));

  return (
    <div className="relative inline-flex">
      <div
        className={`${sizeMap[size]} bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold`}
      >
        {getInitials(name)}
      </div>
      {showStatus && userId && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
      )}
    </div>
  );
}
