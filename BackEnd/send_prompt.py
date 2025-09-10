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
    prompt = "안녕하세요, Gemma!"
    output = generate_with_ollama(prompt)
    print("=== Generated Output ===")
    print(output)

if __name__ == "__main__":
    main()