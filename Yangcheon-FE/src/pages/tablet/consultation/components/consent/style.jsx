import styled from "styled-components";

export const Page = styled.div`
  width: 100%;
`;

export const Card = styled.div`
  max-width: 920px;
  width: 100%;
  margin: 0 auto; /* 가운데 정렬 */
  background: #fff;
  border-radius: 16px;
  padding: 0px 24px 100px; /* 하단 fixed 바 높이만큼 여유 */
`;

export const Title = styled.h1`
  text-align: center;
  font-size: 28px;
  line-height: 1.35;
  word-break: keep-all; /* 한글 단어 단위 줄바꿈 */
  margin: 8px 0 16px;
`;

export const Intro = styled.p`
  color: #333;
  white-space: pre-wrap;
  margin-bottom: 20px;
`;

export const ListBox = styled.div`
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 18px;
`;

export const ListHeader = styled.div`
  font-weight: 700;
  margin-bottom: 10px;
`;

export const ItemsGrid = styled.div`
  display: grid;
  gap: 10px;
`;

export const RowWrap = styled.div`
  display: flex;
  gap: 0px;
  line-height: 1.6;
`;

export const RowIdx = styled.div`
  min-width: 24px;
`;

export const RowBody = styled.div`
  flex: 1;
  & > b {
    font-weight: 700;
  }
  & > span {
    margin-left: 8px;
  }
`;

export const Notice = styled.div`
  color: #444;
  margin-top: 6px;
`;

export const ConfirmBox = styled.div`
  border: 2px solid #222;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const ConfirmText = styled.div`
  margin-bottom: 12px;
`;

export const ButtonsWrap = styled.div`
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
`;

export const DateText = styled.div`
  text-align: center;
  letter-spacing: 3px;
  font-size: 18px;
  color: #333;
  margin-top: 8px;
`;

/* 체크박스 (경계/배경 없음) */
export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
  color: #222;
`;

export const CheckboxInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
`;

export const CheckboxCustom = styled.span`
  width: 20px;
  height: 20px;
  border: 2px solid #555;
  border-radius: 4px;
  position: relative;
  ${CheckboxInput}:checked + &::after {
    content: "✓";
    position: absolute;
    font-size: 16px;
    color: #000;
  }
`;

/* ===== 하단 고정 바 & 버튼 ===== */
export const StickyBar = styled.div`
  position: fixed; /* <- 확실히 하단 고정 */
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid #eaeaea;
  backdrop-filter: saturate(120%) blur(6px);
  z-index: 50;
`;

export const BarInner = styled.div`
  max-width: 920px;
  width: 100%;
  margin: 0 auto;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
`;

export const BarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

export const SmallNote = styled.div`
  font-size: 14px;
  color: #555;
`;

export const AgreeAllInline = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 15px;
  color: #222;
`;

export const AgreeAllBtnLarge = styled.button`
  width: 100%;
  height: 58px;
  border: none;
  border-radius: 14px;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  background: #111;
  cursor: pointer;
  transition: transform 0.04s ease, opacity 0.2s ease;
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;
