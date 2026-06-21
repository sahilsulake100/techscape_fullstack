import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../contexts/AuthContext";
import Loader from "./Loader";

const ProtectedRoute = ({ children }) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <Loader />;

  if (!user) return <Navigate to="/sign-in" replace />;

  return children ? children : <Outlet />;
};

export default ProtectedRoute;