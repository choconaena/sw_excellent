import os
import subprocess
import sys
import torch
import requests
from summary_request import summarize
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import json
from fuzzywuzzy import fuzz
from fuzzywuzzy import process
from sentence_transformers import SentenceTransformer, util
import pandas as pd

class WavToTextConverter:
    """
    WavToTextConverter 클래스를 이용해 WAV 파일을 텍스트로 변환.
    내부적으로 모델 및 프로세서를 로드하여, 음성을 텍스트로 변환 후 결과를 파일로 저장한다.
    """
    def __init__(self, pkl_path="/home/BackEnd/AI/funcs/model/whisper_full_model.pkl", device="cuda" if torch.cuda.is_available() else "cpu"):
        """
        클래스 초기화 시 모델 및 프로세서를 자동으로 로드할 수 있도록 구현했다.
        Args:
            pkl_path (str): 모델 및 프로세서가 저장된 .pkl 파일 경로
            device (str): 추론을 수행할 장치 (cpu 또는 cuda)
        """
        self.pkl_path = pkl_path
        self.device = device
        self.model, self.processor = self.load_model_and_processor_from_pkl(self.pkl_path)
        self.pipe = self._create_pipeline()

    def load_model_and_processor_from_pkl(self, pkl_path):
        """
        저장된 .pkl 파일에서 모델과 프로세서를 로드한 뒤, 모델을 eval 모드로 설정한다.
        Args:
            pkl_path (str): 저장된 .pkl 파일 경로
        Returns:
            model, processor: 로드된 모델과 프로세서
        """
        device = device="cuda" if torch.cuda.is_available() else "cpu"
        data = torch.load(pkl_path, map_location=device)
        model = data["model"]
        processor = data["processor"]

        model.to(device)
        model.eval()
        return model, processor

    def _create_pipeline(self):
        """
        모델과 프로세서를 바탕으로 음성인식 파이프라인을 생성한다.
        Returns:
            transformers.pipelines.Pipeline: 자동 음성 인식 파이프라인
        """
        pipe = pipeline(
            "automatic-speech-recognition",
            model=self.model,
            tokenizer=self.processor.tokenizer,
            feature_extractor=self.processor.feature_extractor,
            device=self.device,
            generate_kwargs={"language": "ko"},
            return_timestamps=True,
        )
        return pipe

    def transcribe_audio(self, audio_path):
        """
        음성 파일을 텍스트로 변환.
        Args:
            audio_path (str): 음성 파일 경로
        Returns:
            dict: 변환 결과
        """
        result = self.pipe(audio_path)
        return result

    def save_transcription(self, audio_path, result):
        """
        변환된 결과를 .txt 파일로 저장한다.
        Args:
            audio_path (str): 음성 파일 경로
            result (dict): 변환된 텍스트 결과
        """
        text_file_path = "./wav_to_txt_results/" + os.path.splitext(os.path.basename(audio_path))[0] + ".txt"
        os.makedirs(os.path.dirname(text_file_path), exist_ok=True)
        with open(text_file_path, "w", encoding="utf-8") as file:
            for chunk in result["chunks"]:
                file.write(chunk["text"] + "\n")
        print(f"결과가 {text_file_path}에 저장되었습니다.")
        return text_file_path

    def process_wav_to_text(self, file_path):
        """
        .wav 파일 경로를 입력받아 음성을 텍스트로 변환 후 결과를 저장한다.
        Args:
            file_path (str): .wav 파일 경로
        Returns:
            str: 변환 결과에 대한 간단한 안내 메시지
        """
        if not os.path.exists(file_path):
            absolute_path = os.path.abspath(file_path)
            print(f"Absolute file path: {absolute_path}")
            return "File not found!"

        # Ensure the WAV file is in a valid format
        valid_wav_path = self.ensure_valid_wav_format(file_path)
        if not valid_wav_path:
            return "Invalid or corrupted WAV file. Conversion failed."

        print(f"파일 {valid_wav_path} 변환 중...")
        result = self.transcribe_audio(valid_wav_path)
        txt_path = self.save_transcription(valid_wav_path, result)
        return txt_path


    def ensure_valid_wav_format(self, file_path):
        """
        ffmpeg을 사용하여 WAV 파일이 올바른 PCM 16-bit 16kHz 형식인지 확인하고 변환한다.
        Args:
            file_path (str): 원본 .wav 파일 경로
        Returns:
            str: 변환된 파일 경로 (성공 시), None (변환 실패 시)
        """
        output_path = file_path.replace(".wav", "_converted.wav")

        try:
            # ffmpeg을 이용해 16kHz PCM 16-bit mono로 변환
            subprocess.run([
                "ffmpeg", "-y", "-i", file_path, 
                "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", output_path
            ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            if os.path.exists(output_path):
                return output_path
            else:
                return None

        except subprocess.CalledProcessError as e:
            print(f"FFmpeg conversion error: {e}")
            return None

def update_policy_in_db(user_id, policy_data):
    """
    특정 userId의 policy JSON 배열을 DB에 업데이트하는 함수.

    Parameters:
        user_id (int): 업데이트할 사용자 ID
        policy_data (list): 업데이트할 policy JSON 배열 (list of dict)

    Returns:
        dict: API 응답 결과
    """
    url = f"http://127.0.0.1:3000/db/welfare-datas/{user_id}"
    headers = {"Content-Type": "application/json"}
    
    # 요청 데이터 구성
    payload = json.dumps({"policy": policy_data})
    print("send data welfare-datas")
    try:
        response = requests.put(url, data=payload, headers=headers)

        if response.status_code == 200:
            return response.json()  # 성공 시 JSON 응답 반환
        else:
            return {"error": f"Failed to update policy. Status code: {response.status_code}", "details": response.text}

    except requests.exceptions.RequestException as e:
        return {"error": f"Request failed: {e}"}

def get_welfare_policies():
    """
    Fetches all welfare policies from the API.
    
    Returns:
        dict or None: JSON response if successful, None otherwise.
    """
    url = "http://127.0.0.1:3000/db/welfare-policies"

    try:
        response = requests.get(url)

        if response.status_code == 200:
            return response.json()  # 성공 시 JSON 데이터 반환
        elif response.status_code == 404:
            print("No policies found.")
            return None
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None
    
########################################################
#### TO-DO 아래 함수를 텍스트 임베딩 코드로 변경해야함 ####
########################################################

def find_top_matching_policies(search_text, json_data, top_n=3):
    """
    주어진 검색 문자열과 가장 유사한 복지 정책을 찾음.

    Parameters:
        search_text (str): 검색할 문자열
        json_data (list): API에서 받은 복지 정책 JSON 데이터
        top_n (int): 반환할 정책 개수 (기본값 3)

    Returns:
        list: 유사도가 높은 상위 n개의 정책 리스트
    """
    policy_list = []

    # JSON 데이터를 순회하며 유사도 점수 계산
    for user_data in json_data:
        for policy in user_data["policy"]:
            # 비교할 대상 텍스트 (policy_name, short_description, detailed_conditions 포함)
            comparison_text = f"{policy['policy_name']} {policy['short_description']} {' '.join(policy['detailed_conditions'])}"

            # 문자열 유사도 계산
            similarity_score = fuzz.token_set_ratio(search_text, comparison_text)

            # 정책과 유사도 점수를 튜플로 저장
            policy_list.append((similarity_score, policy))

    # 유사도 점수를 기준으로 내림차순 정렬
    policy_list.sort(reverse=True, key=lambda x: x[0])

    # 상위 n개 정책 반환
    return [policy for _, policy in policy_list[:top_n]]

#벡터db로 정책추천


def recommend_policy(user_query, top_k=3):
    model = SentenceTransformer("upskyy/bge-m3-korean")
    json_file = "/home/BackEnd/AI/funcs/python/policy_embeddings.json"

    with open(json_file, "r", encoding="utf-8") as f:
        policy_data = json.load(f)

    df = pd.DataFrame(policy_data)

    # 사용자 입력 임베딩
    user_embedding = model.encode(user_query).tolist()  # JSON 저장을 위해 리스트로 변환

    # 유사도 계산
    similarities = [
        util.cos_sim(user_embedding, policy_emb)[0][0].item()
        for policy_emb in df["embedding"]
    ]

    # 유사도 순으로 상위 top_k 반환
    top_indices = sorted(range(len(similarities)), key=lambda i: similarities[i], reverse=True)[:top_k]
    recommendations = df.iloc[top_indices][["복지정보명", "서비스 내용", "선정 기준", "페이지 URL"]]

    # 컬럼명 변경
    recommendations = recommendations.rename(columns={
        "복지정보명": "policy_name",
        "서비스 내용": "short_description",
        "선정 기준": "detailed_conditions",
        "페이지 URL": "link"
    })

    # `detailed_conditions`을 리스트로 변환
    recommendations["detailed_conditions"] = recommendations["detailed_conditions"].apply(
        lambda x: x if isinstance(x, list) else [x]
    )


    # DataFrame을 리스트의 딕셔너리로 변환
    policy_list = recommendations.to_dict(orient="records")

    return policy_list  # JSON 문자열이 아니라 리스트 반환

def main():
    """
    커맨드 라인에서 <path_to_wav_file> 인자를 받아 WAV->텍스트 변환을 수행한다.
    """
    if len(sys.argv) != 2:
        print("Usage: python3 main.py <path_to_wav_file>")
        sys.exit(1)

    print("wav_to_txt_process started")
    wav_file_path = sys.argv[1]

    # 클래스 인스턴스화
    converter = WavToTextConverter()  

    ### 여기서 ### 

    result = converter.process_wav_to_text(wav_file_path)
    stt_txt_path = result
    print("process_wav_to_text result : ", stt_txt_path)

    #############################
    #### 바로 요약모듈 전달   ####
    #############################
    print("요약모듈 전달 시작")

    try:
        with open(stt_txt_path, "r", encoding="utf-8") as f:
            content = f.read()
        print("원본 stt : ", content)  # 파일 내용을 확인
    except FileNotFoundError:
        print("지정된 경로에 파일이 존재하지 않습니다.")
    except IOError:
        print("파일 읽기 중 입출력 오류가 발생했습니다.")

    # for summarization test
    # my_text = (
    #     "인공지능 기술은 현대 사회에서 점점 더 중요한 역할을 하고 있습니다. "
    #     "특히 자연어 처리 기술은 다양한 산업 분야에서 활용되고 있으며, "
    #     "챗봇, 번역 시스템, 감정 분석 등과 같은 응용 프로그램으로 우리의 "
    #     "일상생활에 깊숙이 침투하고 있습니다. 이러한 기술은 단순히 텍스트를 "
    #     "이해하는 것을 넘어, 문맥을 파악하고 인간처럼 대화를 이어가는 수준으로 "
    #     "발전하고 있습니다. 예를 들어, 요약 시스템은 방대한 양의 텍스트 데이터를 "
    #     "효율적으로 처리하고 필요한 정보를 추출하여 사용자에게 전달하는 데 "
    #     "중요한 역할을 합니다. 하지만 여전히 자연어 처리 기술은 여러 과제를 "
    #     "안고 있습니다. 언어의 모호성, 문화적 차이, 텍스트 데이터의 품질 문제 등은 "
    #     "해결해야 할 주요 과제입니다. 이처럼 자연어 처리 기술은 발전 가능성이 "
    #     "무궁무진하지만, 이를 완벽히 구현하기 위해서는 더 많은 연구와 개발이 "
    #     "필요합니다."
    # )
    
    summary_result = summarize(content, len(content))
    print(summary_result)

    
    #############################
    #### 바로 임베딩 진행     ####
    #############################
    '''
    print("임베딩 시작 1 - 모든 정책 DB에서 가져오기")
    all_policies = get_welfare_policies()
    print(all_policies)
    print("임베딩1 완료")


    print("임베딩 시작 2 - 검색할 문자열과 유사도 높은 정책 찾음 (in all_policies)")
    # 검색어 입력
    search_query = summary_result
    
    # 가장 유사한 3개 정책 찾기
    top_policies = find_top_matching_policies(search_query, all_policies)
    '''
    ###코드 변경함###
    top_policies = recommend_policy(content)
    
    # 결과 출력
    print("Top 3 Matching Policies:")
    policy_json = []
    for idx, policy in enumerate(top_policies, 1):
        print(f"{idx}. {policy}")
        policy_json.append(policy)

    print("policy_json created : ",policy_json)

    user_id = 1
    result = update_policy_in_db(user_id, policy_json)

if __name__ == "__main__":
    main()
