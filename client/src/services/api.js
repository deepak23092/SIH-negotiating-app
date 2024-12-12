import axios from "axios";

const BASE_URL = "https://sih-negotiating-app-1.onrender.com/api";

export const getUserList = async (userId) =>
  axios.get(`${BASE_URL}/conversation/chats/${userId}`);
export const getMessages = async (senderId, receiverId) =>
  axios.get(`${BASE_URL}/conversation/${senderId}/${receiverId}`);
export const getUserById = async (userId) =>
  axios.get(`${BASE_URL}/conversation/${userId}`);
export const openAi = async (text) =>
  axios.post(`${BASE_URL}/openai/generate-action`, text);
