// bot.js
import { io } from "socket.io-client";
import readline from "node:readline";

const SERVER = process.env.WS_SERVER || "http://localhost:8086";

const ROOM = process.env.ROOM || "jun@test.com";
const NICK = process.env.NICK || "web";

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

// ==================================== user interaction ===================================


// ---------- CLI ----------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${NICK}@${ROOM}> `
});

function help() {
  console.log(`
Commands:
  help
    Show this help.

  say <text>
    Broadcast plain text to room (legacy string msg).

  data <jsonString> [targetNick=web]
    Send data JSON to web (or chosen nick): wraps to {msg_type:"data", content:parsed}
`);
}

function emitRoomMessage(msg) {
  socket.emit("room:message", { room: ROOM, msg });
}

function parseLine(line) {
  const args = line.trim();
  if (!args) return;

  const [cmd, ...rest] = splitArgs(args);

  switch ((cmd || "").toLowerCase()) {
    case "help":
    case "?":
      help();
      break;

    case "page_move": {
      // 테스트용 하드코딩 JSON
      const content = {
        content: { "dst": "/login" },
        timestamp: new Date().toISOString()
      };

      const msg = {
        msg_type: "page_move",
        content
      };

      emitRoomMessage(msg);
      break;
    }

    case "data": {
      // 테스트용 하드코딩 JSON
      const content = {
        content: { "name": "test" },
        timestamp: new Date().toISOString()
      };

      const msg = {
        msg_type: "data",
        content
      };

      emitRoomMessage(msg);
      break;
    }
    
    case "stt_open": {
      // 테스트용 하드코딩 JSON
      const content = {
        content: { "status": true },
        timestamp: new Date().toISOString()
      };

      const msg = {
        msg_type: "stt_open",
        content
      };

      emitRoomMessage(msg);
      break;
    }
    
    case "abstract_open": {
      // 테스트용 하드코딩 JSON
      const content = {
        content: { "status": true },
        timestamp: new Date().toISOString()
      };

      const msg = {
        msg_type: "abstract_open",
        content
      };

      emitRoomMessage(msg);
      break;
    }
    
    case "sign_done": {
      // 테스트용 하드코딩 JSON
      const content = {
        content: null,
        timestamp: new Date().toISOString()
      };

      const msg = {
        msg_type: "sign_done",
        content
      };

      emitRoomMessage(msg);
      break;
    }

    default:
      // Default: treat as plain text
      emitRoomMessage(args);
      break;
  }
}

// simple argv splitter: supports quotes
function splitArgs(s) {
  const out = [];
  let cur = "";
  let quote = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quote) {
      if (ch === quote) { quote = null; }
      else { cur += ch; }
    } else {
      if (ch === '"' || ch === "'") { quote = ch; }
      else if (/\s/.test(ch)) { if (cur) { out.push(cur); cur = ""; } }
      else { cur += ch; }
    }
  }
  if (cur) out.push(cur);
  return out;
}

function cleanupAndExit() {
  try { rl.close(); } catch {}
  try { socket.close(); } catch {}
  process.exit(0);
}


// ---------- CLI loop ----------
help();
rl.prompt();
rl.on("line", (line) => {
  try { parseLine(line); }
  catch (e) { console.log("Error:", e?.message || e); }
  rl.prompt();
});
rl.on("SIGINT", cleanupAndExit);
rl.on("close", cleanupAndExit);