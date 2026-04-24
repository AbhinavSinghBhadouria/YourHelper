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
      const data = await login(email, password);
      if (data?.token) localStorage.setItem("auth_token", data.token);
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
      const data = await register(username, email, password);
      if (data?.token) localStorage.setItem("auth_token", data.token);
      setUser(data?.user || null);
      return data;
    } catch (err) {
      console.error("Register error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (token) => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (res.ok) {
        if (data?.token) localStorage.setItem("auth_token", data.token);
        setUser(data?.user || null);
        return data;
      } else {
        throw new Error(data.message || "Google login failed");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      localStorage.removeItem("auth_token");
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
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await getMe();
      setUser(data?.user || null); // safe: getMe() returns undefined on error
      setLoading(false);
    }
    getAndSetUser()
  }, [])

  return {
    user,
    setUser,
    loading,
    setLoading,
    handleLogin,
    handleRegister,
    handleGoogleLogin,
    handleLogout,
    fetchMe,
  };
};