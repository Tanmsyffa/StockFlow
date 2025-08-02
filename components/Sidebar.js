import { signOut } from "next-auth/react";
import Image from "next/image";

import {
  ChartBarIcon,
  CubeIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  UserGroupIcon,
  LogoutIcon,
} from "@heroicons/react/outline";

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  isAdmin,
}) {
  const navItems = [
    { id: "dashboard", name: "Dashboard", icon: ChartBarIcon },
    { id: "menu-masuk", name: "Barang Masuk", icon: ArrowDownIcon },
    { id: "menu-jual", name: "Barang Terjual", icon: ArrowUpIcon },
    { id: "users", name: "Pengguna", icon: UserGroupIcon, adminOnly: true },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed md:relative inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-30 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col`}
      >
        <div className="p-4 flex items-center border-b border-blue-700">
          <div className="relative rounded-xl w-12 h-12 overflow-hidden">
            <Image
              src="/loginLogo.png"
              alt="Stock Flow"
              fill
              className="object-contain"
            />
          </div>

          <div className="ml-3">
            <h2 className="text-xl font-bold">StockFlow</h2>
            <p className="text-blue-200 text-sm">Inventory Management</p>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            return (
              <button
                key={item.id}
                className={`flex items-center w-full px-4 py-3 mb-1 rounded-lg transition-all ${
                  activeTab === item.id
                    ? "bg-blue-700 text-white shadow-inner"
                    : "text-blue-200 hover:bg-blue-700 hover:bg-opacity-50"
                }`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
              >
                <item.icon className="h-5 w-5 mr-3" aria-hidden="true" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-700">
          <button
            className="flex items-center w-full px-4 py-3 rounded-lg text-blue-200 hover:bg-blue-700"
            onClick={() => {
              signOut({ callbackUrl: "/auth/SignIn" });
            }}
          >
            <LogoutIcon className="h-5 w-5 mr-3" aria-hidden="true" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </>
  );
}
