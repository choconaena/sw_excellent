import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "../store/authStore";
import { logout } from "../services/authService";

export const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
`;

export const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const LogoIcon = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: contain;
`;

export const LogoText = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

export const Subtitle = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0;
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
`;

export const UserName = styled.span`
  font-size: 1rem;
  color: #333;
  font-weight: 500;
`;

export const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background-color: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #dee2e6;
  }
`;

export const LogoTextGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 150px;
  margin-top: 0.5rem;
`;

export const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1.2rem;
  color: #333;
  &:hover {
    background-color: #f8f9fa;
  }
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  &:only-child {
    border-radius: 8px;
  }
`;

const Header = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => setIsDropdownOpen((v) => !v);
  const displayName = isLoading ? "로딩중..." : user?.name || "사용자";

  return (
    <HeaderWrapper>
      <LogoSection>
        <LogoIcon src="/logo.png" alt="로고" />
        <LogoTextGroup>
          <LogoText>양천하이</LogoText>
          <Subtitle>스마트한 민원 응답을 위한 AI 파트너</Subtitle>
        </LogoTextGroup>
      </LogoSection>

      <UserSection ref={dropdownRef}>
        <UserName>{displayName}님</UserName>
        <UserAvatar onClick={toggleDropdown}>👤</UserAvatar>
        {isDropdownOpen && (
          <DropdownMenu>
            <DropdownItem onClick={handleLogout}>로그아웃</DropdownItem>
          </DropdownMenu>
        )}
      </UserSection>
    </HeaderWrapper>
  );
};

export default Header;
