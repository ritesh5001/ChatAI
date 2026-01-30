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
  setChats
} from '../store/chatSlice.js';

const Home = () => {
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const activeChatId = useSelector(state => state.chat.activeChatId);
  const input = useSelector(state => state.chat.input);
  const isSending = useSelector(state => state.chat.isSending);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [socket, setSocket] = useState(null);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const [messages, setMessages] = useState([]);

  const getMessages = async (chatId) => {
    const response = await axios.get(`${API_URL}/api/chat/messages/${chatId}`, { withCredentials: true });

    console.log("Fetched messages:", response.data.messages);

    setMessages(response.data.messages.map(m => ({
      type: m.role === 'user' ? 'user' : 'ai',
      content: m.content
    })));
  };

  const handleNewChat = async () => {
    let title = window.prompt('Enter a title for the new chat:', '');
    if (title) title = title.trim();
    if (!title) return;

    const response = await axios.post(`${API_URL}/api/chat`, {
      title
    }, {
      withCredentials: true
    });

    console.log(response.data);

    getMessages(response.data.chat._id);
    dispatch(startNewChat(response.data.chat));
    setSidebarOpen(false);
  };

  useEffect(() => {
    axios.get(`${API_URL}/api/chat`, { withCredentials: true })
      .then(response => {
        console.log(response.data);
        const chatList = response.data.chats.reverse();
        dispatch(setChats(chatList));
        
        // Auto-select and load the last chat if available
        if (chatList.length > 0 && !activeChatId) {
          const lastChat = chatList[0];
          dispatch(selectChat(lastChat._id));
          getMessages(lastChat._id);
        }
      })
      .catch(err => {
        console.error('Failed to fetch chats:', err);
      });

    const tempSocket = io(API_URL, {
      withCredentials: true,
    });

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
    if (!trimmed || !activeChatId || isSending) return;
    dispatch(sendingStarted());

    const newMessages = [...messages, {
      type: 'user',
      content: trimmed
    }];

    console.log("New messages:", newMessages);

    setMessages(newMessages);
    dispatch(setInput(''));

    socket.emit("ai-message", {
      chat: activeChatId,
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
        open={sidebarOpen}
      />
      <main className="chat-main" role="main">
        {messages.length === 0 && (
          <div className="chat-welcome" aria-hidden="true">
            <div className="welcome-badge">Early Preview</div>
            <h1 className="welcome-title">Ask Jarvis</h1>
            <p className="welcome-text">
              If you haven't logged in yet, please log in first. Once logged in, 
              you can ask anything—paste text, brainstorm ideas, or get quick explanations. 
              Your chats will stay in the sidebar so you can continue anytime.
            </p>
          </div>
        )}
        <ChatMessages messages={messages} isSending={isSending} />
        {activeChatId && (
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
