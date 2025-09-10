#/home/BackEnd/AI/funcs/stt_AI/server_wss.py
# -*- coding: utf-8 -*-
"""
실시간 한국어 STT 서버 (FSM / MFCC+RMS 기반 최종 결과 업데이트)
- Whisper 기반 ASR
- 최종 결과는 "[N번문장]: 전사 결과" 형식으로 누적/갱신
- WebSocket 서버: wss://0.0.0.0:8085
"""

import asyncio
import websockets
import wave
import os
from datetime import datetime
import torch
import json
import re
import aiohttp
import requests
import ssl  # TLS/WSS 추가

# from my_whisper_real_time import WhisperSTT
from my_whisper import WhisperSTT

os.environ["CUDA_VISIBLE_DEVICES"] = "0"

device = "cuda" if torch.cuda.is_available() else "cpu"
SAMPLE_RATE = 16000
HOST = "0.0.0.0"
PORT = 8084

model_path = "/model/my_whisper"

# ───────── TLS 설정(하드코딩) ─────────
# Let's Encrypt 운영 경로 예시
CERT_FILE = "/etc/letsencrypt/live/safe-hi.xyz/fullchain.pem"
KEY_FILE  = "/etc/letsencrypt/live/safe-hi.xyz/privkey.pem"

# 개발용 self-signed를 쓸 경우(예시):
# CERT_FILE = "./cert.pem"
# KEY_FILE  = "./key.pem"

ssl_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_ctx.load_cert_chain(certfile=CERT_FILE, keyfile=KEY_FILE)
# 강한 보안 설정(필요시 조정)
ssl_ctx.options |= ssl.OP_NO_TLSv1 | ssl.OP_NO_TLSv1_1

# 전역 클라이언트 관리용
clients = {}

async def register_client(websocket):
    client_id = f"{websocket.remote_address[0]}_{websocket.remote_address[1]}"
    clients[client_id] = websocket
    print(f"클라이언트 등록됨: {client_id}")
    return client_id

async def unregister_client(client_id):
    if client_id in clients:
        del clients[client_id]
        print(f"클라이언트 해제됨: {client_id}")

async def start_summary(txt_file, reportid, email, client_id):
    print("txt_file in server: ", txt_file)
    ai_summary_api = "https://safe-hi.xyz/db/update_visit_category"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(ai_summary_api, json={
                "reportid": reportid,
                "email": email,
                "txt_file": txt_file
            }) as resp:
                resp_json = await resp.json()
                print(f"[{client_id}] AI 요약 응답: {resp.status} {resp_json}")
    except Exception as e:
        print(f"[{client_id}] AI 요약 요청 실패: {e}")

    await unregister_client(client_id)

async def handle_client(websocket, path=None):
    client_id = await register_client(websocket)

    # 1) 메타데이터 수신
    try:
        init_msg = await websocket.recv()
        metadata = json.loads(init_msg)
        reportid = metadata.get("reportid")
        email = metadata.get("email")
        print(f"[{client_id}] 연결 메타데이터 수신: reportid={reportid}, email={email}")
    except Exception as e:
        print(f"[{client_id}] 메타데이터 수신 실패: {e}")
        await websocket.close()
        return
    
    # 2) STT 인스턴스 생성
    stt_processor = WhisperSTT(
        model_path=model_path,
        device=device,
        sample_rate=SAMPLE_RATE,
        partial_interval=1.0,
        min_seg_duration=1.0,
        silence_duration=0.5,
        rms_threshold=-50.0,
        var_threshold=20.0,
        vad_mode=2
    )

    await websocket.send(f"STT AI 모델 로드 완료 !! 대화가 곧 시작됩니다 :) report id : {reportid}")
    print(f"[{client_id}] STT 모델 로드 완료 메시지 전송")

    # 3) 저장 경로 구성
    base_dir   = "/new_data"
    upload_dir = os.path.join(base_dir, "upload3")
    os.makedirs(upload_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    wav_file = os.path.join(upload_dir, f"received_audio_{client_id}_{timestamp}.wav")
    txt_file = os.path.abspath(os.path.join(upload_dir, f"transcript_{client_id}_{timestamp}.txt"))

    print("txt_file : ", txt_file)

    # VisitReport DB Update
    stt_update_api = "https://safe-hi.xyz/db/update_stt_path"
    update_payload = {
        "reportid": reportid,
        "email": email,
        "newPath": txt_file
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.patch(stt_update_api, json=update_payload) as resp:
                resp_json = await resp.json()
                print(f"[{client_id}] STT 업데이트 응답: {resp.status} {resp_json}")
    except Exception as e:
        print(f"[{client_id}] STT 업데이트 요청 실패: {e}")

    # WAV 준비(필요 없으면 제거 가능)
    wf = wave.open(wav_file, "wb")
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)

    # 텍스트 파일 핸들러
    tf = open(txt_file, "a", encoding="utf-8")

    try:
        async for audio_chunk in websocket:
            # audio_chunk는 바이너리(PCM)라고 가정
            # 필요 시 녹음 파일에 저장하려면 아래 주석 해제
            # wf.writeframes(audio_chunk)

            events = stt_processor.process_chunk(audio_chunk)
            for evt in events:
                text = evt["text"]
                if "[무음]" in text:
                    continue

                cleaned_text = re.sub(r"\[\d+번문장\]:\s*", "", text)
                cleaned_text = re.sub(r'(.)\1{5,}', r'\1\1\1\1\1\1 ...', cleaned_text)
                print(f"[SEND to {client_id}] {cleaned_text}")

                tf.write(cleaned_text + "\n")
                tf.flush()

                await websocket.send(cleaned_text)

    except websockets.exceptions.ConnectionClosed:
        print(f"클라이언트 {client_id} 접속 종료됨.")
    finally:
        try:
            wf.close()
        except Exception:
            pass
        try:
            tf.close()
        except Exception:
            pass
        await start_summary(txt_file, reportid, email, client_id)

async def main():
    # WSS 서버 기동
    async with websockets.serve(
        handle_client,
        HOST,
        PORT,
        ssl=ssl_ctx,  # ← TLS 적용
        max_size=None,  # 필요 시 청크 최대 크기 조정
        compression=None  # 오디오 스트림이면 압축 비권장
    ):
        print(f"서버가 wss://{HOST}:{PORT} 대기중...")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
