// ws_server.js
// npm i express socket.io cors
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// --- 유틸: 특정 룸의 멤버 소켓ID 목록 반환 ---
function getRoomMembers(room) {
  const roomSet = io.sockets.adapter.rooms.get(room);
  if (!roomSet) return [];
  return Array.from(roomSet);
}

// --- 유틸: 소켓이 참여한 룸 목록(개인룸 제외) ---
function getJoinedRooms(socket) {
  // socket.rooms = Set<roomName> (항상 자기 socket.id가 포함)
  return Array.from(socket.rooms).filter((r) => r !== socket.id);
}

// --- 연결 처리 ---
io.on("connection", (socket) => {
  console.log(`[conn] ${socket.id}`);

  // 1) 룸 입장
  socket.on("room:join", async ({ room, nickname }) => {
    await socket.join(room);

    // 닉네임을 소켓에 보관 (선택)
    if (nickname) socket.data.nickname = nickname;

    const members = getRoomMembers(room);
    // 본인에게 입장 확인
    socket.emit("room:joined", {
      room,
      selfId: socket.id,
      members,
    });
    // 다른 멤버들에게 알림
    socket.to(room).emit("room:user-joined", {
      room,
      userId: socket.id,
      nickname: socket.data.nickname || null,
      members,
    });

    console.log(`[join] ${socket.id} -> room : ${room} (now memebers : ${members.length})`);
  });

  // 2) 룸 나가기
  socket.on("room:leave", async ({ room }) => {
    await socket.leave(room);
    const members = getRoomMembers(room);
    socket.emit("room:left", { room, selfId: socket.id, members });
    socket.to(room).emit("room:user-left", {
      room,
      userId: socket.id,
      members,
    });
    console.log(`[leave] ${socket.id} -/-> ${room} (${members.length})`);
  });

  // 3) 룸 단위 메시지 브로드캐스트
  socket.on("room:message", ({ room, msg }) => {
    const payload = {
      room,
      from: socket.id,
      nickname: socket.data.nickname || null,
      msg,
      ts: Date.now(),
    };
    // 보낸 사람 포함해 받으려면 io.to(room).emit(...)
    // 보낸 사람 제외 브로드캐스트는 socket.to(room).emit(...)
    io.to(room).emit("room:message", payload);
  });

  // 4) 현재 참여 룸 목록 요청
  socket.on("room:list-my", () => {
    socket.emit("room:list-my:res", { rooms: getJoinedRooms(socket) });
  });

  // 5) 특정 룸 멤버 조회
  socket.on("room:list-members", ({ room }) => {
    socket.emit("room:list-members:res", {
      room,
      members: getRoomMembers(room),
    });
  });

  // 연결 종료 처리
  socket.on("disconnect", (reason) => {
    // socket.rooms 에 남아있는 룸에 대해 퇴장 알림
    for (const room of getJoinedRooms(socket)) {
      const members = getRoomMembers(room).filter((id) => id !== socket.id);
      socket.to(room).emit("room:user-left", {
        room,
        userId: socket.id,
        members,
      });
    }
    console.log(`[disc] ${socket.id} (${reason})`);
  });
});

// 상태 체크용 HTTP 엔드포인트(선택)
app.get("/", (_req, res) => res.send("WS OK"));

const PORT = process.env.WS_PORT || 28086;
httpServer.listen(PORT, () => {
  console.log(`WS listening on :${PORT}`);
});

/*
확장(멀티 인스턴스, 수평 확장) 시:
  import { createAdapter } from "@socket.io/redis-adapter";
  import { createClient } from "redis";
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
*/
