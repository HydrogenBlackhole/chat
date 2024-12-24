// WS 10001 API 10002 CHAT 10008 CONFIG 10009

// export const WS_URL = "wss://xxx.com/msg_gateway";
// export const API_URL = "https://xxx.com/api";
// export const USER_URL = "https://xxx.com/chat";

export const WS_URL = "ws://110.40.58.201:10001";
export const API_URL = "http://110.40.58.201:10002";
export const CHAT_URL = "http://110.40.58.201:10008";

export const getWsUrl = () => localStorage.getItem("wsUrl") || WS_URL;
export const getApiUrl = () => localStorage.getItem("apiUrl") || API_URL;
export const getChatUrl = () => localStorage.getItem("chatUrl") || CHAT_URL;
