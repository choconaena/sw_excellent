#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Whisper STT 모듈 (MFCC 및 RMS 기반 필터링, 최종 결과 업데이트)

- 오디오 청크(PCM 16kHz, 16-bit)는 누적되어 처리됩니다.
- WebRTC VAD를 통해 30ms 단위의 프레임에서 무음을 측정하고,
  0.3초 이상의 연속 무음이 감지되면 구간 종료로 판단합니다.
- 누적된 오디오 길이가 1초 미만이면 전사하지 않고 버퍼를 플러시합니다.
- 1초 이상이면, 전체 오디오에 대해 RMS(dBFS)와 Librosa로 계산한 MFCC 평균 분산을 평가합니다.
- RMS가 임계치 (예, -40 dBFS) 이상이며, MFCC 분산이 var_threshold (예, 20.0) 이상이면 실제 발화로 판단하여 Whisper 전사를 호출합니다.
- 전사 결과는 "[N번문장]: 전사 결과" 형식으로 반환하며, 동일 문장 번호의 최종 결과가 반복되지 않도록 합니다.
"""

import numpy as np
import torch
import time
import webrtcvad
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor
import librosa
import math

def compute_rms_db(audio_np):
    """1D numpy 배열(audio_np, float32, -1~1)로부터 RMS를 계산하여 dBFS로 반환"""
    rms = np.sqrt(np.mean(audio_np ** 2))
    if rms < 1e-10:
        return -float("inf")
    return 20 * math.log10(rms)

def is_human_voice(audio_np, sr, n_mfcc=13, var_threshold=20.0):
    """
    Librosa로 MFCC를 추출한 후, 각 계수의 분산을 계산하여 평균 분산(mean_var)을 구합니다.
    mean_var가 var_threshold 이상이면 사람 목소리로 판단합니다.
    Returns: (is_voice, mean_var)
    """
    mfccs = librosa.feature.mfcc(y=audio_np, sr=sr, n_mfcc=n_mfcc)
    variances = np.var(mfccs, axis=1)
    mean_var = np.mean(variances)
    return (mean_var > var_threshold, mean_var)

class WhisperSTT:
    def __init__(
        self,
        model_path="/home/2020112534/safe_hi/model/my_whisper",
        device="cuda",
        sample_rate=16000,
        partial_interval=1.0,         # 1초마다 부분 전사 (터미널 로그용)
        min_seg_duration=1.0,         # 누적 오디오 길이가 1초 미만이면 전사하지 않음
        silence_duration=0.5,         # 0.5초 이상의 연속 무음이면 구간 종료 판단
        max_segment_duration=7.0,     # 구간이 시작된 후 7초가 지날 경우 강제 구간 종료
        rms_threshold=-40.0,          # RMS dBFS 임계치 (예: -40 dBFS 이상)
        var_threshold=20.0,            # MFCC 분산 평균 임계치
        vad_mode=2
    ):
        self.sample_rate = sample_rate
        self.device = device
        self.partial_interval = partial_interval
        self.min_seg_duration = min_seg_duration
        self.silence_duration = silence_duration
        self.max_segment_duration = max_segment_duration
        self.rms_threshold = rms_threshold
        self.var_threshold = var_threshold
        self.vad_mode = vad_mode

        print(f"[INFO] Loading Whisper model from '{model_path}' on {device}")
        self.model = AutoModelForSpeechSeq2Seq.from_pretrained(model_path, local_files_only=True).to(device)
        self.processor = AutoProcessor.from_pretrained(model_path, local_files_only=True)

        # WebRTC VAD 초기화
        self.vad = webrtcvad.Vad(mode=vad_mode)
        self.frame_duration_ms = 30
        self.vad_frame_bytes = int(self.sample_rate * 2 * self.frame_duration_ms / 1000)

        # 내부 상태
        self.audio_buffer = bytearray()
        self.last_partial_time = time.time()
        self.sentence_count = 1
        self.last_final_text = ""  # 중복 결과 방지
        self.segment_start_time = time.time()

    def process_chunk(self, audio_chunk: bytes):
        """
        실시간 오디오 청크를 처리하여 최종 전사 결과만 반환합니다.
          1. 청크를 누적합니다.
          2. 1초마다 부분 전사 결과(진행 중)를 출력할 수 있지만, 최종 결과만 최종 업데이트합니다.
          3. WebRTC VAD로 0.3초 이상의 무음이 감지되면 구간 종료로 판단:
             - 누적 오디오 길이가 1초 미만이면, 전사하지 않고 버퍼 플러시 후 "[무음]" 이벤트 생성.
             - 누적 길이가 1초 이상이면, 전체 오디오의 RMS(dBFS)와 MFCC 평균 분산을 계산하여 조건 만족 시 Whisper 전사를 호출.
          4. 최종 전사 결과가 이전 결과와 동일하지 않을 때만 "final" 이벤트를 반환합니다.
          5. 해당 문장 번호에 대해 최종 결과를 반환하고, 결과는 텍스트 파일에서 덮어쓰기로 유지됩니다.
        반환: 이벤트 리스트 (최종 이벤트만 포함; 예: [{"type": "final", "text": "[1번문장]: ..."}])
        """
        events = []
        self.audio_buffer.extend(audio_chunk)

        # (옵션) 부분 전사: 1초마다 진행 중 결과를 터미널에 출력할 수 있음.
        now = time.time()
        if now - self.last_partial_time >= self.partial_interval:
            part_text = self._whisper_transcribe(self.audio_buffer)
            # 부분 전사는 로그용으로만 활용 (필요 시 이벤트로 남길 수 있음)
            skip_texts = {"뭐", "뭐야.", "감사합니다."}
            
            if part_text not in skip_texts:
                events.append({"type": "partial", "text": f"[{self.sentence_count}번문장]: {part_text}"})
            self.last_partial_time = now

        # WebRTC VAD로 누적 버퍼의 무음 상태 측정
        num_frames = len(self.audio_buffer) // self.vad_frame_bytes
        silence_frames = 0
        for i in range(num_frames):
            frame = self.audio_buffer[i * self.vad_frame_bytes:(i + 1) * self.vad_frame_bytes]
            if not self.vad.is_speech(frame, self.sample_rate):
                silence_frames += 1
            else:
                silence_frames = 0
        silence_time = silence_frames * (self.frame_duration_ms / 1000.0)

        if (silence_time >= self.silence_duration) or (now - self.segment_start_time >= self.max_segment_duration):
            # 구간 종료 판단: 누적 오디오 길이 계산 (초)
            duration_sec = len(self.audio_buffer) / (self.sample_rate * 2)
            if duration_sec < self.min_seg_duration:
                # 1초 미만이면 [무음] 처리
                events.append({"type": "final", "text": f"[{self.sentence_count}번문장]: [무음]"})
                # self.sentence_count += 1
                self.audio_buffer = bytearray()
                return events

            # 누적 오디오 전체에 대해 RMS 및 MFCC 평가
            audio_np = np.frombuffer(self.audio_buffer, dtype=np.int16).astype(np.float32) / 32768.0
            current_db = compute_rms_db(audio_np)
            is_voice, mean_var = is_human_voice(audio_np, self.sample_rate, n_mfcc=13, var_threshold=self.var_threshold)
            
            # 조건이 만족되면 전사, 아니면 [무음]
            if current_db >= self.rms_threshold and is_voice:
                final_text = self._whisper_transcribe(self.audio_buffer)
                if final_text.strip() and final_text.strip() != self.last_final_text:
                    events.append({"type": "final", "text": f"[{self.sentence_count}번문장]: {final_text}"})
                    self.last_final_text = final_text.strip()
                else:
                    events.append({"type": "final", "text": f"[{self.sentence_count}번문장]: [무음]"})
            else:
                events.append({"type": "final", "text": f"[{self.sentence_count}번문장]: [무음]"})
            self.sentence_count += 1
            self.segment_start_time = time.time()
            self.audio_buffer = bytearray()
        return events

    def _whisper_transcribe(self, audio_bytes: bytearray) -> str:
        """
        주어진 오디오 데이터를 Whisper 모델로 전사합니다.
        입력 데이터를 GPU 텐서로 변환하여 전사합니다.
        """
        if self.model is None or self.processor is None:
            return "<No STT>"
        audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        inputs = self.processor(audio_np, sampling_rate=self.sample_rate, return_tensors="pt")
        for k, v in inputs.items():
            inputs[k] = v.to(self.device)
        with torch.no_grad():
            generated_ids = self.model.generate(**inputs)
            text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        return text.strip()