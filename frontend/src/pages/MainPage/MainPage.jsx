import { Route, Routes, useLocation } from "react-router-dom";
import TicketFare from "./TicketFare";
import BusRoute from "./BusRoute";
import ProfilePage from "../Manager/ProfilePage/ProfilePage";
import CustomerNavbar from "../../components/CustomerNavBar/CustomerNavBar";
import CustomerMaterial from "../MainPage/CustomerMaterial";

const MainPage = () => {
  const location = useLocation();

  // Define routes where the CustomerNavbar should not be displayed
  const hideNavbarRoutes = ["/home/busroute"];

  // Determine if the current route requires hiding the navbar
  const hideNavbar = hideNavbarRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div className='flex h-screen'>
      {/* Render CustomerNavbar only when it's not hidden */}
      {!hideNavbar && <CustomerNavbar />}
      <div className={`h-screen ${hideNavbar ? "basis-full" : "basis-full"}`}>
        <Routes>
          <Route index element={<TicketFare />} />
          <Route path='busroute' element={<BusRoute />} />
          <Route path='info' element={<ProfilePage />} />
          <Route path='your-material' element={<CustomerMaterial />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainPage;
