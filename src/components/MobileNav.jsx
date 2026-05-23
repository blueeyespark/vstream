import { Link } from "react-router-dom";
import { LayoutDashboard, Radio, PlaySquare, MessageSquare, Bookmark } from "lucide-react";


const items = [
  { name: "Home",       icon: LayoutDashboard, to: "/" },
  { name: "Live",       icon: Radio,           to: "/Live" },
  { name: "Shorts",     icon: PlaySquare,      to: "/Shorts" },
  { name: "Community",  icon: MessageSquare,   to: "/Communities" },
  { name: "Saved",      icon: Bookmark,        to: "/SavedVideos" },
];


export default function MobileNav({ currentPageName }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#030810]/97 backdrop-blur-md border-t border-slate-200 dark:border-[#0d1820] safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive = currentPageName === item.name;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-0 ${
                isActive
                  ? "text-[#1e78ff] bg-blue-900/20"
                  : "text-slate-500 dark:text-blue-400/40"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px] font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
