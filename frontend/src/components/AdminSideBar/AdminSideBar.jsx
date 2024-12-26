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

import { User } from "lucide-react";
import { Link } from "react-router-dom";

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
        <div className="text-xl font-bold items-center justify-center">
          <span className="font-extrabold text-2xl text-[#4CAF50]">Busty</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-green-200">
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
        <div className="flex justify-center">
          <Link className="font-semibold text-center" to={"/login"}>
            Log out
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
