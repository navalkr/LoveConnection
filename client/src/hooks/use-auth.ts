import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { User, InsertUser, Login } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (data: InsertUser) => Promise<void>;
  login: (data: Login) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthState {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user query
  const { 
    data: user,
    isLoading,
    error
  } = useQuery<User | null>({
    queryKey: [API_ENDPOINTS.AUTH.ME],
    // We're using the default queryFn defined in queryClient.ts
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false,
    // On 401, return null instead of throwing an error
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
      }
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", API_ENDPOINTS.AUTH.REGISTER, userData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([API_ENDPOINTS.AUTH.ME], data);
      toast({
        title: "Account created!",
        description: "Welcome to Heartlink!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: Login) => {
      const res = await apiRequest("POST", API_ENDPOINTS.AUTH.LOGIN, credentials);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([API_ENDPOINTS.AUTH.ME], data);
      toast({
        title: "Logged in!",
        description: `Welcome back, ${data.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", API_ENDPOINTS.AUTH.LOGOUT);
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData([API_ENDPOINTS.AUTH.ME], null);
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.AUTH.ME] });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const register = async (data: InsertUser) => {
    await registerMutation.mutateAsync(data);
  };

  const login = async (data: Login) => {
    await loginMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
  };
}
