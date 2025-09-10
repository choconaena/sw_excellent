import json
from elasticsearch import Elasticsearch
import os

def esdbSearch(stt_id, file_path):
    # 1. Elasticsearch 연결
    es = Elasticsearch(
        "https://211.188.55.88:9200",
        basic_auth=("elastic", "Ayki+Ix7vuhHqsailf8h"),
        verify_certs=False
    )

    # 2. 인덱스 및 문서 ID 설정
    stt_index = "summarized-stt-vector"
    policy_index = "welfare_policies_vector"
    stt_doc_id = stt_id

    # 3. STT 임베딩 벡터 가져오기
    stt_res = es.get(index=stt_index, id=stt_doc_id)
    query_vector = stt_res["_source"]["embedding"]

    # 4. 복지 정책 코사인 유사도 기반 상위 10개 검색
    query = {
        "size": 10,
        "query": {
            "script_score": {
                "query": {"match_all": {}},
                "script": {
                    "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                    "params": {"query_vector": query_vector}
                }
            }
        }
    }
    res = es.search(index=policy_index, body=query)

    # 5. embedding 필드 제거
    top_10_cleaned = []
    for hit in res["hits"]["hits"]:
        source = hit["_source"].copy()
        source.pop("embedding", None)  # embedding 필드 제거
        source["score"] = hit["_score"]  # 유사도 점수는 추가
        top_10_cleaned.append(source)

    # 6. 저장 경로
    save_dir = "/mnt/a/policy_recommandation"
    os.makedirs(save_dir, exist_ok=True)
    save_path = os.path.join(save_dir, f"policy_rec_{file_path}")

    # 7. JSON 저장
    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(top_10_cleaned, f, ensure_ascii=False, indent=2)

    print(f"✅ 상위 10개 정책이 {save_path}에 저장되었습니다.")
    return True
