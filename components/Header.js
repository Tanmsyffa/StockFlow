import { BellIcon, MenuAlt1Icon } from "@heroicons/react/outline";

export default function Header({ user, toggleSidebar }) {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden text-gray-500 mr-3"
              onClick={toggleSidebar}
            >
              <MenuAlt1Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">StockFlow</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="text-right mr-3 hidden md:block">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <div className="relative">
                <div className="bg-black border-2 border-dashed rounded-xl w-10 h-10 overflow-hidden flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=100&h=100&fit=crop"
                    alt="Sample"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
