import { Link } from "react-router-dom";
import { ROUTES } from "@/constants";
import { Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b">
      <Link to={ROUTES.HOME} className="font-bold text-lg">Logo</Link>
      <div className="flex gap-4">
        <Menu />
      </div>
    </header>
  );
}
export default Navbar;