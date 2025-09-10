import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor
# 모델 ID와 저장 경로 설정
model_id = "openai/whisper-large-v3"
pkl_save_path = "../model/whisper_full_model.pkl"
# 모델과 프로세서 로드
model = AutoModelForSpeechSeq2Seq.from_pretrained(model_id)
processor = AutoProcessor.from_pretrained(model_id)
# 직렬화 객체 생성
data_to_save = {
    "model": model,                # 모델 객체 전체
    "processor": processor,        # 프로세서 객체 전체
    "config": model.config,        # 모델 설정
    "tokenizer": processor.tokenizer,  # 토크나이저 설정
}
# .pkl 파일로 저장
torch.save(data_to_save, pkl_save_path)
print(f"모델과 프로세서가 {pkl_save_path}에 저장되었습니다.")