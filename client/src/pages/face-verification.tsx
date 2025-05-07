import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/constants";
import FaceVerification from "@/components/auth/FaceVerification";

export default function FaceVerificationPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // If user not logged in, redirect to login
    if (!user) {
      setLocation(ROUTES.LOGIN);
      return;
    }
    
    // A short delay to ensure the page has loaded
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user, setLocation]);

  const handleVerificationComplete = () => {
    // Redirect to profile completion page or dashboard
    setLocation(ROUTES.PROFILE);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-neutral-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">
            Face Verification
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Complete your profile by verifying your identity
          </p>
        </div>
        
        {isReady && user && (
          <FaceVerification 
            userId={user.id} 
            onVerificationComplete={handleVerificationComplete}
          />
        )}
      </div>
    </div>
  );
}