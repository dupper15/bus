import { Link, useNavigate } from "react-router-dom";
import { FaBus } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { CiMap } from "react-icons/ci";
import { useState } from "react";
import { IoTicketOutline } from "react-icons/io5";
import * as AccountService from "../../services/accountService";
import { useDispatch, useSelector } from "react-redux";
import { resetAccount } from "@/redux/accountSlide";
import * as Message from "../ui/alert";
import { IoIosArrowBack } from "react-icons/io";
import { LogOut } from "lucide-react";
import { IoIosArrowForward } from "react-icons/io";
import logo from "../../assets/logo.png";
const CustomerNavbar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogoutAccount = async () => {
    await AccountService.logoutAccount();
    localStorage.removeItem("access_token");
    dispatch(resetAccount());
    Message.success("Logout successfully");
    navigate("/login");
  };

  const toggleSidebar = () => setIsExpanded(!isExpanded);
  const account = useSelector((state) => state.account);

  return (
    <div
      className={`h-screen ${
        isExpanded ? "w-60" : "w-20"
      } bg-white shadow-lg flex flex-col border-r transition-all duration-300 overflow-hidden`}>
      <div className='flex items-center justify-between w-full px-4 py-6 border-b border-gray-200'>
        {isExpanded && (
          <div className='text-xl h-10 w-full flex font-bold items-center justify-start'>
            <img src={logo} className='w-auto h-10'></img>
            <span className='font-bold text-3xl text-green-700'>Busty</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className='text-gray-600 ml-auto hover:text-green-500 transition text-2xl'>
          {isExpanded ? <IoIosArrowBack /> : <IoIosArrowForward />}
        </button>
      </div>

      <nav className='flex-1 flex flex-col items-center mt-6 gap-4'>
        <SidebarItem
          isExpanded={isExpanded}
          to='/home'
          icon={FaBus}
          label='Fares & Tickets'
        />
        <SidebarItem
          isExpanded={isExpanded}
          to='busroute'
          icon={CiMap}
          label='Bus Routes'
        />
        <SidebarItem
          isExpanded={isExpanded}
          to='your-material'
          icon={IoTicketOutline}
          label='Your material'
        />
        <SidebarItem
          isExpanded={isExpanded}
          to='info'
          icon={CgProfile}
          label='Profile'
        />
      </nav>

      <div className='w-full py-4 border-t border-gray-200 flex flex-col items-center cursor-pointer'>
        <img
          src={account.image}
          alt='Profile'
          className='w-12 h-12 rounded-full mb-3 shadow-md border-2 border-green-500'
        />
        {isExpanded && (
          <div className='text-center'>
            <p className='text-gray-800 font-semibold'>{account.name}</p>
            <p className='text-gray-500 text-sm'>Employee</p>
          </div>
        )}
        <p
          onClick={handleLogoutAccount}
          className={`flex ${
            isExpanded ? "" : "flex-col"
          } items-center hover:underline hover:text-green-500 p-2 cursor-pointer rounded-md transition-colors duration-200`}>
          <LogOut className='mr-2 w-4 h-4' />
          Logout
        </p>
      </div>
    </div>
  );
};

const SidebarItem = ({ isExpanded, to, icon: Icon, label }) => {
  return (
    <Link
      to={to}
      className='flex items-center w-full px-4 py-3 rounded-md hover:bg-green-100 transition group'>
      <div className='flex items-center justify-center w-10 h-10 bg-green-50 text-green-600 rounded-lg shadow-sm group-hover:bg-green-500 group-hover:text-white'>
        <Icon className='text-2xl' />
      </div>
      {isExpanded && (
        <span className='ml-4 font-medium tracking-wide text-gray-800'>
          {label}
        </span>
      )}
    </Link>
  );
};

export default CustomerNavbar;
