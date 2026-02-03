// src/components/ai-chat/ChatToggleButton.js
import React from 'react';
import { Button } from '../ui/button';
import { MessageSquare, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const ChatToggleButton = () => {
  const { isChatOpen, toggleChat } = useChat();

  return (
    <Button
      onClick={toggleChat}
      className={`fixed bottom-6 right-6 rounded-full h-14 w-14 p-0 shadow-lg z-50 ${
        isChatOpen ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
      }`}
      aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
    >
      {isChatOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <MessageSquare className="h-6 w-6" />
      )}
    </Button>
  );
};

export default ChatToggleButton;