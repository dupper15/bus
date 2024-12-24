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
} from "lucide-react";
import { Link } from "react-router-dom";
import icon from "../assets/default-profile-icon.png";

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
  {
    title: "ManageManager",
    url: "/manage/manage-manager",
    icon: SquareChartGantt,
  },
];

export function AppSidebar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    console.log(isMenuOpen);
  });
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
            <Link to='profile'>
              <li className='hover:bg-green-100 p-2 cursor-pointer rounded-md transition-colors duration-200'>
                Profile
              </li>
            </Link>
            <li className='hover:bg-green-100 p-2 cursor-pointer rounded-md transition-colors duration-200'>
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
            <span className='font-semibold'>Dương Lâm</span>
            <span className='text-sm text-gray-500'>Manager</span>
          </div>

          {/* Menu */}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
