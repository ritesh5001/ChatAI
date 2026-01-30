import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ChatMessages.css';

// Custom code block component with copy button
const CodeBlock = ({ language, children }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-language">{language || 'code'}</span>
        <button 
          className="code-copy-btn"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          fontSize: '13px',
          padding: '16px',
        }}
        wrapLongLines={true}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

// Markdown renderer for AI messages
const MessageContent = ({ content, isStreaming }) => {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          if (!inline && (match || String(children).includes('\n'))) {
            return (
              <CodeBlock language={language}>
                {String(children).replace(/\n$/, '')}
              </CodeBlock>
            );
          }
          
          return (
            <code className="inline-code" {...props}>
              {children}
            </code>
          );
        },
        // Style other markdown elements
        p: ({ children }) => <p className="md-paragraph">{children}</p>,
        ul: ({ children }) => <ul className="md-list">{children}</ul>,
        ol: ({ children }) => <ol className="md-list md-list-ordered">{children}</ol>,
        li: ({ children }) => <li className="md-list-item">{children}</li>,
        h1: ({ children }) => <h1 className="md-heading md-h1">{children}</h1>,
        h2: ({ children }) => <h2 className="md-heading md-h2">{children}</h2>,
        h3: ({ children }) => <h3 className="md-heading md-h3">{children}</h3>,
        strong: ({ children }) => <strong className="md-bold">{children}</strong>,
        em: ({ children }) => <em className="md-italic">{children}</em>,
        blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
        a: ({ href, children }) => <a href={href} className="md-link" target="_blank" rel="noopener noreferrer">{children}</a>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

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
  const messagesContainerRef = useRef(null);
  const [playingIndex, setPlayingIndex] = useState(null); // Track which message is playing
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null);
  
  // Scroll on new messages or streaming updates
  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, isSending]);

  // Auto-scroll during streaming (check last message content changes)
  const lastMessage = messages[messages.length - 1];
  useEffect(() => {
    if (lastMessage?.isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lastMessage?.content]);

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
              className={`msg-bubble ${m.isStreaming ? 'streaming' : ''}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {m.type === 'ai' ? (
                <>
                  <MessageContent content={m.content} isStreaming={m.isStreaming} />
                  {m.isStreaming && <span className="streaming-cursor">▋</span>}
                </>
              ) : (
                m.content
              )}
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
