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
} from "@/components/ui/sidebar"

import { Activity, Bus, BusFront, Calendar, Home, SquareChartGantt, StickyNote, Ticket, User, Users, Wrench } from "lucide-react"
import {Link} from 'react-router-dom'
import icon from "../assets/default-profile-icon.png";

//Menu item
const items = [
    {
      title: "Dashboard",
      url: "/manager/dashboard",
      icon: Home,
    },
    {
      title: "Employee",
      url: "/manager/employee",
      icon: Users,
    },
    {
      title: "Customer",
      url: "#",
      icon: User,
    },
    {
      title: "Opinion",
      url: "#",
      icon: StickyNote
    },
    {
      title: "Schedule",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Bus",
      url: "#",
      icon: BusFront
    },
    {
      title: "Line",
      url: "#",
      icon: Activity,
    },
    {
      title: "Stop",
      url: "#",
      icon: Bus
    },
    {
      title: "Line",
      url: "#",
      icon: Ticket,
    },
    {
      title: "Maintenance",
      url: "#",
      icon: Wrench
    },
    {
      title: "Incentives",
      url: "#",
      icon: SquareChartGantt
    }
  ]
  
export function AppSidebar() {
    return (
        <Sidebar>
          <SidebarHeader>
            <div className="text-xl font-bold items-center justify-center">
              <span className="font-extrabold text-2xl text-[#4CAF50]">Busty</span>
              </div>  
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu >
                      {items.map((item) => (
                        <SidebarMenuItem key={item.title} >
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
            <div className="flex items-center space-x-4 justify-start">
              <img
                src={icon}
                alt="Profile Icon"
                className="w-10 h-10 rounded-full border border-gray-200 cursor-pointer"
              />
                  <div className="flex flex-col">
                      <span className="font-semibold">Dương Lâm</span>
                      <span className="text-sm text-gray-500">Manager</span>
                  </div>     
            </div>
            
          </SidebarFooter>
        </Sidebar>
      )
}
  