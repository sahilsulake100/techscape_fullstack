 
import { Outlet } from "react-router-dom";
import Navbar from '../components/navigation/Navbar'; 
import Footer from '../components/navigation/Footer';  

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
