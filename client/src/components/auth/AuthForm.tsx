import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { ROUTES, GENDERS, INTERESTED_IN } from "@/lib/constants";
import { InsertUser, loginSchema } from "@shared/schema";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Heart } from "lucide-react";

// Extend the register schema with client-side validation
const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  firstName: z.string().min(1, {
    message: "First name is required",
  }),
  lastName: z.string().optional(),
  dateOfBirth: z.string().refine((dob) => {
    const date = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    
    return age >= 18;
  }, {
    message: "You must be at least 18 years old to register",
  }),
  gender: z.string({
    required_error: "Please select your gender",
  }),
  interestedIn: z.string({
    required_error: "Please select who you're interested in",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthFormProps {
  type: "login" | "register";
}

export default function AuthForm({ type }: AuthFormProps) {
  const [_, setLocation] = useLocation();
  const { login, register: registerUser } = useAuth();
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      interestedIn: "",
    },
  });
  
  // Handle login submission
  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      setLocation(ROUTES.DISCOVER);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  
  // Handle register submission
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(data as InsertUser);
      setLocation(ROUTES.DISCOVER);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };
  
  return (
    <div className="max-w-md w-full space-y-6 p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <div className="flex justify-center">
          <Heart className="h-8 w-8 text-primary" fill="currentColor" />
        </div>
        <h2 className="mt-2 text-3xl font-bold text-neutral-900">
          {type === "login" ? "Welcome back" : "Create an account"}
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          {type === "login" 
            ? "Sign in to your Heartlink account" 
            : "Join Heartlink and start your dating journey"}
        </p>
      </div>
      
      {type === "login" ? (
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <FormField
              control={loginForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              variant="gradient" 
              className="w-full"
              disabled={loginForm.formState.isSubmitting}
            >
              {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="flex justify-between mt-2 text-sm">
              <Link href={ROUTES.FORGOT_USERNAME}>
                <div className="text-primary hover:underline font-medium cursor-pointer">
                  Forgot Username?
                </div>
              </Link>
              <Link href={ROUTES.FORGOT_PASSWORD}>
                <div className="text-primary hover:underline font-medium cursor-pointer">
                  Forgot Password?
                </div>
              </Link>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...registerForm}>
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
            <FormField
              control={registerForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={registerForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={registerForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={registerForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={registerForm.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    You must be at least 18 years old.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={registerForm.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDERS.map((gender) => (
                          <SelectItem key={gender.value} value={gender.value}>
                            {gender.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="interestedIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Looking for</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INTERESTED_IN.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              variant="gradient" 
              className="w-full"
              disabled={registerForm.formState.isSubmitting}
            >
              {registerForm.formState.isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </Form>
      )}
      
      <Separator className="my-4" />
      
      <div className="text-center text-sm">
        {type === "login" ? (
          <p>
            Don't have an account?{" "}
            <Link href={ROUTES.REGISTER}>
              <div className="text-primary hover:underline font-medium inline">
                Sign up
              </div>
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Link href={ROUTES.LOGIN}>
              <div className="text-primary hover:underline font-medium inline">
                Sign in
              </div>
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
