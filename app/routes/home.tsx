import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Plus, Settings, User, Phone, MoreVertical } from 'lucide-react';

// Types
interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'ai' | 'contact';
  isRead: boolean;
}

interface Chat {
  id: string;
  name: string;
  type: 'ai' | 'contact';
  avatar: string;
  lastMessage?: Message;
  messages: Message[];
  isOnline: boolean;
  unreadCount: number;
}

interface User {
  id: string;
  name: string;
  avatar: string;
}

// Mock data
const mockUser: User = {
  id: '1',
  name: 'You',
  avatar: '👤'
};

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'AI Assistant',
    type: 'ai',
    avatar: '🤖',
    isOnline: true,
    unreadCount: 0,
    messages: [
      {
        id: '1',
        text: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date(Date.now() - 60000),
        sender: 'ai',
        isRead: true
      }
    ]
  },
  {
    id: '2',
    name: 'ChatGPT',
    type: 'ai',
    avatar: '🧠',
    isOnline: true,
    unreadCount: 2,
    messages: [
      {
        id: '2',
        text: 'I can help you with coding, writing, analysis, and much more!',
        timestamp: new Date(Date.now() - 120000),
        sender: 'ai',
        isRead: false
      }
    ]
  },
  {
    id: '3',
    name: 'John Doe',
    type: 'contact',
    avatar: '👨',
    isOnline: false,
    unreadCount: 1,
    messages: [
      {
        id: '3',
        text: 'Hey, how are you doing?',
        timestamp: new Date(Date.now() - 300000),
        sender: 'contact',
        isRead: false
      }
    ]
  },
  {
    id: '4',
    name: 'Jane Smith',
    type: 'contact',
    avatar: '👩',
    isOnline: true,
    unreadCount: 0,
    messages: [
      {
        id: '4',
        text: 'Thanks for your help with the project!',
        timestamp: new Date(Date.now() - 3600000),
        sender: 'contact',
        isRead: true
      }
    ]
  }
];

const ChatApp: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem('telegram-clone-chats');
      if (saved) {
        const chats = JSON.parse(saved);
        // Convert all message timestamps to Date objects
        return chats.map((chat: any) => ({
          ...chat,
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
    }
    return mockChats;
  });
  
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem('telegram-clone-chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChat]);

  // Update last message for each chat
  useEffect(() => {
    setChats(prevChats => prevChats.map(chat => ({
      ...chat,
      lastMessage: chat.messages[chat.messages.length - 1]
    })));
  }, []);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const aiChats = filteredChats.filter(chat => chat.type === 'ai');
  const contactChats = filteredChats.filter(chat => chat.type === 'contact');

  const currentChat = chats.find(chat => chat.id === activeChat);

  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatLastSeen = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date(),
      sender: 'user',
      isRead: true
    };

    setChats(prevChats => prevChats.map(chat => 
      chat.id === activeChat 
        ? { ...chat, messages: [...chat.messages, message] }
        : chat
    ));

    setNewMessage('');

    // Simulate AI response
    const chat = chats.find(c => c.id === activeChat);
    if (chat?.type === 'ai') {
      setIsTyping(true);
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: generateAIResponse(newMessage),
          timestamp: new Date(),
          sender: 'ai',
          isRead: true
        };

        setChats(prevChats => prevChats.map(c => 
          c.id === activeChat 
            ? { ...c, messages: [...c.messages, aiResponse] }
            : c
        ));
        setIsTyping(false);
      }, 1000 + Math.random() * 2000);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "That's an interesting question! Let me think about that...",
      "I understand what you're asking. Here's my perspective:",
      "Great point! I can help you with that.",
      "Thanks for sharing that with me. Here's what I think:",
      "I see what you mean. Let me provide some insights:",
      "That's a thoughtful question. Here's how I'd approach it:",
      "Interesting! I'd be happy to help you explore that further.",
      "I appreciate you asking. Here's my take on it:"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const createNewChat = (type: 'ai' | 'contact') => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: type === 'ai' ? 'New AI Assistant' : 'New Contact',
      type,
      avatar: type === 'ai' ? '🤖' : '👤',
      isOnline: true,
      unreadCount: 0,
      messages: []
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };

  const markAsRead = (chatId: string) => {
    setChats(prevChats => prevChats.map(chat => 
      chat.id === chatId 
        ? { ...chat, unreadCount: 0, messages: chat.messages.map(msg => ({ ...msg, isRead: true })) }
        : chat
    ));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="bg-white border-r border-gray-200 w-80 flex flex-col">
        {/* Sidebar Header */}
        <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Telegram Clone</h1>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 cursor-pointer hover:bg-blue-700 rounded p-1" />
            <User className="w-5 h-5 cursor-pointer hover:bg-blue-700 rounded p-1" />
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* New Chat Buttons */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => createNewChat('ai')}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">New AI Chat</span>
            </button>
            <button
              onClick={() => createNewChat('contact')}
              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">New Contact</span>
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {/* AI Assistants */}
          {aiChats.length > 0 && (
            <div>
              <div className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-50">
                AI Assistants
              </div>
              {aiChats.map(chat => (
                <div
                  key={chat.id}
                  className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    activeChat === chat.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                  }`}
                  onClick={() => {
                    setActiveChat(chat.id);
                    markAsRead(chat.id);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                        {chat.avatar}
                      </div>
                      {chat.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage?.text || 'No messages yet'}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contacts */}
          {contactChats.length > 0 && (
            <div>
              <div className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-50">
                Contacts
              </div>
              {contactChats.map(chat => (
                <div
                  key={chat.id}
                  className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    activeChat === chat.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                  }`}
                  onClick={() => {
                    setActiveChat(chat.id);
                    markAsRead(chat.id);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                        {chat.avatar}
                      </div>
                      {chat.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage?.text || 'No messages yet'}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredChats.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No chats found
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                    {currentChat.avatar}
                  </div>
                  {currentChat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{currentChat.name}</h2>
                  <p className="text-sm text-gray-600">
                    {currentChat.isOnline ? 'online' : `last seen ${formatLastSeen(new Date(Date.now() - 3600000))}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-gray-600 cursor-pointer hover:text-blue-600" />
                <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer hover:text-blue-600" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentChat.messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <span className={`text-xs ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === 'user' && (
                        <div className={`text-xs ${message.isRead ? 'text-blue-200' : 'text-blue-300'}`}>
                          ✓✓
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-2xl rounded-bl-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex items-center space-x-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-32"
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Telegram Clone</h2>
              <p className="text-gray-600">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;