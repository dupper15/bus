import { EmployeeSideBar } from "@/components/EmployeeSideBar/EmployeeSideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom"; // Import Outlet

const Layout = () => {
  return (
    <SidebarProvider>
      <EmployeeSideBar />
      <main className="w-full items-center justify-center">
        <SidebarTrigger />
        {/* Outlet sẽ render nội dung của các route con */}
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default Layout;
