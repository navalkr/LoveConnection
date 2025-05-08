import { useState } from "react";
import { Link } from "wouter";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyNotification() {
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const handleResendEmail = async () => {
    try {
      // Call the API to resend the verification email
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        setResendSuccess(true);
      } else {
        // Handle error
        const data = await response.json();
        console.error('Failed to resend verification email:', data.error);
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
    }
  };
  
  return (
    <div className="container max-w-md mx-auto px-4 py-10">
      <Card className="bg-white shadow-xl rounded-xl">
        <CardHeader className="space-y-1 flex items-center flex-col">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify Your Account</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification email to your inbox
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 p-4 rounded-lg space-y-3">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 mr-2" />
              <p className="text-sm">
                You need to complete face verification before accessing your account. Please check your email and click the link to verify your identity.
              </p>
            </div>
            
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 mr-2" />
              <p className="text-sm">
                If you don't see the email, please check your spam folder or request a new verification email.
              </p>
            </div>
          </div>
          
          {resendSuccess && (
            <div className="bg-green-50 p-4 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-700">
                Verification email has been resent successfully!
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            onClick={handleResendEmail} 
            className="w-full"
            disabled={resendSuccess}
          >
            Resend Verification Email
          </Button>
          <div className="text-center text-sm text-neutral-500">
            Already verified? <Link href={ROUTES.LOGIN}>
              <span className="text-primary font-medium hover:underline cursor-pointer">
                Sign in
              </span>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}