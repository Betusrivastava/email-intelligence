import { useAuth } from "@/contexts/auth";
import Login from "@/components/login";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const { login, isAuthenticated, loginError, loginLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  // Handle successful login
  const handleLogin = () => {
    // The actual redirect is handled by the AuthContext
  };

  return <Login onLogin={handleLogin} />;
}
