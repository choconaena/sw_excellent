import styled from "styled-components";

export const Container = styled.div`
  width: ${(props) => (props.$isCollapsed ? "60px" : "200px")};
  height: 100vh;
  background-color: #f8f9fa;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
`;

export const ToggleButton = styled.button`
  background: none;
  border: none;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e9ecef;

  &:hover {
    background-color: #e9ecef;
  }
`;

export const HamburgerIcon = styled.div`
  font-size: 2rem;
  color: #666;
`;

export const MenuList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${(props) => (props.$isActive ? "#FFF1F2" : "transparent")};
  border-left: ${(props) =>
    props.$isActive ? "4px solid #A93946" : "4px solid transparent"};

  &:hover {
    background-color: #f5f5f5;
  }
`;

export const MenuIcon = styled.div`
  font-size: 1.5rem;
  margin-right: 1.2rem;
  min-width: 20px;
`;

export const MenuLabel = styled.span`
  font-size: 1rem;
  color: #333;
  font-weight: 500;
  opacity: ${(props) => (props.$isCollapsed ? 0 : 1)};
  transform: ${(props) => (props.$isCollapsed ? "scaleX(0)" : "scaleX(1)")};
  transform-origin: left;
  white-space: nowrap;
  transition: opacity 0.3s ease, transform 0.3s ease;
  display: inline-block;
`;
