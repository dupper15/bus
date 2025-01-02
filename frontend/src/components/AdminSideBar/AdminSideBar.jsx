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
import { LogOut } from "lucide-react";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
// Menu item
const items = [
  {
    title: "Manager",
    url: "/admin",
    icon: User,
  },
];

export function AdminSideBar() {
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
      <SidebarFooter>
        <div className='flex justify-center'>
          <Link
            className='font-semibold flex justify-center items-center text-center hover:underline cursor-pointer hover:text-green-500'
            to={"/login"}>
            <LogOut className='mr-2 w-4 h-4' />
            Log out
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
