import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import StockDashboard from "../components/StockDashboard";
import LoginForm from "../components/LoginForm";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import UserManagement from "../components/UserManagement";
import MenuMasuk from "../components/MenuMasuk";
import MenuJual from "../components/MenuJual";

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Tampilkan loading state saat session sedang dicek
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isAdmin={session.user.role === "admin"}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={session.user}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && <StockDashboard />}
            {activeTab === "menu-masuk" && <MenuMasuk />}
            {activeTab === "menu-jual" && <MenuJual />}
            {activeTab === "users" && session.user.role === "admin" && (
              <UserManagement />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
