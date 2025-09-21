# stream to wav success! 4.2 (result.wav)
import asyncio
import websockets
import json
import wave
from vosk import Model, KaldiRecognizer

# Vosk 모델 초기화 (모델 경로를 환경에 맞게 설정하세요)
model = Model("model")
recognizer = KaldiRecognizer(model, 16000)

async def handle_client(websocket, path=None):
    print("클라이언트 접속됨.")
    # WAV 파일을 생성 (16kHz, 16비트, 모노)
    wf = wave.open("result.wav", "wb")
    wf.setnchannels(1)        # 모노 채널
    wf.setsampwidth(2)        # 16비트 = 2바이트
    wf.setframerate(16000)    # 16kHz 샘플레이트

    try:
        async for audio_chunk in websocket:
            # 수신한 오디오 청크를 WAV 파일에 기록
            wf.writeframes(audio_chunk)
            
            # Vosk를 이용해 STT 처리
            
    except websockets.exceptions.ConnectionClosed:
        print("클라이언트 접속 종료됨.")
    finally:
        wf.close()  # 파일을 닫아 WAV 파일을 정상적으로 마무리

async def main():
    async with websockets.serve(handle_client, "0.0.0.0", 23000):
        print("서버가 ws://localhost:23000 에서 대기중...")
        await asyncio.Future()  # 서버가 계속 실행되도록 무한 대기

if __name__ == "__main__":
    asyncio.run(main())
