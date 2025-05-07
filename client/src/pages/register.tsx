import { useEffect } from "react";
import { useLocation } from "wouter";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/constants";

export default function Register() {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Redirect authenticated users to discover page
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation(ROUTES.DISCOVER);
    }
  }, [isAuthenticated, isLoading, setLocation]);
  
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm type="register" />
    </div>
  );
}
