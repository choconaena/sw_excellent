#/home/BackEnd/AI/funcs/stt_AI/server.py
# -*- coding: utf-8 -*-
"""
실시간 한국어 STT 서버 (FSM / MFCC+RMS 기반 최종 결과 업데이트)
- Whisper 기반 ASR (모델: "openai/whisper-large-v3-turbo")
- STTProcessor (WhisperSTT 클래스)은 오디오 청크를 누적하고,  
  실제 발화 구간이 감지되었을 경우에만 Whisper 전사를 호출하여 최종 결과를 업데이트합니다.
- 최종 결과는 "[N번문장]: 전사 결과"로 나타나며,  
  터미널 로그에는 매 번 최신 결과가 출력되고, 파일에는 해당 문장 번호의 결과가 덮어쓰기 방식으로 업데이트됩니다.
- WebSocket 서버: ws://0.0.0.0:8085
"""

import asyncio
import websockets
import wave
import os
from datetime import datetime
import torch
import json
import re
import aiohttp  # 상단 import에 추가
import requests
import json

# multiple text in same sentence
# from my_whisper_real_time import WhisperSTT

from my_whisper import WhisperSTT

os.environ["CUDA_VISIBLE_DEVICES"] = "0"

device = "cuda" if torch.cuda.is_available() else "cpu"
SAMPLE_RATE = 16000
HOST = "0.0.0.0"
PORT = 8085

model_path = "/model/my_whisper"

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
    ########################################################
    # 요약 시작 - AI 요약 서버에 POST 요청
    ai_summary_api = "https://safe-hi.xyz/db/update_visit_category"  # 실제 요약 API 주소로 수정

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
    ########################################################

    await unregister_client(client_id)

async def handle_client(websocket, path=None):
    client_id = await register_client(websocket)

    # ─── 1. 메타데이터 수신 ───
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
    
    # ─── 연결별 WhisperSTT 인스턴스 생성 & 모델 로드 ───
    #### 0626juntheworld
    stt_processor = WhisperSTT(
        model_path=model_path,
        device=device,
        sample_rate=SAMPLE_RATE, #16000
        partial_interval=1.0,
        min_seg_duration=1.0,
        silence_duration=0.5,
        rms_threshold=-50.0,
        var_threshold=20.0,
        vad_mode=2
    )
    # 모델 로드 완료 메시지 전송
    await websocket.send(f"STT AI 모델 로드 완료 !! 대화가 곧 시작됩니다 :) report id : {reportid}")
    print(f"[{client_id}] STT 모델 로드 완료 메시지 전송")

    # --- before creating files, ensure upload directory exists ---
    base_dir = "/new_data"                                 # 고정 경로
    upload_dir = os.path.join(base_dir, "upload3")          # /new_data/upload
    os.makedirs(upload_dir, exist_ok=True)                 # 디렉터리 없으면 생성

    # 각 클라이언트별 파일명
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    wav_file = os.path.join(upload_dir, f"received_audio_{client_id}_{timestamp}.wav")
    txt_file = os.path.join(upload_dir, f"transcript_{client_id}_{timestamp}.txt")
    txt_file = os.path.abspath(os.path.join(upload_dir, f"transcript_{client_id}_{timestamp}.txt"))
    
    print("txt_file : ", txt_file)
    ########################################################
    # VisitReport DB Update 
    stt_update_api = "https://safe-hi.xyz/db/update_stt_path"  # 실제 백엔드 API 주소로 변경
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
    ########################################################

    wf = wave.open(wav_file, "wb")
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE) #16000

    # 텍스트 파일 핸들러 준비 (append 모드)
    tf = open(txt_file, "a", encoding="utf-8")

    try:
        async for audio_chunk in websocket:
            ##### 0626 juntheworld #####
            events = stt_processor.process_chunk(audio_chunk)
            for evt in events:
                text = evt["text"]

                if "[무음]" in text:
                    continue

                cleaned_text = re.sub(r"\[\d+번문장\]:\s*", "", text)
                # 같은 글자 연속 반복 6회 초과시 "..."으로 치환
                cleaned_text = re.sub(r'(.)\1{5,}', r'\1\1\1\1\1\1 ...', cleaned_text)
                print(f"[SEND to {client_id}] {cleaned_text}")

                # txt 파일에 기록
                tf.write(cleaned_text + "\n")
                tf.flush()
                
                # 전사 결과 클라이언트로 전송
                await websocket.send(cleaned_text)

    except websockets.exceptions.ConnectionClosed:
        print(f"클라이언트 {client_id} 접속 종료됨.")
    finally:
        wf.close()
        await start_summary(txt_file, reportid, email, client_id)

async def main():
    async with websockets.serve(handle_client, HOST, PORT):
        print(f"서버가 ws://{HOST}:{PORT} 대기중...")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
