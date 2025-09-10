// ConsentCollectionView.jsx
import React, { useEffect, useState } from "react";
import {
  Page,
  Card,
  Title,
  Intro,
  ListBox,
  ListHeader,
  ItemsGrid,
  RowWrap,
  RowIdx,
  RowBody,
  Notice,
  ConfirmBox,
  ConfirmText,
  ButtonsWrap,
  DateText,
  CheckboxLabel,
  CheckboxInput,
  CheckboxCustom,
  StickyBar,
  BarInner,
  BarRow,
  AgreeAllBtnLarge,
} from "./style";

const Row = ({ idx, label, value, boldValue }) => (
  <RowWrap>
    <RowIdx>{idx}.</RowIdx>
    <RowBody>
      <b>{label}</b>
      <span>
        {React.isValidElement(value) ? (
          value
        ) : boldValue ? (
          <b>{value}</b>
        ) : (
          value
        )}
      </span>
    </RowBody>
  </RowWrap>
);

export default function ConsentCollectionView({ onAgree }) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const [collectionSelected, setCollectionSelected] = useState(null);
  const [thirdSelected, setThirdSelected] = useState(null);

  const allAgreed = collectionSelected === true && thirdSelected === true;

  // ✅ 개별 체크로 둘 다 동의되면 자동 이동
  useEffect(() => {
    if (allAgreed && typeof onAgree === "function") {
      onAgree();
    }
  }, [allAgreed, onAgree]);

  // ✅ 하단 “모두 동의” 버튼
  const handleAgreeAllClick = () => {
    setCollectionSelected(true);
    setThirdSelected(true);
    if (typeof onAgree === "function") onAgree(); // 즉시 서명 화면으로 이동
  };

  const collectionItems = [
    {
      label: "개인정보의 수집·이용 목적 :",
      value: "음성 인식 AI 서비스 개발 및 개선",
    },
    { label: "수집 항목 :", value: "음성 데이터" },
    {
      label: "보유 및 이용 기간 :",
      value: (
        <>
          <u>
            <b>인공지능 모델 학습 완료일로부터 1년</b>
          </u>
          <br />
          (개인정보 활용 목적 달성 후 「개인정보보호법 제21조」에 따라 보유 후
          파기)
        </>
      ),
    },
  ];

  const thirdPartyItems = [
    { label: "제공받는 기관 :", value: "안심하이" },
    {
      label: "제공 목적 :",
      value: "음성 인식 AI 서비스 개발을 위한 학습데이터 활용",
    },
    { label: "제공하는 항목 :", value: "음성 데이터" },
    {
      label: "보유 및 이용 기간 :",
      value: (
        <>
          <u>
            <b>인공지능 모델 학습 완료일로부터 1년</b>
          </u>
          <br />
          (개인정보 활용 목적 달성 후 「개인정보보호법 제21조」에 따라 보유 후
          파기)
        </>
      ),
    },
  ];

  return (
    <Page>
      <Card>
        <Title>개인정보 수집·이용 및 제3자 제공 동의서</Title>

        <Intro>
          양천구청 스마트정보과에서 인공지능 모델 개발 및 서비스 제공을 위해
          「개인정보 보호법」 제15조에 의거하여 아래와 같이 개인정보를
          수집·이용하고자 합니다. 아래 내용을 자세히 읽어 보시고, 모든 내용을
          이해하신 후 동의 여부를 결정하여 주시기 바랍니다. 귀하께서 제공한 모든
          정보는 본 동의서에 명시된 목적 이외의 용도로는 사용되지 않습니다.
        </Intro>

        {/* ① 수집·이용 */}
        <ListBox>
          <ListHeader>【 개인정보 수집·이용 내역 】</ListHeader>
          <ItemsGrid>
            {collectionItems.map((it, i) => (
              <Row
                key={`c-${i}`}
                idx={i + 1}
                label={it.label}
                value={it.value}
              />
            ))}
            <Notice>
              ※ 귀하께서는 본 개인정보 수집·이용의 동의를 거부하실 권리가
              있으며, 동의 거부에 따른 불이익은 없습니다.
            </Notice>
          </ItemsGrid>
        </ListBox>

        <ConfirmBox>
          <ConfirmText>
            본인은 위의 내용을 충분히 이해하였으며, 개인정보 수집·이용에
            동의하십니까?
          </ConfirmText>
          <ButtonsWrap>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={collectionSelected === true}
                onChange={() => setCollectionSelected(true)}
              />
              <CheckboxCustom />
              동의함
            </CheckboxLabel>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={collectionSelected === false}
                onChange={() => setCollectionSelected(false)}
              />
              <CheckboxCustom />
              동의하지 않음
            </CheckboxLabel>
          </ButtonsWrap>
        </ConfirmBox>

        {/* ② 제3자 제공 */}
        <ListBox>
          <ListHeader>【 개인정보 제3자 제공 내역 】</ListHeader>
          <ItemsGrid>
            {thirdPartyItems.map((it, i) => (
              <Row
                key={`t-${i}`}
                idx={i + 1}
                label={it.label}
                value={it.value}
              />
            ))}
            <Notice>
              ※ 귀하께서는 본 개인정보 제3자 제공의 동의를 거부하실 권리가
              있으며, 동의 거부에 따른 불이익은 없습니다.
            </Notice>
          </ItemsGrid>
        </ListBox>

        <ConfirmBox>
          <ConfirmText>
            본인은 위의 내용을 충분히 이해하였으며, 개인정보 제3자 제공에
            동의하십니까?
          </ConfirmText>
          <ButtonsWrap>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={thirdSelected === true}
                onChange={() => setThirdSelected(true)}
              />
              <CheckboxCustom />
              동의함
            </CheckboxLabel>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={thirdSelected === false}
                onChange={() => setThirdSelected(false)}
              />
              <CheckboxCustom />
              동의하지 않음
            </CheckboxLabel>
          </ButtonsWrap>
        </ConfirmBox>

        <DateText>
          {yyyy}년&nbsp;&nbsp;{mm}월&nbsp;&nbsp;{dd}일
        </DateText>
      </Card>

      {/* 하단 고정 바: “모두 동의” 버튼만 표시 */}
      <StickyBar>
        <BarInner>
          <BarRow>
            <AgreeAllBtnLarge type="button" onClick={handleAgreeAllClick}>
              모두 동의
            </AgreeAllBtnLarge>
          </BarRow>
        </BarInner>
      </StickyBar>
    </Page>
  );
}
