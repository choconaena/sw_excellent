# Thanks to minseok : 1-5 rag code using ollama & gemma
import stt_origin_to_abstract
import client_abstract_embedding
import esdb_insert
import esdb_search
import rag

if __name__ == "__main__":
    stt_id = 1
    origin_stt_text = '''
        상담사: 안녕하세요, 어르신. 저는 서울시 동남구 사회복지센터에서 근무하는 박서연 사회복지사입니다. 오늘 시간 괜찮으실까요?

        내담자: 네, 괜찮아요. 이런 데서 누가 찾아오는 것도 오랜만이네요.

        상담사: 요즘은 어떻게 지내고 계세요?

        내담자: 뭐, 그냥 집에만 있죠. 하루 종일 TV 보거나 창밖 구경하는 게 다예요.

        상담사: 그러셨군요. 혹시 외출은 자주 하세요?

        내담자: 잘 안 해요. 예전엔 가까운 공원이나 시장이라도 다녔는데, 요즘은 다 귀찮고 어디 갈 데도 없고…

        상담사: 어르신께서 바깥 활동을 잘 안 하시게 된 특별한 이유가 있으실까요?

        내담자: 몸이 아픈 건 아니에요. 근데 갈 데가 없어요. 친구들도 하나둘 세상 떠났고… 예전엔 음악회 같은 데도 가보고 싶었는데, 그런 건 돈도 들어가고 나이 드니까 괜히 눈치 보이더라고요.

        상담사: 어르신, 문화생활에 관심이 있으셨던 거군요.

        내담자: 그럼요. 옛날엔 성악도 좋아했고, 영화도 참 좋아했는데… 이제는 극장 가는 것도 겁나고, 인터넷으로 보는 건 잘 모르고…

        상담사: 어르신 연세에 맞는 무료 문화 프로그램들도 있어요. 공연이나 영화 상영, 서예나 미술 같은 취미 활동도 있고요. 혹시 참여해보신 적 있으세요?

        내담자: 아니요. 그런 게 있는 줄도 몰랐어요.

        상담사: 동남구 복지관이나 노인복지센터에서 매달 문화활동 프로그램이 열리고 있어요. 신청만 하시면 무료로 참여 가능하고, 요즘은 차량도 지원되는 곳이 있어요.

        내담자: 오, 그런 데가 있군요. 사람들하고 어울리는 게 좀 어색할까 봐 걱정되긴 하는데…

        상담사: 처음엔 다들 그렇게 느끼세요. 그런데 막상 참여해보시면 금방 친해지시고, 오히려 다음 프로그램 기다리시는 어르신들도 많으세요.

        내담자: 그럼 나도 한번 가볼까요? 같이 얘기 나눌 사람도 있었으면 좋겠고…

        상담사: 너무 좋죠. 제가 프로그램 일정표와 신청서를 챙겨드릴게요. 그리고 집에 계실 때 무료로 문화 콘텐츠를 즐길 수 있는 방법도 안내해드릴게요. 예를 들어, 복지관에서 대여하는 태블릿이나 TV 채널을 통해 문화 강연, 공연 시청도 가능하거든요.

        내담자: 오, 그건 정말 몰랐네요. 혼자 있으면 마음이 많이 허전했는데… 그런 것도 도움이 되겠어요.

        상담사: 네, 어르신처럼 문화적인 욕구가 있으신 분들께 꼭 필요한 정보예요. 또, 어르신이 과거에 문화활동을 좋아하셨다면 자서전 쓰기나 시 쓰기 같은 프로그램도 추천드릴 수 있어요.

        내담자: 자서전이요? 하하, 그런 것도 할 수 있어요?

        상담사: 물론이죠. 어르신 삶의 이야기를 나누고, 기록으로 남기는 일이 굉장히 가치 있는 작업이에요. 잘 쓰는 게 중요한 게 아니라, 나누는 거에 의미가 있답니다.

        내담자: 고맙네요. 이렇게 이야기하니까 오랜만에 가슴이 좀 뻥 뚫리는 것 같아요.

        상담사: 저도 어르신과 이야기 나눌 수 있어서 참 좋았습니다. 제가 곧 관련 정보 정리해서 드릴게요. 혹시 더 궁금하신 점 있으세요?

        내담자: 아니요. 오늘 이야기만으로도 큰 힘이 됐어요. 고맙습니다, 정말.
    '''
    # step 1 - STT 원본 데이터 => 요약 데이터
    abstract_json_path = stt_origin_to_abstract.sttOriginToAbstract(stt_id, origin_stt_text)
    print("\n== step 1 Done !! : STT 원본 데이터 => 요약 데이터 ==")
    print(abstract_json_path)
    print()
    
    # step 2 - 요약 데이터 => 텍스트 임베딩
    embedding_json_path = client_abstract_embedding.abstractEmbedding(abstract_json_path, stt_id)
    print("\n== step 2 Done !! : 요약 데이터 => 텍스트 임베딩 ==")
    print(embedding_json_path)
    print()
    
    # step 3 - 텍스트 임베딩 데이터 => ES DB에 삽입
    status = esdb_insert.esInsert(stt_id, embedding_json_path)
    print("\n== step 3 Done !! : 텍스트 임베딩 데이터 => ES DB에 삽입 ==")
    print(status)
    print()
    
    # step 4 - 복지정책 추천 받기
    status = esdb_search.esSearch(stt_id, embedding_json_path)
    print("\n== step 4 Done !! : 텍스트 임베딩 데이터 => 복지정책 추천 받기 ==")
    print(status)
    print()
    
    # step 5 - RAG 이용하여 추천 정확도 증진
    result = rag.RAG_recommendation(abstract_json_path, embedding_json_path)
    print("\n== step 5 Done !! : RAG 이용하여 추천 정확도 증진 ==")
    print("STT->Policy Recommendation Process using LLM DONE")
    print(result)
    print()