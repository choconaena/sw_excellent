from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# 1) 모델 및 토크나이저 로드
model_name = "gpt2"  # 여기서는 GPT2 예시
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)
model.to("cuda" if torch.cuda.is_available() else "cpu")

# 2) 사용자 대화 -> 정보 추출
# (실제로는 NER 또는 추가 로직이 들어가야 함)
conversation_text = """
안녕하세요. 저는 63살이구요...
월소득은 약 200만원 정도 돼요.
가족은 아내와 둘이 삽니다.
만성질환이 있어서 병원비 부담이 좀 큽니다.
"""
# 사용자 정보가 추출됐다고 가정
user_profile = {
    "age": 63,
    "monthly_income": 2000000,
    "household_size": 2,
    "health_condition": "만성질환"
}

# 3) 가상의 복지정책 후보
policies = [
    {
        "name": "기초연금",
        "eligibility": "만 65세 이상",
        "description": "만 65세 이상 저소득 노인에게 매월 연금 지원"
    },
    {
        "name": "만성질환 의료비 지원",
        "eligibility": "만성질환 보유자",
        "description": "지정 질환 치료비를 일부 지원"
    },
    {
        "name": "저소득층 주거 지원",
        "eligibility": "소득 하위 50% 이하 가구",
        "description": "임대료 또는 주거환경 개선 보조금 지원"
    }
]

# 4) 규칙 기반 1차 필터링 (단순 예시)
filtered_policies = []
for p in policies:
    # 나이 필터 (기초연금 예시)
    if p["name"] == "기초연금" and user_profile["age"] < 65:
        continue
    # 소득 필터, etc. (여기서는 단순 무시)
    filtered_policies.append(p)

# 5) LLM 활용 최종 추천
prompt = f"""
사용자 정보:
- 나이: {user_profile['age']}
- 월 소득: {user_profile['monthly_income']}
- 가구 구성원 수: {user_profile['household_size']}
- 건강 상태: {user_profile['health_condition']}

후보 복지정책:
{filtered_policies}

위 정보를 바탕으로, 사용자에게 가장 적절한 복지정책을 1개 선정하고 그 이유를 구체적으로 설명해줘.
"""

inputs = tokenizer.encode(prompt, return_tensors="pt").to(model.device)
outputs = model.generate(inputs, max_length=256, do_sample=False)
result = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(result)
