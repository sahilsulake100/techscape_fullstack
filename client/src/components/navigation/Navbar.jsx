import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Code2, Home, Calendar, Users, Plus, LogOut } from "lucide-react";
import { useUser, useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="border-b-2 border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-xl bg-gradient-vibrant shadow-md group-hover:shadow-neon transition-all">
              <Code2 className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-extrabold gradient-text-vibrant">
              TechScape
            </span>
          </Link>

          {/* Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-gray-800 font-semibold hover:text-electric-blue">
              <Home className="w-4 h-4" />
              Home
            </Link>

            <Link to="/events" className="flex items-center gap-2 text-gray-800 font-semibold hover:text-electric-blue">
              <Calendar className="w-4 h-4" />
              Events
            </Link>

            <Link to="/teams" className="flex items-center gap-2 text-gray-800 font-semibold hover:text-electric-blue">
              <Users className="w-4 h-4" />
              Teams
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard/create-event")}
                  className="hidden md:flex items-center gap-2 border-2 font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Post Event
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="font-semibold"
                >
                  Dashboard
                </Button>

                <span className="text-sm font-semibold text-gray-600 hidden sm:inline">
                  Hi, {user.firstName || user.fullName}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="font-semibold flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/sign-in")}
                  className="font-semibold"
                >
                  Sign In
                </Button>

                <Button
                  variant="vibrant"
                  size="sm"
                  onClick={() => navigate("/sign-up")}
                  className="font-semibold"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
