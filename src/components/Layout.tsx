// src/components/Layout.tsx
import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { authService } from "../services/authService";
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Target, 
  BarChart3, 
  FileText, 
  Settings, 
  User, 
  Users,
  LogOut, 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  Menu, 
  X
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { 
    theme, 
    setTheme, 
    notifications, 
    clearNotification, 
    clearAllNotifications, 
    user, 
    logout 
  } = useApp();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/transactions", label: "Transactions", icon: Receipt },
    { path: "/income", label: "Income", icon: TrendingUp },
    { path: "/expenses", label: "Expenses", icon: TrendingDown },
    { path: "/budget", label: "Budget", icon: PiggyBank },
    { path: "/debts", label: "Friends & Debts", icon: Users },
    { path: "/goals", label: "Savings Goals", icon: Target },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/reports", label: "Reports", icon: FileText },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    authService.logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slatebg-light dark:bg-slatebg-dark">
      {/* Sidebar - Desktop Layout */}
      <aside className="hidden lg:flex flex-col w-64 min-w-[256px] border-r border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-4 gap-6 no-print">
        {/* Branding Logo */}
        <Link to="/" className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold shadow-lg shadow-primary/20">
            ⚡
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ApexFinance
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? "bg-primary/10 text-primary dark:text-primary-dark" 
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
                }`
              }
            >
              {({ isActive }) => {
                const Icon = item.icon;
                return (
                  <>
                    <Icon className={`w-5 h-5 ${isActive ? "text-primary dark:text-primary-dark" : "text-slate-400"}`} />
                    {item.label}
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>

        {/* Profile Card & Logout Footer */}
        {user && (
          <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-4 flex flex-col gap-2">
            <Link 
              to="/profile" 
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary dark:text-primary-dark text-sm">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-100 group-hover:text-primary transition-all">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-danger hover:bg-rose-500/10 transition-all duration-200 text-left w-full"
            >
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-danger" />
              Log Out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Drawer Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden no-print">
            <motion.div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              className="relative flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/60 p-4 gap-6 z-10"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
            >
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold">
                    ⚡
                  </div>
                  <span className="font-heading font-extrabold text-lg tracking-tight">
                    ApexFinance
                  </span>
                </Link>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close mobile navigation menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                      }`
                    }
                  >
                    {({ isActive }) => {
                      const Icon = item.icon;
                      return (
                        <>
                          <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-slate-400"}`} />
                          {item.label}
                        </>
                      );
                    }}
                  </NavLink>
                ))}
              </nav>

              {user && (
                <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-4 flex flex-col gap-2">
                  <Link to="/profile" className="flex items-center gap-3 p-2 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-danger"
                  >
                    <LogOut className="w-5 h-5 text-slate-400" />
                    Log Out
                  </button>
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Page Layout Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Navbar Header */}
        <header className="h-16 border-b border-slate-200/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-lg flex items-center justify-between px-6 z-30 no-print">
          {/* Left mobile menu toggle */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700/60"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation drawer"
            >
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
            
            {/* Global Search Bar layout placeholder */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 w-64 group focus-within:border-primary transition-all">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-all" />
              <input
                type="text"
                placeholder="Global search..."
                className="bg-transparent border-none outline-none text-xs w-full text-slate-800 dark:text-slate-200 placeholder-slate-400"
                aria-label="Global search input"
              />
            </div>
          </div>

          {/* Right Header Preferences controls */}
          <div className="flex items-center gap-3">
            {/* Theme selector */}
            <button
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle light/dark theme"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Notifications Alert Bell Popover */}
            <div className="relative" ref={notifRef}>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications panel"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-danger text-white rounded-full w-4.5 h-4.5 text-[9px] flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 z-50 max-h-96 overflow-y-auto"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Alert Center
                      </h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-[10px] text-danger hover:underline font-semibold"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 italic">
                        No active budget alerts.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-2.5 rounded-xl border text-xs leading-relaxed flex gap-2 items-start relative ${
                              notif.type === "danger" 
                                ? "bg-rose-500/10 border-rose-500/20 text-danger" 
                                : notif.type === "warning" 
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500" 
                                  : "bg-primary/10 border-primary/20 text-primary"
                            }`}
                          >
                            <span className="flex-1">{notif.message}</span>
                            <button
                              onClick={() => clearNotification(notif.id)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              aria-label="Clear notification"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            {user && (
              <div className="relative" ref={profileRef}>
                <button
                  className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary dark:text-primary-dark text-sm hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  aria-label="User menu"
                >
                  {user.name.split(" ").map(n => n[0]).join("")}
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-2xl p-2.5 flex flex-col gap-1 z-50"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-danger hover:bg-rose-500/10 w-full text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </div>
        </header>

        {/* View Contents Panel - With horizontal layout scrollbars */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
