import json
import subprocess
import os

def RAG_recommendation(summary_path, top10_path):
    # 1. 파일 경로 설정
    # summary_path = "/mnt/a/복지정책&STT.json 모음/요약 STT 4.json"
    # top10_path = "/mnt/a/복지정책&STT.json 모음/코사인 상위 정책 5 STT 4.json"

    # 2. 요약된 STT 불러오기
    with open(summary_path, "r", encoding="utf-8") as f:
        stt_data = json.load(f)
    stt_summary = stt_data.get("summary", "").strip()

    # 3. 상위 10개 복지 정책 불러오기
    with open(top10_path, "r", encoding="utf-8") as f:
        top_10_policies = json.load(f)

    # 4. 정책 핵심 필드만 추출하여 텍스트 구성 (요약용)
    compact_policy_texts = []

    for i, policy in enumerate(top_10_policies, 1):
        name = policy.get("복지정보명", "").strip()
        target = policy.get("지원 대상", "").strip()
        service = policy.get("서비스 내용", "").strip()
        url = policy.get("페이지 URL", "").strip()

        summary = f"[정책 {i}]\n정책명: {name}\n지원 대상: {target}\n서비스 내용: {service}"
        
        # URL이 있으면 추가 (선택)
        if url:
            summary += f"\n자세히 보기: {url}"

        compact_policy_texts.append(summary)

    # 최종 텍스트로 합치기
    policies_text = "\n\n".join(compact_policy_texts)


    # 5. LLM 프롬프트 구성
    prompt = f"""
    [시스템 역할 안내]

    당신은 노인 상담 전문가이자 사회복지 정책 분석가입니다.  
    아래에 제공된 내담자의 상담 요약과 복지 정책 목록을 기반으로, 내담자의 상황에 가장 적합한 복지 정책을 3가지 추천해 주세요.

    각 추천은 내담자의 고민, 욕구, 심리상태 등을 바탕으로 해야 하며, 정책의 핵심 내용과 내담자의 상황 사이의 연관성을 구체적이고 설득력 있게 설명해야 합니다.

    ---

    [내담자 상담 요약]
    {stt_summary}

    ---

    [복지 정책 목록]
    {policies_text}

    ---

    [과제]

    - 상담 요약 내용을 기반으로 내담자의 핵심 문제를 파악하세요.
    - 복지 정책 목록 중 내담자의 욕구와 문제를 해결하는 데 가장 효과적인 정책 5가지를 선정하세요.
    - 각 정책이 내담자에게 적합한 이유를 **구체적이고 설득력 있게** 설명하세요.
    - 정책과 내담자 상황 간의 **직접적인 연관성**을 강조하세요.

    ---

    [출력 형식]

    1. **정책명:** [정책 이름]  
    **추천 이유:** [정책이 내담자에게 적합한 이유]  
    **자세히 보기:** [URL]

    2. **정책명:** [정책 이름]  
    **추천 이유:** [정책이 내담자에게 적합한 이유]  
    **자세히 보기:** [URL]

    (총 5개 정책을 위와 같은 형식으로 추천)

    ---

    [주의사항]

    - 답변은 반드시 **한글로** 작성하세요.
    - 내담자의 심리적, 사회적, 경제적 상황을 충분히 고려한 **현실적이고 공감 가능한 정책**을 추천하세요.
    - 정책명과 추천 이유는 **명확하게 구분**하여 작성하세요.
    - 너무 일반적인 설명보다는, **상담 요약에 기반한 구체적인 추천 근거**를 포함하세요.

    """

    # 6. Ollama 실행 함수
    def call_ollama(model, prompt):
        command = ["ollama", "run", model, prompt]
        result = subprocess.run(command, capture_output=True, text=True)
        print("Command:", command)
        if result.stderr:
            print("⚠️ 오류:", result.stderr)
        return result.stdout.strip()

    # 7. LLM 호출 및 결과 출력
    response_text = call_ollama("gemma3:4b", prompt)

    print("✅ 최종 추천 결과:")
    print(response_text)
    return response_text
