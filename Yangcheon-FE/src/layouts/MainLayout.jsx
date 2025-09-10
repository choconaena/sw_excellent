import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import { useState } from "react";
import Header from "../components/Header";

const Container = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
`;

const MainWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${(props) => (props.$isCollapsed ? "60px" : "200px")};
  transition: margin-left 0.3s ease;
`;

const Title = styled.h1`
  font-size: 1.2rem;
  margin: 0;
`;

const Content = styled.main`
  flex: 1;
  background-color: #fff;
  overflow: auto;
`;

const MainLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Container>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <MainWrapper $isCollapsed={isCollapsed}>
        <Header />
        <Content>{children}</Content>
      </MainWrapper>
    </Container>
  );
};

export default MainLayout;
