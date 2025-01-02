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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MdOutlineRequestPage } from "react-icons/md";

import {
  Activity,
  Bus,
  BusFront,
  Calendar,
  Home,
  SquareChartGantt,
  StickyNote,
  Ticket,
  User,
  Users,
  Wrench,
  UserPen,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import icon from "../assets/default-profile-icon.png";
import { useDispatch, useSelector } from "react-redux";
import * as AccountService from "../services/accountService";
import { resetAccount } from "@/redux/accountSlide";
import * as Message from "../components/ui/alert";
import logo from "../assets/logo.png";
// Menu item
const items = [
  {
    title: "Dashboard",
    url: "/manage/dashboard",
    icon: Home,
  },
  {
    title: "Employee",
    url: "/manage/employee",
    icon: Users,
  },
  {
    title: "Employee Request",
    url: "/manage/request",
    icon: MdOutlineRequestPage,
  },
  {
    title: "Customer",
    url: "/manage/customer",
    icon: User,
  },
  {
    title: "Opinion",
    url: "/manage/opinion",
    icon: StickyNote,
  },
  {
    title: "Schedule",
    url: "/manage/schedule",
    icon: Calendar,
  },
  {
    title: "Bus",
    url: "/manage/bus",
    icon: BusFront,
  },
  {
    title: "Bus Stop",
    url: "/manage/bus-stop",
    icon: Bus,
  },
  {
    title: "Line",
    url: "/manage/line",
    icon: Activity,
  },
  {
    title: "Ticket",
    url: "/manage/ticket",
    icon: Ticket,
  },
  {
    title: "Maintenance",
    url: "/manage/maintenance",
    icon: Wrench,
  },
  {
    title: "Incentives",
    url: "/manage/incentives",
    icon: SquareChartGantt,
  },
];

export function AppSidebar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    console.log(isMenuOpen);
  });

  const handleLogoutAccount = async () => {
    await AccountService.logoutAccount();
    localStorage.removeItem("access_token");
    dispatch(resetAccount());
    Message.success("Logout successfully");
    navigate("/login");
  };
  // Đóng menu khi click ra ngoài
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (menuRef.current && !menuRef.current.contains(event.target)) {
  //       setIsMenuOpen(false);
  //     }
  //   };

  //   document.addEventListener("click", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("click", handleClickOutside);
  //   };
  // }, []);

  const account = useSelector((state) => state.account);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className='text-xl h-10 w-full flex font-bold items-center justify-start'>
          <img src={logo} className='w-auto h-10'></img>
          <span className='font-bold text-3xl text-green-700'>Busty</span>
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
          <Avatar>
            <AvatarImage src={account.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-semibold'>{account.name}</span>
            <span className='text-sm text-gray-500'>Manager</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
