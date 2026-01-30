import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatMessages.css';

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 500, damping: 30 }
  },
  exit: { opacity: 0, scale: 0.95 }
};

const ChatMessages = ({ messages, isSending }) => {
  const bottomRef = useRef(null);
  const [playingIndex, setPlayingIndex] = useState(null); // Track which message is playing
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null);
  
  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages.length, isSending]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const handleSpeech = (content, index) => {
    try {
      // If this message is currently playing
      if (playingIndex === index) {
        if (isPaused) {
          // Resume
          speechSynthesis.resume();
          setIsPaused(false);
        } else {
          // Pause
          speechSynthesis.pause();
          setIsPaused(true);
        }
        return;
      }

      // Stop any current speech
      speechSynthesis.cancel();
      
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(content);
      utteranceRef.current = utterance;
      
      // Handle speech end
      utterance.onend = () => {
        setPlayingIndex(null);
        setIsPaused(false);
      };
      
      // Handle speech error
      utterance.onerror = () => {
        setPlayingIndex(null);
        setIsPaused(false);
      };
      
      // Start speaking
      speechSynthesis.speak(utterance);
      setPlayingIndex(index);
      setIsPaused(false);
    } catch {
      /* speech synthesis unsupported */
    }
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();
    setPlayingIndex(null);
    setIsPaused(false);
  };
  
  return (
    <div className="messages" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {messages.map((m, index) => (
          <motion.div 
            key={index} 
            className={`msg msg-${m.type}`}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            <div className="msg-role" aria-hidden="true">
              {m.type === 'user' ? 'You' : 'Jarvis'}
            </div>
            <motion.div 
              className="msg-bubble"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {m.content}
            </motion.div>
            <div className="msg-actions" role="group" aria-label="Message actions">
              <motion.button 
                type="button" 
                aria-label="Copy message" 
                onClick={() => navigator.clipboard.writeText(m.content)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </motion.button>
              {m.type === 'ai' && (
                <>
                  <motion.button 
                    type="button" 
                    aria-label={playingIndex === index ? (isPaused ? "Resume" : "Pause") : "Speak message"}
                    className={playingIndex === index ? 'audio-active' : ''}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSpeech(m.content, index)}
                  >
                    {playingIndex === index && !isPaused ? (
                      // Pause icon
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : playingIndex === index && isPaused ? (
                      // Play/Resume icon
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    ) : (
                      // Speaker icon
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </svg>
                    )}
                  </motion.button>
                  {playingIndex === index && (
                    <motion.button 
                      type="button" 
                      aria-label="Stop"
                      className="audio-stop"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={stopSpeech}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                      </svg>
                    </motion.button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      <AnimatePresence>
        {isSending && (
          <motion.div 
            className="msg msg-ai pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="msg-role" aria-hidden="true">Jarvis</div>
            <div className="msg-bubble typing-dots" aria-label="AI is typing">
              <span /><span /><span />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
