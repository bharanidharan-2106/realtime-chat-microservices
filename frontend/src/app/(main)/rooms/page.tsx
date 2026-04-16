'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/stores/chatStore';
import api from '@/lib/api';

export default function RoomsPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { rooms, setRooms } = useChatStore();
  const router = useRouter();

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/rooms', { name, type: 'group' });
      setRooms([data, ...rooms]);
      setName('');
      router.push(`/chat/${data._id || data.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-6">Chat Rooms</h1>

      <form onSubmit={createRoom} className="flex gap-2 mb-8">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="New room name..." className="input-field flex-1" required />
        <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </form>

      <div className="grid gap-3">
        {rooms.map((room) => (
          <button
            key={room._id || room.id}
            onClick={() => router.push(`/chat/${room._id || room.id}`)}
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left w-full"
          >
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
              {room.name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{room.name}</p>
              <p className="text-sm text-gray-500">{room.participants.length} members</p>
            </div>
          </button>
        ))}
        {rooms.length === 0 && (
          <p className="text-gray-400 text-center py-8">No rooms yet. Create one above!</p>
        )}
      </div>
    </div>
  );
}
