import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Moon, Sun, Settings, LogOut, Search,
  Tv, Users, Scan, LayoutDashboard,
  Radio, PlaySquare, ChevronRight, MessageSquare, Bookmark, ListVideo, Wand2, Mic2, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
/** @type {any} */
const AnyButton = Button;
import NotificationBell from "@/components/notifications/NotificationBell";
import ChannelSwitcher from "@/components/layout/ChannelSwitcher";

/**
 * Top navigation bar.
 * @param {{user:any, darkMode:boolean, setDarkMode:Function, currentPageName:string, mobileMenuOpen:boolean, setMobileMenuOpen:Function, notifications: any[], onMarkAsRead:Function, onMarkAllRead:Function, onDeleteNotification:Function, newVideos:any[]}} props
 */
export default function TopNav({
  user,
  darkMode,
  setDarkMode,
  currentPageName,
  mobileMenuOpen,
  setMobileMenuOpen,
  notifications,
  onMarkAsRead,
  onMarkAllRead,
  onDeleteNotification,
  newVideos = [],
}) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Channel switching is handled by the CreatorOS context
  /** @type {import('react').MutableRefObject<HTMLDivElement | null>} */
  const dropdownRef = useRef(null);
  /** @type {import('react').MutableRefObject<HTMLDivElement | null>} */
  const createRef = useRef(null);
  const navigate = useNavigate();
  const { logout, navigateToLogin } = useAuth();
  const isAdmin = user?.role === "admin";

  /** @type {any[]} */
  const _newVideos = newVideos;

  // Close dropdown on outside click
  useEffect(() => {
    /** @param {MouseEvent} e */
    const handler = (e) => {
      const t = /** @type {Node | null} */ (e.target);
      if (dropdownRef.current && !dropdownRef.current.contains?.(t)) {
        setAccountOpen(false);
      }
      if (createRef.current && !createRef.current.contains?.(t)) {
        setCreateOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /** @param {import('react').FormEvent<HTMLFormElement>} e */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  /** @param {string} to */
  const openCreatorTool = (to) => {
    setCreateOpen(false);
    setAccountOpen(false);
    if (!user?.email) {
      navigateToLogin(to);
      return;
    }
    navigate(to);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl ${darkMode ? "bg-[#03080f]/97 border-b border-[#0d1820]" : "bg-white border-b border-gray-200"}`}
      role="navigation"
    >
      <div className="flex items-center justify-between h-14 px-3 sm:px-5 gap-3">

        {/* Left: logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/" className="flex items-center gap-1.5 group">
            <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
              <div className="absolute inset-0 rounded-lg bg-[#1e78ff]/20 border border-[#1e78ff]/40" />
              <span className="relative text-[#1e78ff] font-black text-base">V</span>
            </div>
            <span
              className="font-black text-base tracking-widest uppercase hidden sm:block"
              style={{ background: "linear-gradient(135deg,#1e78ff,#00c8ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              VStream
            </span>
          </Link>
        </div>

        {/* Center: search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl items-center gap-2 rounded-full border border-[#12305f] bg-[#030810]/78 px-3 py-2">
          <Search className="h-4 w-4 text-blue-300/45" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search videos, live creators, communities..."
            className="min-w-0 flex-1 bg-transparent text-sm text-[#e8f4ff] outline-none placeholder:text-blue-300/35"
          />
        </form>

        {/* Right: icons + avatar */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Mobile search */}
          <button
            className="md:hidden p-2 rounded-lg text-blue-400 hover:bg-blue-900/20 transition-colors"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="w-4 h-4" />
          </button>

          <AnyButton 
            variant="ghost" 
            size="icon" 
            onClick={() => setDarkMode(!darkMode)} 
            className="text-blue-400 hover:text-blue-200 hover:bg-blue-900/20"
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </AnyButton>

          {user && (
            <NotificationBell
              notifications={notifications}
              onMarkAsRead={onMarkAsRead}
              onMarkAllRead={onMarkAllRead}
              onDelete={onDeleteNotification}
              newVideos={_newVideos}
            />
          )}

          {/* Avatar / account dropdown OR Sign In button */}
          {/* LIVE dot */}
          <Link to="/Live" className="hidden md:flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white transition-colors px-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </Link>

          <div className="relative block" ref={createRef}>
            <button
              type="button"
              onClick={() => user?.email ? setCreateOpen((open) => !open) : openCreatorTool("/CreatorOS")}
              className="flex items-center gap-1.5 rounded-xl bg-[#1e78ff] px-3 py-2 text-xs font-black text-white transition hover:bg-[#00a6ff]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Creator OS</span>
            </button>
            <AnimatePresence>
              {createOpen && user?.email && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-[#0d1820] bg-[#030810] shadow-2xl shadow-black/60"
                >
                  <button onClick={() => openCreatorTool("/CreatorOS")} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-blue-200/75 transition hover:bg-blue-900/20 hover:text-white">
                    <Mic2 className="h-4 w-4 text-[#00c8ff]" />
                    Creator OS
                  </button>
                  <button onClick={() => openCreatorTool("/CreatorOS?section=production&tool=artforge")} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-blue-200/75 transition hover:bg-blue-900/20 hover:text-white">
                    <Wand2 className="h-4 w-4 text-[#a855f7]" />
                    ArtForge AI
                  </button>
                  <button onClick={() => openCreatorTool("/StreamerDashboard")} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-blue-200/75 transition hover:bg-blue-900/20 hover:text-white">
                    <Radio className="h-4 w-4 text-red-300" />
                    Go Live
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user ? (
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e78ff] to-[#a855f7] flex items-center justify-center text-white text-sm font-black hover:ring-2 hover:ring-[#1e78ff]/60 transition-all overflow-hidden"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.full_name?.charAt(0) || "U"
              )}
            </button>

            <AnimatePresence>
              {accountOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-[#030810] border border-[#0d1820] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50"
                >
                  {/* User header */}
                  <div className="px-4 py-4 border-b border-[#0d1820]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e78ff] to-[#a855f7] flex items-center justify-center text-white font-black text-base flex-shrink-0 overflow-hidden">
                        {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : (user?.full_name?.charAt(0) || "U")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#e8f4ff] truncate">{user?.full_name || "User"}</p>
                        <p className="text-xs text-blue-400/50 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Channel switcher */}
                  <div className="border-b border-[#0d1820] py-1">
                    <p className="text-xs font-bold text-blue-400/30 uppercase tracking-widest px-4 py-1.5">Switch Channel</p>
                    <ChannelSwitcher user={user} />
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <MenuItem icon={Tv} label="View Channel" to="/Channel" onClick={() => setAccountOpen(false)} />
                    <MenuItem icon={PlaySquare} label="Your Clips" to="/Shorts" onClick={() => setAccountOpen(false)} />
                  </div>

                  {/* Creator actions */}
                  {user?.email && (
                    <div className="border-t border-[#0d1820] py-1">
                      <p className="text-xs font-bold text-blue-400/30 uppercase tracking-widest px-4 py-1.5">Creator</p>
                      <MenuButton icon={Mic2} label="Creator OS" onClick={() => openCreatorTool("/CreatorOS")} />
                      <MenuButton icon={Wand2} label="ArtForge AI" onClick={() => openCreatorTool("/CreatorOS?section=production&tool=artforge")} />
                      <MenuItem icon={Radio} label="Go Live Now" to="/StreamerDashboard" onClick={() => setAccountOpen(false)} />
                    </div>
                  )}

                  {/* Staff */}
                  {isAdmin && (
                    <div className="border-t border-[#0d1820] py-1">
                      <p className="text-xs font-bold text-blue-400/30 uppercase tracking-widest px-4 py-1.5">Staff</p>
                      <MenuItem icon={Scan} label="Staff Tools" to="/AITools" onClick={() => setAccountOpen(false)} />
                    </div>
                  )}

                  <div className="border-t border-[#0d1820] py-1">
                    <MenuItem icon={Settings} label="Settings" to="/Settings" onClick={() => setAccountOpen(false)} />
                    <button
                      onClick={() => { setAccountOpen(false); logout('/login'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-300/70 hover:bg-blue-900/20 hover:text-blue-200 transition-colors"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          ) : (
            <AnyButton onClick={() => navigateToLogin(window.location.href)}>
              <Users className="w-4 h-4" /> Sign In
            </AnyButton>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`md:hidden border-t overflow-hidden ${darkMode ? "border-[#0d1820]" : "border-gray-200"}`}
          >
            <form onSubmit={handleSearch} className="flex items-center px-3 py-2 gap-2">
              <div className={`flex flex-1 items-center rounded-xl overflow-hidden border ${darkMode ? "bg-[#030810] border-[#0d1820]" : "bg-gray-100 border-gray-300"}`}>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 px-3 py-2 text-sm text-[#c8dff5] placeholder-blue-400/30 outline-none bg-transparent"
                />
                <button type="submit" className="px-3 py-2 text-blue-400">
                  <Search className="w-4 h-4" />
                </button>
              </div>
              <button type="button" onClick={() => setSearchOpen(false)} className="text-blue-400/50 hover:text-blue-300 p-1">
                <X className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile slide-out menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="md:hidden border-t border-[#0d1820] bg-[#030810]"
          >
            <div className="px-4 py-3 space-y-0.5 max-h-[75vh] overflow-y-auto">
              {[
                { label: "Home", icon: LayoutDashboard, to: "/" },
                { label: "Live", icon: Radio, to: "/Live" },
                { label: "Shorts/Reels", icon: PlaySquare, to: "/Shorts" },
                { label: "Communities", icon: MessageSquare, to: "/Communities" },
                { label: "Saved", icon: Bookmark, to: "/SavedVideos" },
                { label: "Playlists", icon: ListVideo, to: "/Playlists" },
                ...(user ? [
                  { label: "Go Live", icon: Radio, to: "/StreamerDashboard" },
                  { label: "My Channel", icon: Tv, to: "/Channel" },
                ] : []),
                ...(isAdmin ? [
                  { label: "Users", icon: Users, to: "/UserViewer" },
                  { label: "Staff Tools", icon: Scan, to: "/AITools" },
                ] : []),
                { label: "Settings", icon: Settings, to: "/Settings" },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-blue-400/70 hover:bg-blue-900/20 hover:text-blue-200 transition-colors"
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              ))}
              {user && <div className="pt-2 mt-2 border-t border-[#0d1820]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout('/login');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400/70 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/**
 * @param {{icon: any, label: string, to?: string, onClick?: (e?: any)=>void}} props
 */
function MenuItem({ icon: Icon, label, to = "/", onClick = undefined }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-300/70 hover:bg-blue-900/20 hover:text-blue-200 transition-colors"
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="w-3.5 h-3.5 text-blue-400/20" />
    </Link>
  );
}

/** @param {{icon:any, label:string, onClick?: (e?: any)=>void}} props */
function MenuButton({ icon: Icon, label, onClick = undefined }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-blue-300/70 transition-colors hover:bg-blue-900/20 hover:text-blue-200"
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="w-3.5 h-3.5 text-blue-400/20" />
    </button>
  );
}