import SignInPage from "./pages/SignInPage/SignInPage";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import MainPage from "./pages/MainPage/MainPage";
import MainBuyPage from "./pages/BuyTicketPage/MainBuyPage";
import Page404 from "./pages/404Page/page404";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import axios from "axios";
import DashboardPage from "./pages/Manager/DashboardPage/DashboardPage";
import EmployeePage from "./pages/Manager/EmployeePage/EmployeePage";
import DashboardLayout from "./pages/Manager/DashboardPage/DashboardLayout";


axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
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

        <Route path="/manager" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="employee" element={<EmployeePage />} />
        </Route>

      </Routes>
    </Router> 
  );
}

