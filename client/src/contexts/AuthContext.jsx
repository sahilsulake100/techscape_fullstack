import { createContext, useContext, useState, useEffect } from "react";
import API from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await API.get("/auth/me");
          setUser(res.data);
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setIsLoaded(true);
    };

    checkUser();
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const useUser = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  return {
    user: context.user,
    isLoaded: context.isLoaded,
    isSignedIn: !!context.user,
  };
};