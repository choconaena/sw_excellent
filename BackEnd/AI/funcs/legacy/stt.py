import pyaudio
import wave
import speech_recognition as sr
from transformers import pipeline
import sys
import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# 기본 설정
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK = 1024
audio = pyaudio.PyAudio()

recognizer = sr.Recognizer()

recognizer.pause_threshold = 2  # 음성이 멈추는 간격을 2초로 설정
corrector = pipeline("text2text-generation", model="prithivida/grammar_error_correcter_v1", max_new_tokens=50)

# 발화자 텍스트 저장용 리스트
speaker_1_text = []
speaker_2_text = []

def record_audio(file_name):
    print(f"Recording {file_name}...")

    with sr.Microphone(sample_rate=RATE, chunk_size=CHUNK) as source:
        recognizer.adjust_for_ambient_noise(source)
        print("Recording... Start speaking.")
        audio_data = recognizer.listen(source)  # phrase_time_limit 제거
        
        with open(file_name, "wb") as f:
            f.write(audio_data.get_wav_data())
    
    print(f"Saved {file_name}")
    stt_from_audio(file_name)

def stt_from_audio(file_name):
    try:
        with sr.AudioFile(file_name) as source:
            audio = recognizer.record(source)
            text = recognizer.recognize_google(audio, language='ko-KR')
            print(f"Text from {file_name}: {text}")

            corrected_text = gec_correct(text)
            print(f"Corrected Text: {corrected_text}")

            # 발화자 구분
            assign_to_speaker(corrected_text)

            # 종료 문구 확인
            if "상담" in corrected_text and "종료" in corrected_text:
                print("상담 종료 문구가 인식되었습니다. 프로그램을 종료합니다.")
                save_to_file()  # 파일 저장
                sys.exit()

    except sr.UnknownValueError:
        print(f"Could not understand audio in {file_name}.")
    except sr.RequestError as e:
        print(f"API error for {file_name}: {e}")

def gec_correct(sentence):
    try:
        corrected = corrector(sentence)[0]['generated_text']
        return corrected if corrected.strip() else sentence  # 교정된 텍스트가 비어 있으면 원본 문장 반환
    except Exception as e:
        print(f"Error during correction: {e}")
        return sentence  # 교정에 실패하면 원본 문장 반환


def assign_to_speaker(text):
    # 간단한 규칙에 따라 발화자를 구분 (여기서는 번갈아가며)
    if len(speaker_1_text) == len(speaker_2_text):
        speaker_1_text.append(text)
    else:
        speaker_2_text.append(text)

def save_to_file():
    # 발화자 구분 텍스트를 하나의 파일로 저장
    with open('conversation_log.txt', 'w') as f:
        f.write("발화자 1:\n")
        f.write("\n".join(speaker_1_text))
        f.write("\n\n발화자 2:\n")
        f.write("\n".join(speaker_2_text))
    print("대화 내용이 conversation_log.txt에 저장되었습니다.")

# 음성 활동 감지를 통해 녹음 제어
file_index = 1
while True:
    print("recording count : ", file_index)
    file_name = f"output_{file_index}.wav"
    record_audio(file_name)
    file_index += 1
