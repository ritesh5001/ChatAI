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
} = chatSlice.actions;

export default chatSlice.reducer;
