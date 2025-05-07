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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define schema for the form
const forgotUsernameSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

type ForgotUsernameValues = z.infer<typeof forgotUsernameSchema>;

export default function ForgotUsernamePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Email form
  const form = useForm<ForgotUsernameValues>({
    resolver: zodResolver(forgotUsernameSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle username recovery request
  const onSubmit = async (data: ForgotUsernameValues) => {
    try {
      setIsSubmitting(true);
      const response = await apiRequest("POST", "/api/auth/forgot-username", data);
      const result = await response.json();
      
      toast({
        title: "Request Processed",
        description: "If the email is registered, your username will be sent to you.",
      });
      
      // For demo purposes, display the username
      if (result.username) {
        setUsername(result.username);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            Recover Your Username
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Enter your email to receive your username
          </p>
        </div>

        {username && (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Username Found!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your username is: <span className="font-bold">{username}</span>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Recover Username"
              )}
            </Button>
          </form>
        </Form>

        <Separator className="my-4" />

        <div className="flex justify-between text-sm">
          <Link href={ROUTES.LOGIN}>
            <a className="text-primary hover:underline font-medium">
              Back to Sign In
            </a>
          </Link>
          <Link href={ROUTES.FORGOT_PASSWORD}>
            <a className="text-primary hover:underline font-medium">
              Forgot Password?
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}