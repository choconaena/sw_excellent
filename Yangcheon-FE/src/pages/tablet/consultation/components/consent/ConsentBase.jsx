import React, { useState } from "react";
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
} from "./style";

const Row = ({ idx, label, value, boldValue }) => (
  <RowWrap>
    <RowIdx>{idx}.</RowIdx>
    <RowBody>
      <b>{label}</b>
      <span>
        {React.isValidElement(value) ? (
          value // ✅ JSX면 그대로 출력
        ) : boldValue ? (
          <b>{value}</b>
        ) : (
          value
        )}
      </span>
    </RowBody>
  </RowWrap>
);

export default function ConsentBase({
  title,
  intro,
  items,
  confirmText,
  agreeLabel = "동의함",
  disagreeLabel = "동의하지 않음",
  onAgree,
  onDisagree,
  listHeaderText = "개인정보 수집·이용 내역",
}) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const [selected, setSelected] = useState(null); // null | true | false

  const handleAgree = () => {
    setSelected(true);
    if (typeof onAgree === "function") onAgree();
  };

  const handleDisagree = () => {
    setSelected(false);
    if (typeof onDisagree === "function") onDisagree();
  };

  return (
    <Page>
      <Card>
        <Title>{title}</Title>

        {intro && <Intro>{intro}</Intro>}

        <ListBox>
          <ListHeader>【 {listHeaderText} 】</ListHeader>
          <ItemsGrid>
            {items.map((it, i) => (
              <Row
                key={i}
                idx={i + 1}
                label={it.label}
                value={it.value}
                boldValue={it.boldValue}
              />
            ))}
            <Notice>
              ※ 귀하께서는 본 개인정보{" "}
              {title.includes("수집") ? "수집·이용" : "제3자 제공"}의 동의를
              거부하실 권리가 있으며, 동의 거부에 따른 불이익은 없습니다.
            </Notice>
          </ItemsGrid>
        </ListBox>

        <ConfirmBox>
          <ConfirmText>
            본인은 위의 내용을 충분히 이해하였으며, {confirmText}
          </ConfirmText>
          <ButtonsWrap>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={selected === true}
                onChange={handleAgree}
              />
              <CheckboxCustom />
              {agreeLabel}
            </CheckboxLabel>

            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={selected === false}
                onChange={handleDisagree}
              />
              <CheckboxCustom />
              {disagreeLabel}
            </CheckboxLabel>
          </ButtonsWrap>
        </ConfirmBox>

        <DateText>
          {yyyy}년&nbsp;&nbsp;{mm}월&nbsp;&nbsp;{dd}일
        </DateText>
      </Card>
    </Page>
  );
}
