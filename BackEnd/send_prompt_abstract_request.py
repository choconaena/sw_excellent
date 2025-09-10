#!/usr/bin/env python3
# coding: utf-8
"""
Python 스크립트를 통해 Ollama CLI 'ollama run gemma3:4b' 명령어를 실행하고
결과를 캡처하여 출력하는 예시입니다.
"""

import subprocess

def generate_with_ollama(prompt: str) -> str:
    """
    Ollama CLI를 호출하여 Gemma 3-4B 모델로 텍스트를 생성합니다.
    
    Args:
        prompt (str): 모델에 입력할 프롬프트 문자열.
    
    Returns:
        str: 생성된 텍스트 결과.
    """
    try:
        result = subprocess.run(
            ["ollama", "run", "gemma3:4b", prompt],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        return f"Error: {e.stderr.strip()}"

def main():
    file_path = "/home/BackEnd/AI/funcs/stt_AI/upload/transcript_119.149.165.5_56876_20250522_164005.txt"
    # 1) 파일 읽기
    with open(file_path, encoding="utf-8") as f:
        content = f.read()
    # 2) 프롬프트 구성
    prompt = f"""
        다음 텍스트를 읽고, 아래 JSON 스키마에 **정확하게** 맞춰 출력해 주세요.
        - 출력 외의 부가 설명은 절대 하지 마세요.
        - detail 필드 뒤에는 반드시 “(경고 : 데이터 부족으로 요약이 정확하지 않을 수 있습니다.)”를 포함하세요.

        JSON 스키마:
        {{
        subject: '<주제>',
        abstract: '<추상적 요약>',
        detail: '<상세 설명 (경고 : 데이터 부족으로 요약이 정확하지 않을 수 있습니다.)>'
        }}

        ===== 텍스트 시작 =====
        {content}
        ===== 텍스트 끝 =====
        """

    output = generate_with_ollama(prompt)
    print("=== Generated Output ===")
    print(output)

if __name__ == "__main__":
    main()