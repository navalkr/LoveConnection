import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { ROUTES } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, Loader2 } from "lucide-react";

// Define schemas for the forms
const requestResetSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, {
    message: "Token is required",
  }),
  newPassword: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RequestResetValues = z.infer<typeof requestResetSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isRequestSubmitting, setIsRequestSubmitting] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // Request reset form
  const requestForm = useForm<RequestResetValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: "",
    },
  });

  // Reset password form
  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      newPassword: "",
      confirmPassword: "",
    },
    values: {
      token: resetToken,
      newPassword: "",
      confirmPassword: "",
    }
  });

  // Handle forgot password request
  const onRequestSubmit = async (data: RequestResetValues) => {
    try {
      setIsRequestSubmitting(true);
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      const result = await response.json();
      
      toast({
        title: "Reset Email Sent",
        description: "If the email is registered, you will receive a reset link.",
      });
      
      // For demo purposes, populate the token field
      if (result.token) {
        setResetToken(result.token);
        setShowResetForm(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRequestSubmitting(false);
    }
  };

  // Handle password reset
  const onResetSubmit = async (data: ResetPasswordValues) => {
    try {
      setIsResetSubmitting(true);
      await apiRequest("POST", "/api/auth/reset-password", {
        token: data.token,
        newPassword: data.newPassword,
      });
      
      toast({
        title: "Success",
        description: "Your password has been reset successfully.",
      });
      
      // Reset the forms
      requestForm.reset();
      resetForm.reset();
      setShowResetForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. The token may be invalid or expired.",
        variant: "destructive",
      });
    } finally {
      setIsResetSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-neutral-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <Heart className="h-8 w-8 text-primary" fill="currentColor" />
          </div>
          <h2 className="mt-2 text-3xl font-bold text-neutral-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Enter your email to receive a password reset link
          </p>
        </div>

        {!showResetForm ? (
          <Form {...requestForm}>
            <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
              <FormField
                control={requestForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="your@email.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={isRequestSubmitting}
              >
                {isRequestSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <FormField
                control={resetForm.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reset Token</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your reset token" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={resetForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="New password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowResetForm(false)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  className="flex-1"
                  disabled={isResetSubmitting}
                >
                  {isResetSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}

        <Separator className="my-4" />

        <div className="flex justify-between text-sm">
          <Link href={ROUTES.LOGIN}>
            <a className="text-primary hover:underline font-medium">
              Back to Sign In
            </a>
          </Link>
          <Link href={ROUTES.FORGOT_USERNAME}>
            <a className="text-primary hover:underline font-medium">
              Forgot Username?
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}