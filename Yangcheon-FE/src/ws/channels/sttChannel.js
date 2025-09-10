// src/ws/channels/sttChannel.js
// STT 채널: 연결 직후 reportid/email 메타 전송, 이후 수신 텍스트를 콜백으로 전달
export function createSttChannel(client, { reportid, email, onText }) {
  // --- 내부 리소스 핸들 ---
  let audioContext = null;
  let micStream = null;
  let sourceNode = null;
  let workletNode = null;
  let workletUrl = null;

  // 인라인 AudioWorklet(48k Float32 → 16k Int16LE)
  const makeInlineWorkletUrl = () => {
    const workletCode = `
      class PCM16Worklet extends AudioWorkletProcessor {
        constructor() {
          super();
          this.targetRate = 16000;
          this.srcRate = sampleRate;         // AudioContext의 실제 샘플레이트(보통 48000)
          this.ratio = this.srcRate / this.targetRate;
          this._residual = new Float32Array(0); // 경계 샘플 누적
        }

        _concatFloat32(a, b) {
          const out = new Float32Array(a.length + b.length);
          out.set(a, 0); out.set(b, a.length);
          return out;
        }

        // 간단한 선형보간 다운샘플러
        _downsampleTo16k(input) {
          const inLen = input.length;
          const outLen = Math.floor(inLen / this.ratio);
          if (outLen <= 0) return null;
          const out = new Float32Array(outLen);
          for (let i = 0; i < outLen; i++) {
            const idx = i * this.ratio;
            const i0 = Math.floor(idx);
            const i1 = Math.min(i0 + 1, inLen - 1);
            const frac = idx - i0;
            out[i] = input[i0] * (1 - frac) + input[i1] * frac;
          }
          return out;
        }

        _floatToInt16LE(f32) {
          const i16 = new Int16Array(f32.length);
          for (let i = 0; i < f32.length; i++) {
            let s = f32[i];
            if (s > 1) s = 1; else if (s < -1) s = -1;
            i16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          return i16;
        }

        process(inputs) {
          const input = inputs[0];
          if (!input || input.length === 0 || !input[0]) return true;

          // mono only
          const ch0 = input[0];

          // 이전 처리에서 남은 경계 샘플과 현재 프레임을 이어 붙여 리샘플링 안정화
          const merged = this._concatFloat32(this._residual, ch0);
          const outF32 = this._downsampleTo16k(merged);
          if (outF32 && outF32.length) {
            // 다음 라운드를 위한 residual 재계산:
            // 사용된 입력 샘플 수 ≈ outLen * ratio
            const used = Math.min(merged.length, Math.floor(outF32.length * this.ratio));
            const remain = merged.subarray(used);
            this._residual = new Float32Array(remain.length);
            this._residual.set(remain);

            const i16 = this._floatToInt16LE(outF32);
            // 복사 없이 Transfer
            this.port.postMessage(i16.buffer, [i16.buffer]);
          } else {
            // 충분한 샘플이 누적될 때까지 residual 유지
            this._residual = merged;
          }

          return true;
        }
      }
      registerProcessor('pcm16-worklet', PCM16Worklet);
    `;
    return URL.createObjectURL(
      new Blob([workletCode], { type: "application/javascript" })
    );
  };

  const startMic = async (ws) => {
    // 1) AudioContext + Worklet 로드
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    workletUrl = makeInlineWorkletUrl();
    await audioContext.audioWorklet.addModule(workletUrl);

    // 2) 마이크 스트림
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 48000, // 브라우저 기본(대개 48k), Worklet에서 16k로 다운샘플
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    // 3) Graph 구성: mic -> worklet
    sourceNode = audioContext.createMediaStreamSource(micStream);
    workletNode = new AudioWorkletNode(audioContext, "pcm16-worklet");

    // 4) Worklet 출력(16k Int16LE)을 WS로 전송
    workletNode.port.onmessage = (e) => {
      const buf = e.data; // ArrayBuffer(Int16)
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      // 실시간성 우선: 버퍼가 많이 쌓이면 드롭
      if (ws.bufferedAmount > 1_000_000) return;
      ws.send(buf);
    };

    sourceNode.connect(workletNode);
    // 청취 모니터링이 필요 없으면 destination 연결 생략
    // workletNode.connect(audioContext.destination);

    console.log(
      `🎙️ 마이크 캡처 시작: ${audioContext.sampleRate} Hz → 16000 Hz Int16LE`
    );
  };

  const stopMic = () => {
    try {
      sourceNode?.disconnect();
    } catch (e) {
      void e;
    }
    try {
      workletNode?.disconnect();
    } catch (e) {
      void e;
    }
    micStream?.getTracks()?.forEach((t) => t.stop());
    try {
      audioContext?.close();
    } catch (e) {
      void e;
    }

    sourceNode = null;
    workletNode = null;
    micStream = null;
    audioContext = null;

    if (workletUrl) {
      URL.revokeObjectURL(workletUrl);
      workletUrl = null;
    }
  };

  const handleOpen = async () => {
    const metadata = { reportid, email };
    client.send(JSON.stringify(metadata));
    console.log("📤 메타데이터 전송 완료:", metadata);

    // 서버는 raw PCM(16k, mono, Int16)을 기대 → AudioWorklet 파이프라인 시작
    try {
      await startMic(client.instance);
    } catch (e) {
      console.error("마이크 파이프라인 시작 실패:", e);
    }
  };

  const handleMessage = (event) => {
    const data = event.data; // 서버 전사 텍스트
    console.log("📥 메시지 수신:", data);
    onText?.(data);
  };

  // 핸들러 바인딩
  const ws = client.instance;
  if (ws) {
    ws.addEventListener("open", handleOpen);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", stopMic);
    ws.addEventListener("error", stopMic);
  }

  // 언바인드 함수 반환(리소스 정리 포함)
  return () => {
    if (!ws) return;
    ws.removeEventListener("open", handleOpen);
    ws.removeEventListener("message", handleMessage);
    ws.removeEventListener("close", stopMic);
    ws.removeEventListener("error", stopMic);
    stopMic();
  };
}
