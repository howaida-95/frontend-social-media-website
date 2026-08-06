import { Outlet } from "react-router-dom";
import Navbar from "@/layout/Navbar";
import Sidebar from "@/layout/Sidebar";

const MainLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export default MainLayout;