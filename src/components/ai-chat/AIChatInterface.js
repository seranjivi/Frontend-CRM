// src/components/ai-chat/AIChatInterface.js
import React from 'react';
import { useChat } from '../../context/ChatContext';
import AIChatBox from './AIChatBox';

const AIChatInterface = () => {
  const { isChatOpen, closeChat } = useChat();

  if (!isChatOpen) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div className="absolute bottom-4 right-4 w-full max-w-md h-[calc(100vh-2rem)] max-h-[700px] pointer-events-auto">
        <AIChatBox onClose={closeChat} />
      </div>
    </div>
  );
};

export default AIChatInterface;