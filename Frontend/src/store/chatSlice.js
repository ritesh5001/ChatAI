import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [],
  activeChatId: null,
  input: '',
  isSending: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    ensureInitialChat: state => {},
    startNewChat: (state, action) => {
      state.chats.unshift(action.payload);
      state.activeChatId = action.payload.id || action.payload._id;
    },
    selectChat: (state, action) => {
      state.activeChatId = action.payload;
    },
    setInput: (state, action) => {
      state.input = action.payload;
    },
    sendingStarted: state => {
      state.isSending = true;
    },
    sendingFinished: state => {
      state.isSending = false;
    },
    addUserMessage: (state, action) => {},
    addAIMessage: (state, action) => {},
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    renameChat: (state, action) => {
      const { chatId, newTitle } = action.payload;
      const chat = state.chats.find(c => c._id === chatId || c.id === chatId);
      if (chat) {
        chat.title = newTitle;
      }
    },
    deleteChat: (state, action) => {
      const chatId = action.payload;
      state.chats = state.chats.filter(c => c._id !== chatId && c.id !== chatId);
      if (state.activeChatId === chatId) {
        state.activeChatId = state.chats.length > 0 ? (state.chats[0]._id || state.chats[0].id) : null;
      }
    },
  },
});

export const {
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
  deleteChat,
} = chatSlice.actions;

export default chatSlice.reducer;
