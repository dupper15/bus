import { AdminSideBar } from "@/components/AdminSideBar/AdminSideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom"; // Import Outlet

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <AdminSideBar />
      <main className="w-full items-center justify-center">
        <SidebarTrigger />
        {/* Outlet sẽ render nội dung của các route con */}
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default AdminLayout;
