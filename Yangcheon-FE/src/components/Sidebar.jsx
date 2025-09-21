// src/components/layout/Sidebar.jsx
import { useNavigate, useLocation } from "react-router-dom";
import * as S from "./SidebarStyle";
import { isRealtimeActive } from "../ws/realtimeState";
import { stopRealtimeEverywhere } from "../ws/teardown";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "home", label: "메인홈", icon: "🏠", path: "/admin" },
    { id: "records", label: "업무기록", icon: "📋", path: "/records" },
    { id: "form-generator", label: "신규 양식", icon: "📝", path: "/admin/form-generator" },
  ];

  const handleMenuClick = async (path) => {
    // 실시간 연결이 살아있으면 먼저 경고
    if (isRealtimeActive()) {
      const ok = window.confirm(
        "이동하면 실시간 연결이 종료됩니다. 다시 처음부터 상담을 진행해야합니다. 계속 이동할까요?"
      );
      if (!ok) return;
    }
    // 웹 STT/WS 정리 + 태블릿에 stop_all → /tablet 이동
    await stopRealtimeEverywhere();
    navigate(path);
  };

  return (
    <S.Container $isCollapsed={isCollapsed}>
      <S.ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>
        <S.HamburgerIcon>☰</S.HamburgerIcon>
      </S.ToggleButton>

      <S.MenuList>
        {menuItems.map((item) => (
          <S.MenuItem
            key={item.id}
            $isActive={location.pathname === item.path}
            onClick={() => handleMenuClick(item.path)}
          >
            <S.MenuIcon>{item.icon}</S.MenuIcon>
            {!isCollapsed && (
              <S.MenuLabel $isCollapsed={isCollapsed}>{item.label}</S.MenuLabel>
            )}
          </S.MenuItem>
        ))}
      </S.MenuList>
    </S.Container>
  );
};

export default Sidebar;
