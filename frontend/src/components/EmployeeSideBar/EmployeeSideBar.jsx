import { useState, useRef, useEffect } from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Calendar,
  SquareChartGantt,
  Wrench,
  CalendarX,
  LogOut,
  UserPen,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import icon from "../../assets/default-profile-icon.png";
import { useDispatch, useSelector } from "react-redux";
import * as AccountService from "@/services/accountService";
import * as Message from "@/components/ui/alert";
import { resetAccount } from "@/redux/accountSlide";
// Menu item
const items = [
  {
    title: "Task",
    url: "/employee/task",
    icon: Calendar,
  },
  {
    title: "Request",
    url: "/employee/request",
    icon: SquareChartGantt,
  },
  {
    title: "Maintenance",
    url: "/employee/maintenance",
    icon: Wrench,
  },
];

export function EmployeeSideBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    console.log(isMenuOpen);
  });

  const account = useSelector((state) => state.account);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogoutAccount = async () => {
    await AccountService.logoutAccount();
    localStorage.removeItem("access_token");
    dispatch(resetAccount());
    Message.success("Logout successfully");
    navigate("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className='text-xl font-bold items-center justify-center'>
          <span className='font-extrabold text-2xl text-[#4CAF50]'>Busty</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className='hover:bg-green-200'>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {isMenuOpen && (
        <div
          ref={menuRef}
          className='absolute left-2 bottom-16 bg-white shadow-lg border rounded-lg p-3 w-48 z-50 transition-transform transform scale-95 hover:scale-100 origin-top'>
          <ul className='text-sm text-gray-700'>
            <Link to='profile' onClick={() => setIsMenuOpen((prev) => !prev)}>
              <li className='flex items-center hover:bg-green-100 p-2 cursor-pointer rounded-md transition-colors duration-200'>
                <UserPen className='mr-2 w-4 h-4' />
                Profile
              </li>
            </Link>
            <li
              onClick={handleLogoutAccount}
              className='flex items-center hover:bg-green-100 p-2 cursor-pointer rounded-md transition-colors duration-200'>
              <LogOut className='mr-2 w-4 h-4' />
              Logout
            </li>
          </ul>
        </div>
      )}

      <SidebarFooter>
        <div
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className='flex items-center space-x-4 justify-start h-500 cursor-pointer relative'>
          <img
            src={icon}
            alt='Profile Icon'
            className='w-10 h-10 rounded-full border border-gray-200'
          />
          <div className='flex flex-col'>
            <span className='font-semibold'>{account.name}</span>
            <span className='text-sm text-gray-500'>Employee</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
