import asyncio
import websockets
import pyaudio
import speech_recognition as sr
from transformers import pipeline
import json

# 발화자 구분 함수
def assign_to_speaker(text):
    if len(speaker_1_text) == len(speaker_2_text):
        speaker_1_text.append(text)
    else:
        speaker_2_text.append(text)

# 문법 교정 함수
def gec_correct(sentence):
    try:
        corrected = corrector(sentence)[0]['generated_text']
        return corrected if corrected.strip() else sentence
    except Exception as e:
        print(f"Error during correction: {e}")
        return sentence

# STT 함수
def stt_from_audio(audio_data):
    try:
        # AudioData를 이용한 음성 텍스트 변환
        text = recognizer.recognize_google(audio_data, language='ko-KR')
        corrected_text = gec_correct(text)
        assign_to_speaker(corrected_text)
        return corrected_text
    except sr.UnknownValueError:
        return "Could not understand audio."
    except sr.RequestError as e:
        return f"API error: {e}"

# WebSocket 서버 핸들러
async def audio_handler(websocket, path):
    print("start audio handle")

    async for message in websocket:
        # 음성 데이터 메시지를 AudioData 객체로 변환
        audio_data = sr.AudioData(message, RATE, 2)
        
        # STT 및 문법 교정 실행
        response_text = stt_from_audio(audio_data)

        # 결과를 클라이언트에 전송
        await websocket.send(json.dumps({"text": response_text}))
        
        # 상담 종료 조건 확인
        if "상담" in response_text and "종료" in response_text:
            await websocket.send(json.dumps({"message": "상담 종료 문구 인식됨. 세션을 종료합니다."}))
            save_to_file()  # 대화 내용 저장
            break

# 대화 내용 파일 저장
def save_to_file():
    with open('conversation_log.txt', 'w') as f:
        f.write("발화자 1:\n")
        f.write("\n".join(speaker_1_text))
        f.write("\n\n발화자 2:\n")
        f.write("\n".join(speaker_2_text))
    print("대화 내용이 conversation_log.txt에 저장되었습니다.")

# 발화자 텍스트 저장용 리스트
speaker_1_text = []
speaker_2_text = []

# 전역 인식기 및 문법 교정기 초기화
recognizer = sr.Recognizer()
recognizer.pause_threshold = 2
corrector = pipeline("text2text-generation", model="prithivida/grammar_error_correcter_v1", max_new_tokens=50)

# 발화자 텍스트 저장용 리스트
speaker_1_text = []
speaker_2_text = []

FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK = 1024

# WebSocket 서버 시작
start_server = websockets.serve(audio_handler, "localhost", 8765)

# 비동기 이벤트 루프 실행
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
