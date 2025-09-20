import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  User,
  Bell,
  Activity,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiService } from "../../services/api";
import type { BoardSummaryResponse, UserResponse } from "../../types";

// Custom hook
function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isBoardPage = location.pathname.startsWith("/boards/");

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<BoardSummaryResponse[]>(
    []
  );

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileRef, () => setShowProfileDropdown(false));
  useClickOutside(notificationsRef, () => setShowNotifications(false));

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const boards = await apiService.getBoards();
        setNotifications(
          boards
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 5)
        );
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotifications();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigationItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/projects", icon: FolderKanban, label: "Projects" },
    { path: "/boards", icon: LayoutGrid, label: "Boards" },
    { path: "/team", icon: Users, label: "Team" },
  ];

  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg ">
        <div className="flex flex-col h-full ">
          {/* Logo */}
          <div className="p-6 ">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">WiseCamp</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isCurrentPath(item.path)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64 flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              {location.pathname === "/dashboard" && "Dashboard"}
              {location.pathname === "/projects" && "Projects"}
              {location.pathname === "/boards" && "Boards"}
              {location.pathname.startsWith("/team") && "Team"}
              {location.pathname.startsWith("/boards/") && "Kanban Board"}
              {location.pathname.startsWith("/projects/") && "Project Details"}
            </h1>

            <div className="flex items-center space-x-4">
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500" />
                  )}
                </button>
                {showNotifications && (
                  <NotificationDropdown notifications={notifications} />
                )}
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white"
                >
                  <User className="w-5 h-5" />
                </button>
                {showProfileDropdown && (
                  <ProfileDropdown onLogout={handleLogout} user={state.user} />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className={`flex-grow overflow-y-auto ${isBoardPage ? "" : "p-6"}`}
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

const NotificationDropdown: React.FC<{
  notifications: BoardSummaryResponse[];
}> = ({ notifications }) => {
  const navigate = useNavigate();
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm p-4">No new notifications</p>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => navigate(`/boards/${notification.id}`)}
              className="w-full text-left flex items-start gap-3 p-4 hover:bg-gray-50"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  New board created:{" "}
                  <span className="font-medium">{notification.name}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

const ProfileDropdown: React.FC<{
  onLogout: () => void;
  user: UserResponse | null;
}> = ({ onLogout, user }) => {
  const navigate = useNavigate();
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
      <div className="p-3 border-b flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>
      <div className="py-1">
        <button
          onClick={() => navigate("/settings")}
          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={onLogout}
          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Layout;
