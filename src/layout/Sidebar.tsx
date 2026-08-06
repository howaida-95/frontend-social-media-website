import { NavLink } from "react-router-dom";
import { ROUTES } from "@/constants";
import { Home, MessageCircle, Users, Search, User, CirclePlus } from "lucide-react";


const links = [
    { to: ROUTES.HOME, label: "Feed", icon: Home },
    { to: ROUTES.MESSAGES, label: "Messages", icon: MessageCircle },
    { to: ROUTES.CONNECTIONS, label: "Connections", icon: Users },
    { to: ROUTES.DISCOVER, label: "Discover", icon: Search },
    { to: ROUTES.PROFILE, label: "Profile", icon: User },
    { to: ROUTES.CREATE_POST, label: "Create Post", icon: CirclePlus },
];

const Sidebar = () => {
  return (
    <aside className="w-56 border-r p-4">
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "font-semibold text-blue-600" : "text-gray-700"
            }
          >
            <link.icon />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
export default Sidebar;