// src/config/env.js
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://safe-hi.xyz:20443";

export const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL || "wss://safe-hi.xyz:28084";
