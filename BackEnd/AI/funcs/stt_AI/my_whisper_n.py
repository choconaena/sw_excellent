#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Whisper STT 모듈 (오버랩 + 디코더 컨텍스트 + 반복 억제 + 정규표현식 반복 단어 제거)

- 오디오 청크에 overlap을 넣어 문장 경계 잘림 완화
- 이전 디코더 토큰(decoder_input_ids)을 넣어 문맥 유지
- repetition_penalty, no_repeat_ngram_size로 반복 억제
- 정규표현식으로 동일 단어 3회 이상 반복 제거
"""

import re
import numpy as np
import torch
import time
import webrtcvad
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor
import librosa
import math

def compute_rms_db(audio_np):
    rms = np.sqrt(np.mean(audio_np ** 2))
    if rms < 1e-10:
        return -float("inf")
    return 20 * math.log10(rms)

def is_human_voice(audio_np, sr, n_mfcc=13, var_threshold=20.0):
    mfccs = librosa.feature.mfcc(y=audio_np, sr=sr, n_mfcc=n_mfcc)
    variances = np.var(mfccs, axis=1)
    mean_var = np.mean(variances)
    return (mean_var > var_threshold, mean_var)

def remove_repeated_words(text):
    """
    같은 단어(\b\S+\b)가 공백+자기 자신 형태로 2회 이상(총 3회 이상) 반복될 때,
    반복된 구간 전체를 단어 하나로 축소.
    """
    pattern = re.compile(r'(\b\S+\b)(?:\s+\1){2,}', flags=re.IGNORECASE)
    return pattern.sub(r'\1', text)

class WhisperSTT:
    def __init__(
        self,
        model_path="/home/2020112534/safe_hi/model/my_whisper",
        device="cuda",
        sample_rate=16000,
        min_seg_duration=1.0,
        silence_duration=0.5,
        max_segment_duration=7.0,
        rms_threshold=-50.0,
        var_threshold=20.0,
        vad_mode=2,
        overlap_duration=0.5,      # 초 단위 오버랩
    ):
        self.sample_rate = sample_rate
        self.min_seg_duration = min_seg_duration
        self.silence_duration = silence_duration
        self.max_segment_duration = max_segment_duration
        self.rms_threshold = rms_threshold
        self.var_threshold = var_threshold

        # 오버랩 버퍼
        self.overlap_duration = overlap_duration
        self.context_buffer = bytearray()

        print(f"[INFO] Loading Whisper model from '{model_path}' on {device}")
        self.model = AutoModelForSpeechSeq2Seq.from_pretrained(model_path, local_files_only=True).to(device)
        self.processor = AutoProcessor.from_pretrained(model_path, local_files_only=True)

        # VAD 세팅
        self.vad = webrtcvad.Vad(mode=vad_mode)
        self.frame_duration_ms = 30
        self.vad_frame_bytes = int(self.sample_rate * 2 * self.frame_duration_ms / 1000)

        # 상태 초기화
        self.audio_buffer = bytearray()
        self.sentence_count = 1
        self.last_final_text = ""
        self.segment_start_time = time.time()

        # 디코더 컨텍스트
        self.prev_decoder_input_ids = None

    def process_chunk(self, audio_chunk: bytes):
        events = []

        # 새 세그먼트 시작 때만, 이전 오버랩 컨텍스트를 붙인다
        if len(self.audio_buffer) == 0 and len(self.context_buffer) > 0:
            self.audio_buffer.extend(self.context_buffer)

        # 청크 누적
        self.audio_buffer.extend(audio_chunk)
        now = time.time()

        # VAD 기반 무음 계산
        num_frames = len(self.audio_buffer) // self.vad_frame_bytes
        silence_frames = 0
        for i in range(num_frames):
            frame = self.audio_buffer[i*self.vad_frame_bytes:(i+1)*self.vad_frame_bytes]
            if not self.vad.is_speech(frame, self.sample_rate):
                silence_frames += 1
            else:
                silence_frames = 0
        silence_time = silence_frames * (self.frame_duration_ms / 1000.0)

        # 세그먼트 완료 조건
        if (silence_time >= self.silence_duration) or (now - self.segment_start_time >= self.max_segment_duration):
            duration_sec = len(self.audio_buffer) / (self.sample_rate * 2)

            if duration_sec < self.min_seg_duration:
                events.append({"type":"final", "text":f"[{self.sentence_count}번문장]: [무음]"})
            else:
                audio_np = np.frombuffer(self.audio_buffer, dtype=np.int16).astype(np.float32)/32768.0
                current_db = compute_rms_db(audio_np)
                is_voice, _ = is_human_voice(audio_np, self.sample_rate, var_threshold=self.var_threshold)

                if current_db >= self.rms_threshold and is_voice:
                    final_text = self._whisper_transcribe(self.audio_buffer)
                    # 불필요 반복 제거
                    final_text = remove_repeated_words(final_text)
                    # 중복 검사
                    if final_text and final_text != self.last_final_text:
                        skip = {"응","뭐","뭐야.","감사합니다.","응.","아","흠"}
                        if final_text not in skip:
                            events.append({"type":"final", "text":f"[{self.sentence_count}번문장]: {final_text}"})
                        self.last_final_text = final_text
                    else:
                        events.append({"type":"final", "text":f"[{self.sentence_count}번문장]: [무음]"})
                else:
                    events.append({"type":"final", "text":f"[{self.sentence_count}번문장]: [무음]"})

            # 오버랩을 context_buffer로 보존
            bytes_per_sec = int(self.sample_rate * 2)
            overlap_bytes = int(self.overlap_duration * bytes_per_sec)
            if len(self.audio_buffer) >= overlap_bytes:
                self.context_buffer = self.audio_buffer[-overlap_bytes:]
            else:
                self.context_buffer = self.audio_buffer[:]

            # 초기화
            self.audio_buffer = bytearray()
            self.sentence_count += 1
            self.segment_start_time = time.time()

        return events

    def _whisper_transcribe(self, audio_bytes: bytearray) -> str:
        if not self.model or not self.processor:
            return "<No STT>"

        audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32)/32768.0
        inputs = self.processor(audio_np, sampling_rate=self.sample_rate, return_tensors="pt")
        inputs = {k:v.to(self.model.device) for k,v in inputs.items()}

        # 디코더 반복 제어 파라미터
        gen_kwargs = {
            "max_new_tokens": 100,
            "repetition_penalty": 1.1,
            "no_repeat_ngram_size": 3,
        }
        if self.prev_decoder_input_ids is not None:
            gen_kwargs["decoder_input_ids"] = self.prev_decoder_input_ids

        with torch.no_grad():
            generated_ids = self.model.generate(**inputs, **gen_kwargs)

        # 다음 호출을 위해 보관
        self.prev_decoder_input_ids = generated_ids

        text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()
        return text