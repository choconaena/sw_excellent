// for test DONOT SEND ANY DATA OTHER ROOM!!!!!!!!!!
import { io } from "socket.io-client";

const SERVER = process.env.WS_SERVER || "http://localhost:8086";

const ROOM = process.env.ROOM || "test2@naver.com";
const NICK = process.env.NICK || "app";

const socket = io(SERVER, { transports: ["websocket"] });

socket.on("connect", () => {
  console.log(`✅ bot connected: ${socket.id}`);
  socket.emit("room:join", { room: ROOM, nickname: NICK });
});

socket.on("room:joined", (p) => {
    console.log("[room:joined]:", p);
    socket.emit("room:message", {
        room: ROOM,
        msg: `ping from ${NICK} @ ${new Date().toISOString()}`,
    });
});

socket.on("room:message", (p) => console.log("[room:message]:", p));
socket.on("room:user-joined", (p) => console.log("[room:user-joined]:", p));
socket.on("room:user-left", (p) => console.log("[room:user-left]:", p));
socket.on("disconnect", (r) => console.log("❎ bot disconnected:", r));
