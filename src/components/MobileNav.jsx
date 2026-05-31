import { Link, useLocation } from "react-router-dom";
import { Home, Radio, PlaySquare, MessageSquare, Bookmark } from "lucide-react";

const items = [
  { name: "Home",      icon: Home,          to: "/" },
  { name: "Live",      icon: Radio,         to: "/Live" },
  { name: "Shorts",    icon: PlaySquare,    to: "/Shorts" },
  { name: "Community", icon: MessageSquare, to: "/Communities" },
  { name: "Saved",     icon: Bookmark,      to: "/SavedVideos" },
];

export default function MobileNav() {
  const { pathname } = useLocation();

  const isActive = (to) => {
    if (to === "/") return pathname === "/";
    return pathname.startsWith(to);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#03080f]/97 backdrop-blur-xl border-t border-[#0d1820]">
      <div className="flex items-center justify-around px-1 pt-1.5 pb-safe pb-2">
        {items.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-0"
            >
              <div className={`flex items-center justify-center w-9 h-7 rounded-xl transition-colors ${active ? "bg-[#1e78ff]/20" : ""}`}>
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? "text-[#1e78ff]" : "text-blue-400/45"}`} />
              </div>
              <span className={`text-[10px] font-semibold truncate transition-colors ${active ? "text-[#1e78ff]" : "text-blue-400/40"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}