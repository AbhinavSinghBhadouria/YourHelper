import { useContext, useEffect } from "react";
import { AuthContext } from "../authContext";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    try {
      setLoading(true);
      const data = await login({ email, password });
      setUser(data?.user || null);
      return data;
    } catch (err) {
      console.error("Login error:", err);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    try {
      setLoading(true);
      const data = await register({ username, email, password });

      // IMPORTANT: set user after register
      setUser(data?.user || null);

      return data;
    } catch (err) {
      console.error("Register error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Needed for page refresh persistence
  const fetchMe = async () => {
    try {
      setLoading(true);
      const data = await getMe();
      setUser(data?.user || null);
      return data?.user;
    } catch (err) {
      console.error("Fetch user error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getAndSetUser = async () => {
      const data = await getMe()
      setUser(data.user)
      setLoading(false)
    }
    getAndSetUser()
  }, [])

  return {
    user,
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
    fetchMe,
  };
};