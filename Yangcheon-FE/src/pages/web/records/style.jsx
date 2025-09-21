import styled, { keyframes } from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 70px);
  background-color: #fff;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const Content = styled.div`
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

export const Header = styled.div`
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

export const WelcomeTitle = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

export const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin: 0;
`;

export const FilterSection = styled.div`
  position: relative;
  z-index: 100;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f3f4;
  animation: ${fadeIn} 0.6s ease-out 0.1s both;
  overflow: visible;
`;

export const StyledDatePicker = styled(DatePicker)`
  padding: 1rem 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  font-size: 1.2rem;
  outline: none;
  background: white;
  transition: all 0.3s ease;
  min-width: 180px;
  color: #333;

  &:focus {
    border-color: #a93946;
    box-shadow: 0 0 0 3px rgba(169, 57, 70, 0.1);
  }
`;

export const DateRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

export const DateInputWrapper = styled.div`
  position: relative;
  .react-datepicker__input-container {
    display: flex;
    align-items: center;
  }

  .react-datepicker__calendar-icon {
    margin-top: 1px;
    padding: 5px;
    color: #fff1f2;
    width: 23px;
    height: 23px;
  }

  input {
    width: 200px;
    color: #3f3f46;
    margin-left: 8px;
    caret-color: transparent;
    &:focus {
      outline: none;
    }
  }

  .react-datepicker {
    // 캘린더의 테두리 지정
    border-radius: 12px;
  }

  .react-datepicker__header {
    // 캘린더의 Header
    background-color: #fff1f2;
    border-top-right-radius: 12px;
    border-top-left-radius: 12px;
    border-bottom: none;
  }

  .react-datepicker__triangle {
    visibility: hidden;
  }

  .react-datepicker__current-month {
    font-weight: 700;
    margin-bottom: 10px;
    font-size: 1.2rem;
  }

  .react-datepicker__day-names {
    // 요일
    font-size: 1rem;
  }

  .react-datepicker__day-name {
    // 요일
    color: #3f3f46;
  }

  .react-datepicker__day:hover {
    // 날짜에 마우스를 올렸을 때
    border-radius: 15px;
  }

  .react-datepicker__day--selected {
    // 선택된 날짜
    background-color: #fff1f2;
    color: #3f3f46;
    border-radius: 15px;
  }

  .react-datepicker__day--outside-month {
    // 현재 달이 아닌 날짜
    color: grey;
  }
`;

export const DateInput = styled.input`
  padding: 0.8rem 1.2rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1.2rem;
  outline: none;
  background: white;
  transition: all 0.3s ease;
  min-width: 150px;

  &:focus {
    border-color: #a93946;
    box-shadow: 0 0 0 3px rgba(169, 57, 70, 0.1);
  }

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.2rem;
  }
`;

export const ArrowIcon = styled.div`
  font-size: 1.5rem;
  color: #a93946;
  display: flex;
  align-items: center;
`;

export const SearchButton = styled.button`
  background-color: #a93946;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #91212e;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(169, 57, 70, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  width: 100%;
  justify-content: space-between;
`;

export const SearchDropdown = styled.div`
  position: relative;
`;

export const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 260px;
  justify-content: space-between;

  &:hover {
    border-color: #a93946;
  }

  &:focus {
    outline: none;
    border-color: #a93946;
    box-shadow: 0 0 0 3px rgba(169, 57, 70, 0.1);
  }
`;

export const DropdownIcon = styled.span`
  font-size: 0.8rem;
  transition: transform 0.3s ease;
  transform: ${(props) => (props.$isOpen ? "rotate(180deg)" : "rotate(0deg)")};
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  z-index: 99999;
  margin-top: 0.5rem;
  animation: ${slideDown} 0.3s ease-out;
`;

export const DropdownItem = styled.div`
  padding: 1.2rem 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 1rem;

  &:hover {
    background-color: #f8f9fa;
  }

  &:first-child {
    border-radius: 10px 10px 0 0;
  }

  &:last-child {
    border-radius: 0 0 10px 10px;
  }

  &:only-child {
    border-radius: 10px;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 0.8rem 1.2rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  background: white;
  transition: all 0.3s ease;
  min-width: 200px;

  &:focus {
    border-color: #a93946;
    box-shadow: 0 0 0 3px rgba(169, 57, 70, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

export const SearchIconButton = styled.button`
  width: 45px;
  height: 45px;
  background: #a93946;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: white;
  font-size: 1.2rem;

  &:hover {
    background-color: #91212e;
    transform: scale(1.05);
  }
`;

export const DownloadButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #5a6268;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
  }
`;

export const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f3f4;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

export const TableHeader = styled.thead`
  background-color: #f8f9fa;
`;

export const TableHeaderRow = styled.tr`
  border-bottom: 2px solid #e9ecef;
`;

export const TableHeaderCell = styled.th`
  padding: 1.2rem 1rem;
  text-align: center;
  font-weight: 600;
  color: #333;
  font-size: 1rem;
  white-space: nowrap;

  &:first-child {
    width: 60px;
  }

  &:last-child {
    width: 100px;
  }
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.td`
  padding: 1rem;
  text-align: center;
  color: #333;
  font-size: 1.2rem;
  vertical-align: middle;
`;

export const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #a93946;
`;

export const AttachmentIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #a93946;
  }
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 0.5rem;
`;

export const PaginationButton = styled.button`
  width: 40px;
  height: 40px;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    border-color: #a93946;
    color: #a93946;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;

    &:hover {
      border-color: #e9ecef;
      color: inherit;
    }
  }

  ${(props) =>
    props.$active &&
    `
    background-color: #a93946;
    border-color: #a93946;
    color: white;
    
    &:hover {
      background-color: #91212e;
      border-color: #91212e;
      color: white;
    }
  `}
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
`;

// Modal styles
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-width: 400px;
  max-width: 500px;
  width: 90%;
  animation: ${slideDown} 0.3s ease-out;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const ModalTitle = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin: 0;
  font-weight: 600;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.2rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
    color: #333;
  }
`;

export const ModalBody = styled.div`
  margin-bottom: 1.5rem;
`;

export const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

export const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }
`;

export const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #a93946;
`;

export const CheckboxLabel = styled.span`
  font-size: 1rem;
  color: #333;
  font-weight: ${(props) => (props.$isMain ? "600" : "400")};
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

export const ModalButton = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  ${(props) =>
    props.$primary
      ? `
    background-color: #a93946;
    color: white;
    
    &:hover {
      background-color: #91212e;
    }
  `
      : `
    background-color: #6c757d;
    color: white;
    
    &:hover {
      background-color: #5a6268;
    }
  `}
`;

export const DownloadBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  margin: 0.75rem 0 1rem 0;
`;

export const HelpWrap = styled.div`
  position: absolute;
  top: -6px; /* 버튼 우상단 */
  right: -6px;
`;

export const HelpIcon = styled.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #eef0f2;
  color: #555;
  font-weight: 700;
  font-size: 0.75rem;
  cursor: default;
  user-select: none;
  border: 1px solid #d1d5db;
  line-height: 1;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(169, 57, 70, 0.18);
  }

  /* 호버/포커스 시 툴팁 표시 */
  &:hover + div,
  &:focus + div {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
  }
`;

export const HelpTooltip = styled.div`
  position: absolute;
  top: -50%;
  right: 125%;
  transform: translateY(-50%) translateX(6px);
  opacity: 0;
  pointer-events: none;
  transition: all 0.18s ease;
  background: #eef0f2;
  color: #555;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
`;
