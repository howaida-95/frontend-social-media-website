import { NavLink } from "react-router-dom";
import { ROUTES } from "@/constants";
import {
  Home,
  MessageCircle,
  Users,
  Search,
  User,
  CirclePlus,
  Zap,
  LogOut,
  X,
} from "lucide-react";

const links = [
  { to: ROUTES.HOME, label: "Feed", icon: Home },
  { to: ROUTES.MESSAGES, label: "Messages", icon: MessageCircle },
  { to: ROUTES.CONNECTIONS, label: "Connections", icon: Users },
  { to: ROUTES.DISCOVER, label: "Discover", icon: Search },
  { to: ROUTES.PROFILE, label: "Profile", icon: User },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ mobileOpen = false, onClose }: SidebarProps) => {
  return (
    <>
      {/* Mobile scrim */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-sidebar shrink-0 flex-col
          bg-(--color-surface) border-r border-(--color-border)
          transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-(--color-border)">
          <NavLink
            to={ROUTES.HOME}
            className="flex items-center gap-1.5 font-bold text-xl text-(--color-primary)"
          >
            <Zap className="h-5 w-5 fill-(--color-primary)" strokeWidth={0} />
            <span>pingup</span>
          </NavLink>
          <button
            onClick={onClose}
            className="btn-icon lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-4 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-sm px-3 py-2.5
                 text-sm font-medium transition-colors duration-150
                 ${
                   isActive
                     ? "bg-indigo-50 text-(--color-primary)"
                     : "text-neutral-500 hover:bg-(--color-surface-muted) hover:text-(--color-content)"
                 }`
              }
            >
              <link.icon className="h-4.5 w-4.5" strokeWidth={2} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Create Post CTA */}
        <div className="px-4">
          <NavLink
            to={ROUTES.CREATE_POST}
            onClick={onClose}
            className="btn btn-primary btn-lg w-full gap-2"
          >
            <CirclePlus className="h-4 w-4" />
            Create Post
          </NavLink>
        </div>

        <div className="flex-1" />

        {/* User footer */}
        <div className="flex items-center gap-3 border-t border-(--color-border) px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-surface-muted) text-[var(--color-neutral-500)]">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-(--color-content)">
              John Warren
            </p>
            <p className="truncate text-xs text-content-muted">
              @john_warren
            </p>
          </div>
          <button className="btn-icon" aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;