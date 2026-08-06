import { Link } from "react-router-dom";
import { ROUTES } from "@/constants";
import { Menu, Zap } from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 lg:hidden">
      <Link
        to={ROUTES.HOME}
        className="flex items-center gap-1.5 font-bold text-lg text-[var(--color-primary)]"
      >
        <Zap className="h-4 w-4 fill-[var(--color-primary)]" strokeWidth={0} />
        pingup
      </Link>
      <button
        onClick={onMenuClick}
        className="btn-icon"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>
    </header>
  );
};

export default Navbar;