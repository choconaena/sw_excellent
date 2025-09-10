// wsClient.js
import { io } from "socket.io-client";

/**
 * WebSocket 클라이언트 연결
 * @param {string} serverUrl - WebSocket 서버 주소
 * @param {string} room - 입장할 룸 이름
 * @param {string} nickname - 사용할 닉네임
 */
export function connectWebSocketClient(serverUrl, room, nickname) {
  const socket = io(serverUrl, { transports: ["websocket"] });

  socket.on("connect", () => {
    console.log(`✅ WS client connected: ${socket.id}`);
    socket.emit("room:join", { room, nickname });
  });

  socket.on("room:joined", (p) => {
    console.log("joined:", p);
  });

  socket.on("room:message", (p) => console.log("msg:", p));
  socket.on("room:user-joined", (p) => console.log("user-joined:", p));
  socket.on("room:user-left", (p) => console.log("user-left:", p));
  socket.on("disconnect", (r) => console.log("❎ WS client disconnected:", r));

  return socket; // 필요 시 소켓 객체 반환
}
