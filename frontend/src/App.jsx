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
import ManageManagerPage from "./pages/Admin/ManageManagerPage/ManageManagerPage";
import LinePage from "./pages/Manager/LinePage/LinePage";
import TicketPage from "./pages/Manager/TicketPage/TicketPage";
import MaintenancePage from "./pages/Manager/MaintenancePage/MaintenancePage";
import IncentivesPage from "./pages/Manager/IncentivesPage/IncentivesPage";
import AddEmployeePage from "./pages/Manager/EmployeePage/AddEmployeePage";
import DetailEmployeePage from "./pages/Manager/EmployeePage/DetailEmployeePage";
import ProfilePage from "./pages/Manager/ProfilePage/ProfilePage";
import TaskPage from "./pages/Employee/TaskPage/TaskPage";
import RequestPage from "./pages/Employee/RequestPage/RequestPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./pages/Employee/Layout/Layout";
import AdminLayout from "./pages/Admin/AdminLayout/AdminLayout";
import { useDispatch } from "react-redux";
import { updateAccount } from "./redux/accountSlide";
import * as Account from "./services/accountService";
import { isJsonString } from "./utils/token";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";

const queryClient = new QueryClient();

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
  const dispatch = useDispatch();

  const handleGetDetailAccount = async (id, token) => {
    const res = await Account.getDetailAccount(id, token);
    dispatch(updateAccount({ ...res?.data, access_token: token }));
  };

  useEffect(() => {
    const { storageData, decoded } = handleDecoded();
    if (decoded?.id) {
      handleGetDetailAccount(decoded?.id, storageData);
    }
  }, []);

  const handleDecoded = () => {
    let storageData = localStorage.getItem("access_token");
    let decoded = {};
    if (storageData && isJsonString(storageData)) {
      storageData = JSON.parse(storageData);
      decoded = jwtDecode(storageData);
    }
    return { decoded, storageData };
  };

  Account.axiosJWT.interceptors.request.use(
    async (config) => {
      const currentTime = new Date();
      const { decoded } = handleDecoded();
      if (decoded?.exp < currentTime.getTime() / 1000) {
        const data = await Account.refreshTokenJwt();
        config.headers["token"] = `Bearer ${data?.access_token}`;
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path='/' element={<WelcomePage />} />
          <Route path='/login' element={<SignInPage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/home/*' element={<MainPage />} />
          <Route path='/payment/*' element={<MainBuyPage />} />
          <Route path='*' element={<Page404 />} />

          <Route path='/manage' element={<DashboardLayout />}>
            <Route index element={<Navigate to='dashboard' replace />} />
            <Route path='dashboard' element={<DashboardPage />} />
            <Route path='employee' element={<EmployeePage />} />
            <Route path='employee/add-employee' element={<AddEmployeePage />} />
            <Route
              path='employee/:id/detail-employee'
              element={<DetailEmployeePage />}
            />
            {/* <Route path="edit/:id" element={<EditEmployee />} />
            <Route path="details/:id" element={<EmployeeDetails />} /> */}
            <Route path='profile' element={<ProfilePage />} />
            <Route path='customer' element={<CustomerPage />} />
            <Route path='opinion' element={<OpinionPage />} />
            <Route path='schedule' element={<SchedulePage />} />
            <Route path='bus' element={<BusPage />} />
            <Route path='bus-stop' element={<StopPage />} />
            <Route path='line' element={<LinePage />} />
            <Route path='ticket' element={<TicketPage />} />
            <Route path='maintenance' element={<MaintenancePage />} />
            <Route path='incentives' element={<IncentivesPage />} />
          </Route>

          <Route path='/employee' element={<Layout />}>
            <Route path='profile' element={<ProfilePage />} />
            <Route path='request' element={<RequestPage />} />
            <Route path='task' element={<TaskPage />} />
          </Route>

          <Route path='/admin' element={<AdminLayout />}>
            <Route path='' element={<ManageManagerPage />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
