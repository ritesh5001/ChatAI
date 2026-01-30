import React, { useCallback, useEffect, useState } from 'react';
import { io } from "socket.io-client";
import '../styles/theme.css';
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import '../components/chat/ChatLayout.css';
import { fakeAIReply } from '../components/chat/aiClient.js';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import API_URL from '../config/api';
import {
  ensureInitialChat,
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  addUserMessage,
  addAIMessage,
  setChats,
  renameChat,
  deleteChat
} from '../store/chatSlice.js';

const Home = () => {
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const activeChatId = useSelector(state => state.chat.activeChatId);
  const input = useSelector(state => state.chat.input);
  const isSending = useSelector(state => state.chat.isSending);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const [messages, setMessages] = useState([]);
  const [pendingNewChat, setPendingNewChat] = useState(false);

  const getMessages = async (chatId) => {
    const response = await axios.get(`${API_URL}/api/chat/messages/${chatId}`, { withCredentials: true });

    console.log("Fetched messages:", response.data.messages);

    setMessages(response.data.messages.map(m => ({
      type: m.role === 'user' ? 'user' : 'ai',
      content: m.content
    })));
  };

  const createChatWithTitle = async (title) => {
    const response = await axios.post(`${API_URL}/api/chat`, {
      title
    }, {
      withCredentials: true
    });

    console.log(response.data);
    dispatch(startNewChat(response.data.chat));
    return response.data.chat._id;
  };

  const handleNewChat = () => {
    // Clear current chat and set pending flag for auto-title
    setMessages([]);
    dispatch(selectChat(null));
    setPendingNewChat(true);
    setSidebarOpen(false);
  };

  const handleRenameChat = (chatId, newTitle) => {
    dispatch(renameChat({ chatId, newTitle }));
  };

  const handleDeleteChat = (chatId) => {
    dispatch(deleteChat(chatId));
    // If deleted chat was active, clear messages
    if (chatId === activeChatId) {
      setMessages([]);
    }
  };

  useEffect(() => {
    // Fetch user profile
    axios.get(`${API_URL}/api/auth/profile`, { withCredentials: true })
      .then(response => {
        setUser(response.data.user);
      })
      .catch(err => {
        console.error('Failed to fetch user profile:', err);
      });

    axios.get(`${API_URL}/api/chat`, { withCredentials: true })
      .then(async response => {
        console.log(response.data);
        const chatList = response.data.chats.reverse();
        dispatch(setChats(chatList));
        
        // Auto-select and load the last chat if available
        if (chatList.length > 0 && !activeChatId) {
          const lastChat = chatList[0];
          dispatch(selectChat(lastChat._id));
          getMessages(lastChat._id);
        } else if (chatList.length === 0) {
          // No chats exist - auto-create a new chat for new users
          setPendingNewChat(true);
        }
      })
      .catch(err => {
        console.error('Failed to fetch chats:', err);
      });

    const tempSocket = io(API_URL, {
      withCredentials: true,
    });

    // Streaming response handlers
    tempSocket.on("ai-response-start", () => {
      // Add empty AI message placeholder for streaming
      setMessages((prevMessages) => [...prevMessages, {
        type: 'ai',
        content: '',
        isStreaming: true
      }]);
    });

    tempSocket.on("ai-response-chunk", (messagePayload) => {
      // Append chunk to the last AI message
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].type === 'ai') {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: newMessages[lastIndex].content + messagePayload.content
          };
        }
        return newMessages;
      });
    });

    tempSocket.on("ai-response-end", (messagePayload) => {
      // Mark streaming as complete
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].type === 'ai') {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: messagePayload.content,
            isStreaming: false
          };
        }
        return newMessages;
      });
      dispatch(sendingFinished());
    });

    tempSocket.on("ai-response-error", (error) => {
      console.error("AI response error:", error);
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].type === 'ai' && newMessages[lastIndex].isStreaming) {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: "Sorry, I encountered an error. Please try again.",
            isStreaming: false
          };
        }
        return newMessages;
      });
      dispatch(sendingFinished());
    });

    // Legacy handler for backward compatibility
    tempSocket.on("ai-response", (messagePayload) => {
      console.log("Received AI response:", messagePayload);

      setMessages((prevMessages) => [...prevMessages, {
        type: 'ai',
        content: messagePayload.content
      }]);

      dispatch(sendingFinished());
    });

    setSocket(tempSocket);
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    console.log("Sending message:", trimmed);
    if (!trimmed || isSending) return;
    
    // If pending new chat, create chat with first message as title
    let chatId = activeChatId;
    if (pendingNewChat || !activeChatId) {
      dispatch(sendingStarted());
      // Generate title from first message (first 40 chars)
      const autoTitle = trimmed.length > 40 ? trimmed.substring(0, 40) + '...' : trimmed;
      chatId = await createChatWithTitle(autoTitle);
      dispatch(selectChat(chatId));
      setPendingNewChat(false);
    } else {
      dispatch(sendingStarted());
    }

    const newMessages = [...messages, {
      type: 'user',
      content: trimmed
    }];

    console.log("New messages:", newMessages);

    setMessages(newMessages);
    dispatch(setInput(''));

    socket.emit("ai-message", {
      chat: chatId,
      content: trimmed
    });
  };

  return (
    <div className="chat-layout minimal">
      <ChatMobileBar
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        onNewChat={handleNewChat}
      />
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          dispatch(selectChat(id));
          setSidebarOpen(false);
          getMessages(id);
        }}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        open={sidebarOpen}
        user={user}
      />
      <main className="chat-main" role="main">
        {messages.length === 0 && !pendingNewChat && (
          <div className="chat-welcome" aria-hidden="true">
            <div className="welcome-badge">AI Assistant</div>
            <h1 className="welcome-title">Meet Jarvis</h1>
            <p className="welcome-text">
              Your intelligent AI companion powered by advanced language models. 
              Ask questions, generate code, brainstorm ideas, analyze text, or get creative help. 
              Jarvis remembers your conversation context for seamless, natural interactions.
            </p>
          </div>
        )}
        {pendingNewChat && messages.length === 0 && (
          <div className="chat-welcome" aria-hidden="true">
            <h1 className="welcome-title">New Chat</h1>
            <p className="welcome-text">
              Type your question below. The chat will be named automatically based on your first message.
            </p>
          </div>
        )}
        <ChatMessages messages={messages} isSending={isSending} />
        {(activeChatId || pendingNewChat) && (
          <ChatComposer
            input={input}
            setInput={(v) => dispatch(setInput(v))}
            onSend={sendMessage}
            isSending={isSending}
          />
        )}
      </main>
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
