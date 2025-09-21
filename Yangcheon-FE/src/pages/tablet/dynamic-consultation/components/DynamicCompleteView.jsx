import * as S from "../../consultation/style"; // 정보공개청구와 동일한 스타일 사용

const DynamicCompleteView = ({
  formName,
  formData,
  signature
}) => {
  return (
    <S.CompletionScreen>
      <S.SuccessIcon>
        <S.CheckMark>✓</S.CheckMark>
      </S.SuccessIcon>

      <S.CompletionMessage>
        {formName} 신청이 완료되었습니다!
      </S.CompletionMessage>

      <S.CompletionCard>
        <S.CompletionItem>
          <S.CompletionLabel>📄 생성된 문서</S.CompletionLabel>
          <S.CompletionValue>
            HWP 문서가 자동으로 생성되어 다운로드되었습니다.
          </S.CompletionValue>
        </S.CompletionItem>

        <S.CompletionItem>
          <S.CompletionLabel>📋 신청 내용</S.CompletionLabel>
          <S.CompletionValue>
            {Object.entries(formData || {}).length > 0
              ? `${Object.entries(formData).length}개 항목이 입력되었습니다.`
              : "모든 필수 정보가 입력되었습니다."}
          </S.CompletionValue>
        </S.CompletionItem>

        <S.CompletionItem>
          <S.CompletionLabel>✍️ 전자 서명</S.CompletionLabel>
          <S.CompletionValue>
            {signature ? "서명이 완료되었습니다." : "서명 처리 중입니다."}
          </S.CompletionValue>
        </S.CompletionItem>

        <S.CompletionItem>
          <S.CompletionLabel>📞 문의사항</S.CompletionLabel>
          <S.CompletionValue>
            처리 현황은 민원24 또는 양천구청 홈페이지에서 확인하실 수 있습니다.
          </S.CompletionValue>
        </S.CompletionItem>

        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          fontSize: '1.1rem',
          color: '#666'
        }}>
          🏛️ 양천구청을 이용해 주셔서 감사합니다.
        </div>
      </S.CompletionCard>
    </S.CompletionScreen>
  );
};

export default DynamicCompleteView;