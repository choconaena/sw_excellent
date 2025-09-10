import json
import subprocess
import os
import sys
from datetime import datetime

# 1. 외부 인자 받기 => python module 화
# if len(sys.argv) < 3:
#     print("사용법: python script.py <stt_id> <original_stt_text>")
#     sys.exit(1)

# stt_id = sys.argv[1]
# original_stt_text = sys.argv[2]

def sttOriginToAbstract(stt_id='1', original_stt_text='test'):
    
    print("get param! ", stt_id, original_stt_text)

    # 2. LLM 프롬프트 구성
    summarization_prompt = f"""
    hi!
    """

    # 3. Ollama CLI를 사용하여 요약 수행
    def call_ollama(model, prompt):
        command = ["ollama", "run", model, prompt]
        result = subprocess.run(command, capture_output=True, text=True)
        if result.stderr:
            print("오류:", result.stderr)
        return result.stdout.strip()

    # 4. 요약 실행
    summary_result = call_ollama("gemma3:12b", summarization_prompt)

    # 5. 저장할 데이터 구성
    summary_data = {
        "stt_id": stt_id,
        "summary": summary_result
    }

    # 6. 저장 경로 및 파일 이름 지정
    save_dir = "/mnt/a/stt_abstractions"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    os.makedirs(save_dir, exist_ok=True)  # 경로가 없으면 생성
    save_path = os.path.join(save_dir, f"abstract_{stt_id}_{timestamp}.json")

    # 7. JSON 파일로 저장
    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(summary_data, f, ensure_ascii=False, indent=2)

    print(f"[완료] 요약된 STT 데이터가 {save_path}에 저장되었습니다.")
    
    return save_path

sttOriginToAbstract()