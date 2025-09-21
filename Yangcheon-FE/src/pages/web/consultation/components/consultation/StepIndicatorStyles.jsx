import styled from "styled-components";

export const Container = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

export const StepList = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

export const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
`;

export const StepNumber = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;

  background-color: ${(props) => {
    if (props.$isCompleted) return "#4caf50";
    if (props.$isActive) return "#dc3545";
    return "#e9ecef";
  }};

  color: ${(props) => {
    if (props.$isCompleted || props.$isActive) return "white";
    return "#666";
  }};
`;

export const StepTitle = styled.div`
  font-size: 1rem;
  text-align: center;
  color: ${(props) => (props.$isActive ? "#dc3545" : "#666")};
  font-weight: ${(props) => (props.$isActive ? "600" : "normal")};
  white-space: nowrap;
`;

export const StepConnector = styled.div`
  position: absolute;
  top: 14px;
  left: calc(50% + 14px);
  width: calc(100% - 28px);
  height: 2px;
  background-color: ${(props) => (props.$isCompleted ? "#4caf50" : "#e9ecef")};
  transition: background-color 0.3s ease;
`;
