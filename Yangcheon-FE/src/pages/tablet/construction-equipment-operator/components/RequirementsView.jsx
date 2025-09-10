// src/views/tablet/construction-equipment-operator/components/RequirementsView.jsx
import { useNavigate } from "react-router-dom";
import * as S from "../style";

const RequirementsView = () => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    navigate(
      "/tablet/construction-equipment-operator?view=form&step=signature2"
    );
  };

  return (
    <S.RequirementsContainer>
      <S.Title>발급신청 정보 입력</S.Title>
      <S.Subtitle>행정정보 공동이용 동의</S.Subtitle>

      <S.RequirementsTable>
        <S.TableRow>
          <S.TableHeader rowSpan={1}>
            신청인
            <br />
            제출 서류
          </S.TableHeader>
          <S.TableCell>
            <S.SectionTitle>1. 발급의 경우</S.SectionTitle>
            <S.RequirementList>
              <S.RequirementItem>
                가. 「건설기계관리법 시행규칙」 제76조5항에 따른 신체검사서
              </S.RequirementItem>
              <S.RequirementItem>
                나. 소형굴삭기(굴삭기 중량이 6톤 미만인 굴삭기에 한함)
                건설기계조종사면허증을 발급신청하는 경우에 한정합니다)
              </S.RequirementItem>
              <S.RequirementItem>
                다. 건설기계조종사면허증(건설기계조종사면허의 종류를 추가하는
                경우에 한정합니다)
              </S.RequirementItem>
              <S.RequirementItem>
                라. 신청일 전 6개월 이내에 무자 등록 쓰지 않고 촬영한 천연색
                상반신 정면사진 (3.5cmX4.5cm) 1장
              </S.RequirementItem>
            </S.RequirementList>
            <S.SectionTitle>2. 재발급의 경우</S.SectionTitle>
            <S.RequirementList>
              <S.RequirementItem>
                가. 재교부 허위하는 사진 (3.5cmX4.5cm) 1장
              </S.RequirementItem>
              <S.RequirementItem>
                나. 건설기계조종사 면허증(멸실 또는 훼손된 경우에 한정합니다)
              </S.RequirementItem>
            </S.RequirementList>
          </S.TableCell>
          <S.TableFeeCell rowSpan={2}>
            수수료
            <br />
            <S.FeeAmount>2,500원</S.FeeAmount>
          </S.TableFeeCell>
        </S.TableRow>
        <S.TableRow>
          <S.TableHeader rowSpan={1}>담당공무원 확인사항</S.TableHeader>
          <S.TableCell>
            <S.RequirementList>
              <S.RequirementItem>
                1. 국가기술자격증 정보(소형건설기계조종사면허증 발급신청 제외)
              </S.RequirementItem>
              <S.RequirementItem>
                2. 자동차운전면허증 정보(3종 미만의 자격자를 조종하려는 경우)
              </S.RequirementItem>
              <S.RequirementItem>
                다. 건설기계조종사면허증(건설기계조종사면허의 종류를 추가하는
                경우에 한정합니다)
              </S.RequirementItem>
              <S.RequirementItem>
                라. 신청일 전 6개월 이내에 무자 등록 쓰지 않고 촬영한 천연색
                상반신 정면사진 (3.5cmX4.5cm) 1장
              </S.RequirementItem>
            </S.RequirementList>
          </S.TableCell>
        </S.TableRow>
      </S.RequirementsTable>

      <S.NoticeBox>
        본인은 이 건 업무처리와 관련하여 담당 공무원이 「전자정부법」 제36조에
        따른 행정정보 공동이용을 통하여 위의 담당 공무원 확인사항을 확인하는
        것에 동의합니다.
        <br />* 동의하지 아니하는 경우에는 국가기술자격증 사본 또는
        자동차운전면허증 사본을 신청인이 직접 제출하여야 합니다.
      </S.NoticeBox>

      <S.SubmitButton onClick={handleConfirm}>확인</S.SubmitButton>
    </S.RequirementsContainer>
  );
};

export default RequirementsView;
