import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/constants";
import FaceVerification from "@/components/auth/FaceVerification";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";

interface VerificationTokenResponse {
  valid: boolean;
  message?: string;
  userId?: number;
  firstName?: string;
  isVerified?: boolean;
}

export default function FaceVerificationPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/face-verification");
  const token = new URLSearchParams(window.location.search).get("token");
  const [isReady, setIsReady] = useState(false);

  // Fetch verification token info
  const { data: tokenInfo, isLoading, error } = useQuery<VerificationTokenResponse>({
    queryKey: ["/api/auth/verification", token],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!token,
  });

  useEffect(() => {
    // If no token provided, redirect to login
    if (!token) {
      setLocation(ROUTES.LOGIN);
      return;
    }
    
    // If token info is loaded and valid, set ready
    if (tokenInfo && tokenInfo.valid) {
      // Check if already verified
      if (tokenInfo.isVerified) {
        setLocation(ROUTES.HOME);
        return;
      }
      setIsReady(true);
    }
  }, [token, tokenInfo, setLocation]);

  const handleVerificationComplete = () => {
    // Redirect to home page after successful verification
    setLocation(ROUTES.HOME);
  };

  // Show loading state while fetching token info
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4 bg-neutral-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error if token is invalid
  if (error || (tokenInfo && !tokenInfo.valid)) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4 bg-neutral-50">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="rounded-full bg-red-100 p-3 mx-auto w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Verification Failed</h1>
          <p className="text-neutral-600">
            {tokenInfo?.message || "The verification link is invalid or has expired. Please request a new one."}
          </p>
          <button 
            onClick={() => setLocation(ROUTES.LOGIN)}
            className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-neutral-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">
            Face Verification
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Hello, {tokenInfo?.firstName || 'there'}! Complete your registration by verifying your identity.
          </p>
        </div>
        
        {isReady && tokenInfo && (
          <FaceVerification 
            verificationToken={token!}
            onVerificationComplete={handleVerificationComplete}
          />
        )}
      </div>
    </div>
  );
}