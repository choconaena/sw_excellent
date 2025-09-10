#!/usr/bin/env python3
# coding: utf-8
"""
Ollama CLI를 통해 Gemma 3-4B 모델로 텍스트 생성.
텍스트 파일 경로는 첫 번째 인자로 받음.
"""

import subprocess
import argparse

def generate_with_ollama(prompt: str) -> str:
    """
    Ollama CLI를 호출하여 Gemma 3-4B 모델로 텍스트를 생성.
    """
    result = subprocess.run(
        ["ollama", "run", "gemma3:4b", prompt],
        capture_output=True,
        text=True
    )
    if result.returncode == 0:
        return result.stdout.strip()
    # 오류 메시지만 반환
    return f"Error: {result.stderr.strip()}"

def main():
    # 1) 인자 파싱
    parser = argparse.ArgumentParser(
        description="텍스트 파일을 읽어 Gemma에게 요약 요청"
    )
    parser.add_argument(
        "txt_file",
        help="처리할 텍스트(.txt) 파일의 경로"
    )
    args = parser.parse_args()
    file_path = args.txt_file

    print("summary_send! file_path : ", file_path)

    # 2) 파일 읽기
    with open(file_path, encoding="utf-8") as f:
        content = f.read()

    # 3) 프롬프트 구성
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

    # 4) 호출 및 출력
    output = generate_with_ollama(prompt)
    print("=== Generated Output ===")
    print(output)

if __name__ == "__main__":
    main()
