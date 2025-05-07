import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User, Profile } from "@shared/schema";
import { API_ENDPOINTS, ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import ProfileCard from "@/components/profile/ProfileCard";
import { Filter, Search } from "lucide-react";

export default function Discover() {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  
  // Fetch discovery profiles
  const { 
    data: profiles, 
    isLoading,
    isError,
    error,
    refetch 
  } = useQuery<(User & { profile?: Profile })[]>({
    queryKey: [API_ENDPOINTS.DISCOVER.GET],
    enabled: isAuthenticated,
  });
  
  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, setLocation]);
  
  // Handle like action
  const handleLike = () => {
    if (profiles && profiles.length > 0) {
      setCurrentProfileIndex(prevIndex => {
        // Check if we're at the last profile
        if (prevIndex >= profiles.length - 1) {
          // If so, stay at the last index but refresh to get more profiles
          refetch();
          return prevIndex;
        }
        // Otherwise, move to next profile
        return prevIndex + 1;
      });
    }
  };
  
  // Handle skip action
  const handleSkip = () => {
    if (profiles && profiles.length > 0) {
      setCurrentProfileIndex(prevIndex => {
        // Check if we're at the last profile
        if (prevIndex >= profiles.length - 1) {
          // If so, stay at the last index but refresh to get more profiles
          refetch();
          return prevIndex;
        }
        // Otherwise, move to next profile
        return prevIndex + 1;
      });
    }
  };
  
  // If loading or unauthorized
  if (authLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Return the discover section
  return (
    <div className="pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-heading">Discover</h2>
          <div className="flex items-center space-x-4">
            <button className="text-neutral-500 hover:text-primary">
              <Filter className="text-xl" />
            </button>
            <button className="text-neutral-500 hover:text-primary">
              <Search className="text-xl" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[500px]">
            <div className="text-lg text-neutral-500">Loading potential matches...</div>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-[500px] flex-col">
            <div className="text-lg text-neutral-500 mb-4">Error loading profiles</div>
            <div className="text-sm text-neutral-400">{error?.message}</div>
          </div>
        ) : profiles && profiles.length > 0 ? (
          <ProfileCard 
            user={profiles[currentProfileIndex]} 
            onLike={handleLike} 
            onSkip={handleSkip} 
          />
        ) : (
          <div className="flex justify-center items-center h-[500px] flex-col">
            <div className="text-lg text-neutral-500 mb-4">No more profiles to show</div>
            <div className="text-sm text-neutral-400">Check back later for new matches!</div>
          </div>
        )}
      </div>
    </div>
  );
}
