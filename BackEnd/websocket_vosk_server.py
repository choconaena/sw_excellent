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
            reconized_text = 'result_by_byungmin'
            # if recognizer.AcceptWaveform(audio_chunk):
            #     result = recognizer.Result()  # 최종 결과
            #     result_dict = json.loads(result)
            #     recognized_text = result_dict.get("text", "")
            # else:
            #     partial_result = recognizer.PartialResult()  # 중간 결과
            #     result_dict = json.loads(partial_result)
            #     recognized_text = result_dict.get("partial", "")
            #     print(recognized_text)
            
            # 인식 결과를 클라이언트로 전송
            # json 형태로 예쁘게 보내줘야함
            # 여기서 DB에도 저장 => 어떻게 저장?? 흐...
            await websocket.send(recognized_text)
    except websockets.exceptions.ConnectionClosed:
        print("클라이언트 접속 종료됨.")
    finally:
        wf.close()  # 파일을 닫아 WAV 파일을 정상적으로 마무리

async def main():
    async with websockets.serve(handle_client, "0.0.0.0", 23002):
        print("서버가 ws://localhost:23002 에서 대기중...")
        await asyncio.Future()  # 서버가 계속 실행되도록 무한 대기

if __name__ == "__main__":
    asyncio.run(main())
