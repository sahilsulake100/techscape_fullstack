import { Code2, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-gray-300 bg-white/10 backdrop-blur-md mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">TechScape</span>
            </div>
            <p className="text-sm text-gray-600">
              Discover and join the best tech events, hackathons, and workshops.
              Build your skills and connect with the community.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/events" className="hover:text-electric-blue transition-all">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/teams" className="hover:text-electric-blue transition-all">
                  Find Teams
                </Link>
              </li>
              <li>
                <Link to="/create-event" className="hover:text-electric-blue transition-all">
                  Create Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-electric-blue transition-all">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-electric-blue transition-all">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-electric-blue transition-all">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social Icons */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-gray-200 hover:bg-electric-blue/20 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-gray-200 hover:bg-electric-blue/20 transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-gray-200 hover:bg-electric-blue/20 transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="mt-12 pt-8 border-t border-gray-300 text-center text-sm text-gray-600">
          <p>© 2024 TechScape. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
