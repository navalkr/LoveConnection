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
  FormDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define schema for the email form
const emailRecoverySchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

// Define schema for the phone form
const phoneRecoverySchema = z.object({
  phoneNumber: z.string().min(10, {
    message: "Please enter a valid phone number",
  }),
});

type EmailRecoveryValues = z.infer<typeof emailRecoverySchema>;
type PhoneRecoveryValues = z.infer<typeof phoneRecoverySchema>;

export default function ForgotUsernamePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Email form
  const emailForm = useForm<EmailRecoveryValues>({
    resolver: zodResolver(emailRecoverySchema),
    defaultValues: {
      email: "",
    },
  });

  // Phone form
  const phoneForm = useForm<PhoneRecoveryValues>({
    resolver: zodResolver(phoneRecoverySchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  // Handle email recovery request
  const onEmailSubmit = async (data: EmailRecoveryValues) => {
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

  // Handle phone recovery request
  const onPhoneSubmit = async (data: PhoneRecoveryValues) => {
    try {
      setIsSubmitting(true);
      const response = await apiRequest("POST", "/api/auth/forgot-username", data);
      const result = await response.json();
      
      toast({
        title: "Request Processed",
        description: "If the phone number is registered, your username will be sent via SMS.",
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
            Recover using your email or phone number
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

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={emailForm.control}
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
                      <FormDescription>
                        Enter the email address you used when registering
                      </FormDescription>
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
                    "Recover with Email"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="phone">
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="+1234567890" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the phone number you used when registering
                      </FormDescription>
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
                    "Recover with Phone"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex justify-between text-sm">
          <Link href={ROUTES.LOGIN}>
            <div className="text-primary hover:underline font-medium cursor-pointer">
              Back to Sign In
            </div>
          </Link>
          <Link href={ROUTES.FORGOT_PASSWORD}>
            <div className="text-primary hover:underline font-medium cursor-pointer">
              Forgot Password?
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}