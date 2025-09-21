import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import WebHome from "./pages/web/home/index";
import WebConsultation from "./pages/web/consultation/index";
import ConsultationStart from "./pages/web/consultation/start/ConsultationStart";
import ConstructionEquipmentConsultation from "./pages/web/construction-equipment-operator";
import WorkRecords from "./pages/web/records/index";
import Login from "./pages/web/login/index";
import TabletConsultation from "./pages/tablet/consultation/index";
import WelcomeView from "./pages/tablet/WelcomeView";
import NotFound from "./NotFound";
import CompletionScreen from "./pages/web/consultationComplete/CompletionScreen";
import ConstructionEquipmentOperator from "./pages/tablet/construction-equipment-operator";
import TabletLayout from "./layouts/TabletLayout";
import UserTypeSelection from "./pages/UserTypeSelection";
import FormGenerator from "./pages/web/form-generator";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/", element: <UserTypeSelection /> },
      { path: "/admin", element: <WebHome /> },
      { path: "/admin/form-generator", element: <FormGenerator /> },
      { path: "/consultation", element: <WebConsultation /> },
      { path: "/consultation/start", element: <ConsultationStart /> },
      { path: "/consultation/complete", element: <CompletionScreen /> },
      { path: "/records", element: <WorkRecords /> },
      {
        path: "/construction-equipment-operator/*",
        element: <ConstructionEquipmentConsultation />,
      },

      // ✅ 태블릿 공통 레이아웃 + 하위 라우트
      {
        path: "/tablet",
        element: <TabletLayout title="AI 민원실" />,
        children: [
          { index: true, element: <WelcomeView /> }, // "/tablet"
          { path: "consultation", element: <TabletConsultation /> }, // "/tablet/consultation"
          {
            path: "construction-equipment-operator",
            element: <ConstructionEquipmentOperator />,
          },
        ],
      },
    ],
    errorElement: <NotFound />,
  },
]);

export default router;
