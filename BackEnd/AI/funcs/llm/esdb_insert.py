# We need python 3.8!!
# /mnt/a/Python-3.8.10/python

import json
from elasticsearch import Elasticsearch
import os

def esInsert(stt_id, json_file_path):
    # 1. Elasticsearch 연결 (비밀번호 포함)
    es = Elasticsearch(
        "https://211.188.55.88:9200",
        basic_auth=("elastic", "Ayki+Ix7vuhHqsailf8h"),
        verify_certs=False  # SSL 인증 무시
    )

    # 2. JSON 파일 경로
    # json_file_path = "/mnt/a/복지정책&STT.json 모음/임베딩 STT 4.json"
    if not os.path.exists(json_file_path):
        raise FileNotFoundError(f"파일이 존재하지 않습니다: {json_file_path}")

    # 3. JSON 로드
    with open(json_file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # ✅ 필수 필드 검증
    if "summary_text" not in data or "embedding" not in data:
        raise ValueError("필수 필드(summary_text, embedding)가 JSON에 없습니다.")

    # 4. Elasticsearch 인덱스 이름
    index_name = "summarized-stt-vector"

    # 5. 인덱스 존재 여부 확인 및 생성
    if not es.indices.exists(index=index_name):
        print(f"🔹 {index_name} 인덱스가 없으므로 새로 생성합니다.")
        index_mapping = {
            "settings": {"number_of_shards": 1, "number_of_replicas": 1},
            "mappings": {
                "properties": {
                    "user_query": {"type": "text"},
                    "embedding": {"type": "dense_vector", "dims": 1024}
                }
            }
        }
        es.indices.create(index=index_name, body=index_mapping)
        print(f"✅ {index_name} 인덱스 생성 완료!")

    # 6. 저장할 데이터 가공
    doc_id = data.get("stt_id", stt_id) 
    es_doc = {
        "user_query": data["summary_text"],
        "embedding": data["embedding"]
    }

    # 7. Elasticsearch에 문서 저장
    es.index(index=index_name, id=doc_id, body=es_doc)
    print(f"✅ 요약 임베딩 데이터가 인덱스 [{index_name}]의 ID [{doc_id}]로 저장되었습니다.")

    return True

esInsert("39", "/mnt/a/abstraction_embeddings/embedding_.json")