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

//Menu item
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
      <SidebarFooter>
        {/* Profile Image */}
        <div className='flex items-center space-x-4 justify-start'>
          <img
            src={icon}
            alt='Profile Icon'
            className='w-10 h-10 rounded-full border border-gray-200 cursor-pointer'
          />
          <div className='flex flex-col'>
            <span className='font-semibold'>Dương Lâm</span>
            <span className='text-sm text-gray-500'>Manager</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
