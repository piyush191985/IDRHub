import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, List, PlusCircle, MessageCircle, BarChart2, Menu, X, ChevronDown, CreditCard } from 'lucide-react';
import { Header } from './Header';

const navItems = [
  { to: '/agent/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5 mr-2" /> },
  { to: '/agent/properties', label: 'My Properties', icon: <List className="w-5 h-5 mr-2" /> },
  { to: '/agent/add-property', label: 'Add Property', icon: <PlusCircle className="w-5 h-5 mr-2" /> },
  { to: '/messages', label: 'Messages', icon: <MessageCircle className="w-5 h-5 mr-2" /> },
  { to: '/agent/stats', label: 'Stats', icon: <BarChart2 className="w-5 h-5 mr-2" /> },
  { to: '/agent/bookings', label: 'Bookings', icon: <List className="w-5 h-5 mr-2" /> },
  { to: '/transactions', label: 'Transactions', icon: <CreditCard className="w-5 h-5 mr-2" /> },
];

const AgentDashboardLayout: React.FC<{ children?: React.ReactNode; hideHeader?: boolean }> = ({ children, hideHeader }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showTabletMenu, setShowTabletMenu] = useState(false);
  const location = useLocation();

  // Get current page label
  const currentPage = navItems.find(item => item.to === location.pathname) || navItems[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Standard Header */}
      {!hideHeader && <Header />}

      {/* Tablet Navigation Bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
            {/* Current Page Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTabletMenu(!showTabletMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {currentPage.icon}
                <span className="font-medium">{currentPage.label}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* Dropdown Menu */}
              {showTabletMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    {navItems.map(item => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                            isActive ? 'bg-blue-100 text-blue-700' : ''
                          }`
                        }
                        onClick={() => setShowTabletMenu(false)}
                      >
                        {item.icon}
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-500 font-medium">
            Agent Dashboard
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col py-8 px-4 transition-transform duration-300 ${
          showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:static top-0 left-0 h-full z-40 lg:z-auto`}>
          <div className="mb-8 text-2xl font-bold text-blue-700 text-center">Agent Dashboard</div>
          <nav className="flex-1 space-y-2">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-700 ${
                    isActive ? 'bg-blue-600 text-white' : ''
                  }`
                }
                end
                onClick={() => setShowMobileMenu(false)}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {showMobileMenu && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-8 lg:ml-0 overflow-y-auto">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AgentDashboardLayout; 