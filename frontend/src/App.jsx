import SignInPage from "./pages/SignInPage/SignInPage";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import MainPage from "./pages/MainPage/MainPage";
import MainBuyPage from "./pages/BuyTicketPage/MainBuyPage";
import Page404 from "./pages/404Page/page404";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import axios from "axios";
import DashboardPage from "./pages/Manager/DashboardPage/DashboardPage";
import EmployeePage from "./pages/Manager/EmployeePage/EmployeePage";
import DashboardLayout from "./pages/Manager/DashboardPage/DashboardLayout";
import CustomerPage from "./pages/Manager/CustomerPage/CustomerPage";
import OpinionPage from "./pages/Manager/OpinionPage/OpinionPage";
import SchedulePage from "./pages/Manager/SchedulePage/SchedulePage";
import BusPage from "./pages/Manager/BusPage/BusPage";
import StopPage from "./pages/Manager/StopPage/StopPage";
import LinePage from "./pages/Manager/LinePage/LinePage";
import TicketPage from "./pages/Manager/TicketPage/TicketPage";
import MaintenancePage from "./pages/Manager/MaintenancePage/MaintenancePage";
import IncentivesPage from "./pages/Manager/IncentivesPage/IncentivesPage";

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home/*" element={<MainPage />} />
        <Route path="/payment/*" element={<MainBuyPage />} />
        <Route path="*" element={<Page404 />} />

        <Route path="/manage" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="employee" element={<EmployeePage />} />
          <Route path="customer" element={<CustomerPage />} />
          <Route path="opinion" element={<OpinionPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="bus" element={<BusPage />} />
          <Route path="bus-stop" element={<StopPage />} />
          <Route path="line" element={<LinePage />} />
          <Route path="ticket" element={<TicketPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="incentives" element={<IncentivesPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
