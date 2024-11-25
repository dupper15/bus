import SignInPage from "./pages/SignInPage/SignInPage";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import MainPage from "./pages/MainPage/MainPage";
import MainBuyPage from "./pages/BuyTicketPage/MainBuyPage";
import Page404 from "./pages/404Page/page404";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Review from "./pages/BuyTicketPage/Review";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<WelcomePage />} />
        <Route path='/login' element={<SignInPage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/home/*' element={<MainPage />} />
        <Route path='/payment/*' element={<MainBuyPage />} />
        <Route path='*' element={<Page404 />} />
      </Routes>
    </Router>
  );
}
