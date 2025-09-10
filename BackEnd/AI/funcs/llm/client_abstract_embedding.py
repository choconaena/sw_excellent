import json
import os
import requests

def abstractEmbedding(summary_path, stt_id):
    # (1) STT 요약 파일 경로
    # We just get this from before LLM function!!! (stt_origin_to_abstract)
    # summary_path = "/mnt/a/복지정책&STT.json 모음/요약 STT 1.json"

    # (2) 요약 텍스트 불러오기
    with open(summary_path, "r", encoding="utf-8") as f:
        summary_data = json.load(f)

    summary_text = summary_data.get("summary", "")
    if not summary_text:
        raise ValueError("요약된 STT 내용이 비어 있습니다. 파일 확인 필요.")

    # (3) Flask 서버에 POST 요청
    res = requests.post("http://localhost:5005/embed", json={"summary": summary_text})
    res_data = res.json()

    if "embedding" not in res_data:
        raise RuntimeError("서버에서 임베딩 결과를 받지 못했습니다.")

    # (4) 결과 저장
    embedding_data = {
        "stt_id": stt_id,
        "summary_text": res_data["summary"],
        "embedding": res_data["embedding"]
    }

    save_dir = "/mnt/a/abstraction_embeddings"
    os.makedirs(save_dir, exist_ok=True)

    save_path = os.path.join(save_dir, f"embedding_{summary_path}")

    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(embedding_data, f, ensure_ascii=False, indent=2)

    print(f"[완료] 임베딩된 STT 요약이 {save_path}에 저장되었습니다.")
    
    return save_path
