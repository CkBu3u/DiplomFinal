import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getCurrentUser, getConversations, getMessagesWithUser, sendMessage as sendMessageApi } from '@/lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export function MessagesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { sellerId?: string; listingId?: string; listingTitle?: string }) ?? {};
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(state.sellerId ?? null);
  const [currentListingId] = useState<string | undefined>(state.listingId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      setUser(currentUser);
      const { data: convs } = await getConversations();
      let list: Conversation[] = convs ?? [];
      if (state.sellerId && !list.some((c) => c.userId === state.sellerId)) {
        list = [{ userId: state.sellerId, userName: state.listingTitle ? `Объявление: ${state.listingTitle}` : 'Продавец', lastMessage: '', lastMessageTime: '', unreadCount: 0 }, ...list];
      }
      setConversations(list);
      setIsLoading(false);
    };

    loadUser();
  }, [navigate, state.sellerId, state.listingTitle]);

  useEffect(() => {
    if (!selectedConversation || !user?.id) {
      setMessages([]);
      return;
    }
    const load = async () => {
      const { data } = await getMessagesWithUser(selectedConversation);
      setMessages(data ?? []);
    };
    load();
  }, [selectedConversation, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    const text = newMessage.trim();
    setNewMessage('');
    const { data: sent } = await sendMessageApi(selectedConversation, text, currentListingId);
    if (sent) {
      setMessages((prev) => [...prev, sent as Message]);
    } else {
      setNewMessage(text);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Сообщения</h1>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <Input placeholder="Поиск по сообщениям..." />
              </div>
              {conversations.length > 0 ? (
                <div>
                  {conversations.map((conv) => (
                    <button
                      key={conv.userId}
                      onClick={() => setSelectedConversation(conv.userId)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                        selectedConversation === conv.userId ? 'bg-blue-50' : ''
                      }`}
                    >
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-[#2563eb] to-[#f97316] text-white">
                          {conv.userName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{conv.userName}</span>
                          <span className="text-xs text-gray-400">{conv.lastMessageTime}</span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{conv.lastMessage}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-[#f97316] text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>У вас пока нет сообщений</p>
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 flex flex-col h-full">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-[#2563eb] to-[#f97316] text-white">
                        {conversations.find(c => c.userId === selectedConversation)?.userName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {conversations.find(c => c.userId === selectedConversation)?.userName}
                      </div>
                      <div className="text-xs text-green-500">Онлайн</div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-[#2563eb] text-white rounded-br-md'
                                : 'bg-gray-100 text-gray-800 rounded-bl-md'
                            }`}
                          >
                            <p>{message.content}</p>
                            <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-400'} mt-1 block`}>
                              {formatTime(message.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Введите сообщение..."
                      className="flex-1"
                    />
                    <Button type="submit" className="bg-[#f97316] hover:bg-[#ea580c]">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <MessageSquare className="w-16 h-16 mb-4" />
                  <p>Выберите диалог для начала общения</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
