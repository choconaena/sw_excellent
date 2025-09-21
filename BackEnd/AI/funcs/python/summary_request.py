import requests

def summarize(text, max_len=500):
    # 서버 URL
    url = "http://127.0.0.1:25000/summarize"

    # 요청 데이터
    data = {
        "text": text,
        "max_len": max_len
    }

    try:
        # POST 요청 전송
        response = requests.post(url, json=data)
        response.raise_for_status()  # 상태 코드를 체크해주는 메서드

        # 응답 처리
        result = response.json()
        return result.get("summary")

    except requests.exceptions.RequestException as e:
        print("Request failed:", e)
        return None
