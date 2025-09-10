// ws_server_https.js
// deps: npm i express socket.io cors

import https from "https";
import fs from "fs";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const PORT = 8087;  // 포트도 하드코딩
// --- TLS 인증서 하드코딩 ---
const tlsOptions = {
  key: fs.readFileSync("/new_data/Yangcheon-FE/certbot-etc/live/yangcheon.ai.kr/privkey.pem"),
  cert: fs.readFileSync("/new_data/Yangcheon-FE/certbot-etc/live/yangcheon.ai.kr/fullchain.pem"),
  // 필요하다면 체인 인증서도 추가
  // ca: fs.readFileSync("/etc/letsencrypt/live/your.domain/chain.pem"),
};

const httpsServer = https.createServer(tlsOptions, app);

// --- Socket.IO ---
const io = new Server(httpsServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// --- 유틸 ---
function getRoomMembers(room) {
  const set = io.sockets.adapter.rooms.get(room);
  return set ? Array.from(set) : [];
}
function getJoinedRooms(socket) {
  return Array.from(socket.rooms).filter((r) => r !== socket.id);
}

// --- 소켓 핸들링 ---
io.on("connection", (socket) => {
  console.log(`[conn] ${socket.id}`);

  socket.on("room:join", async ({ room, nickname }) => {
    await socket.join(room);
    if (nickname) socket.data.nickname = nickname;

    const members = getRoomMembers(room);
    socket.emit("room:joined", { room, selfId: socket.id, members });
    socket.to(room).emit("room:user-joined", {
      room,
      userId: socket.id,
      nickname: socket.data.nickname || null,
      members,
    });
    console.log(`[join] ${socket.id} -> ${room} (${members.length})`);
  });

  socket.on("room:leave", async ({ room }) => {
    await socket.leave(room);
    const members = getRoomMembers(room);
    socket.emit("room:left", { room, selfId: socket.id, members });
    socket.to(room).emit("room:user-left", { room, userId: socket.id, members });
    console.log(`[leave] ${socket.id} -/-> ${room} (${members.length})`);
  });

  socket.on("room:message", ({ room, msg }) => {
    const payload = {
      room,
      from: socket.id,
      nickname: socket.data.nickname || null,
      msg,
      ts: Date.now(),
    };
    io.to(room).emit("room:message", payload);
  });

  socket.on("room:list-my", () => {
    socket.emit("room:list-my:res", { rooms: getJoinedRooms(socket) });
  });

  socket.on("room:list-members", ({ room }) => {
    socket.emit("room:list-members:res", { room, members: getRoomMembers(room) });
  });

  socket.on("disconnect", (reason) => {
    for (const room of getJoinedRooms(socket)) {
      const members = getRoomMembers(room).filter((id) => id !== socket.id);
      socket.to(room).emit("room:user-left", { room, userId: socket.id, members });
    }
    console.log(`[disc] ${socket.id} (${reason})`);
  });
});

// --- 상태 체크 ---
app.get("/", (_req, res) => res.send("WSS OK (HTTPS + Socket.IO)"));

// --- 시작 ---
httpsServer.listen(PORT, () => {
  console.log(`WSS(Socket.IO) listening on https://0.0.0.0:${PORT}`);
});
