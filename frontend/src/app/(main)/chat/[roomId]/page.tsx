'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useChatStore } from '@/stores/chatStore';
import { getChatSocket } from '@/lib/socket';
import api from '@/lib/api';
import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { setActiveRoom, setMessages, messages } = useChatStore();

  useEffect(() => {
    setActiveRoom(roomId);

    // Join room via socket
    const socket = getChatSocket();
    socket.emit('join_room', { roomId });

    // Fetch message history
    if (!messages[roomId]) {
      api.get(`/messages/${roomId}`).then(({ data }) => {
        setMessages(roomId, data.map((m: any) => ({ ...m, id: m._id || m.id })));
      }).catch(console.error);
    }

    return () => {
      socket.emit('leave_room', { roomId });
      setActiveRoom(null);
    };
  }, [roomId, setActiveRoom, setMessages, messages]);

  return <ChatWindow roomId={roomId} />;
}
