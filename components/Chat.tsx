import React, { useState, useEffect, useRef } from "react";
import { Send, Minimize2, Maximize2, X, MessageCircle } from "lucide-react";

interface ChatMessage {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
}

interface ChatProps {
  socket: WebSocket | null;
  roomId: string;
  role: "sender" | "receiver";
  onClose?: () => void;
}

const Chat: React.FC<ChatProps> = ({ socket, roomId, role, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(true);
  const [isIconOnly, setIsIconOnly] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isMinimized && !isIconOnly) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isMinimized, isIconOnly]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "chatMessage") {
          const newMessage: ChatMessage = {
            id: Date.now(),
            text: data.text,
            sender: data.sender,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          };
          setMessages((prev) => [...prev, newMessage]);
          
          // Increment unread count if chat is minimized or in icon mode
          if ((isMinimized || isIconOnly) && data.sender !== role) {
            setUnreadCount(prev => prev + 1);
          }
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, isMinimized, isIconOnly, role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {}, 1000);
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket || socket.readyState !== WebSocket.OPEN)
      return;

    const messageData = {
      type: "chatMessage",
      roomId,
      text: inputMessage,
      sender: role
    };

    socket.send(JSON.stringify(messageData));

    const newMessage: ChatMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: role,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleMinimize = () => {
    if (isIconOnly) {
      setIsIconOnly(false);
      setIsMinimized(false);
      setUnreadCount(0);
    } else {
      setIsMinimized(!isMinimized);
      if (isMinimized) {
        setUnreadCount(0);
      }
    }
  };

  const minimizeToIcon = () => {
    setIsIconOnly(true);
  };

  // If in icon-only mode, show just the chat icon
  if (isIconOnly) {
    return (
      <div className="fixed bottom-5 left-5 z-50">
        <button 
          onClick={toggleMinimize}
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Otherwise show the chat window (minimized or expanded)
  return (
    <div className={`fixed bottom-0 left-5 flex flex-col rounded-t-lg shadow-lg transition-all duration-300 ${
      isMinimized ? 'w-72 h-12' : 'w-80 h-96'
    } bg-white border border-blue-300 overflow-hidden z-50`}>
      {/* Chat header */}
      <div className="bg-blue-600 text-white p-2 flex justify-between items-center cursor-pointer" 
           onClick={toggleMinimize}>
        <div className="flex items-center">
          <h3 className="font-medium truncate">Chat Room: {roomId}</h3>
          {isMinimized && unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {isMinimized ? (
            <Maximize2 size={16} onClick={(e) => { e.stopPropagation(); toggleMinimize(); }} />
          ) : (
            <>
              <Minimize2 size={16} onClick={(e) => { e.stopPropagation(); toggleMinimize(); }} />
              <MessageCircle size={16} className="ml-2" onClick={(e) => { e.stopPropagation(); minimizeToIcon(); }} />
            </>
          )}
          {onClose && (
            <X size={16} className="ml-2" onClick={(e) => { e.stopPropagation(); onClose(); }} />
          )}
        </div>
      </div>

      {/* Chat body - only shown when not minimized */}
      {!isMinimized && (
        <>
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === role ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[70%] break-words ${
                    msg.sender === role ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === role ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t p-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message"
                className="flex-1 px-3 py-1 border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
                className="p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
