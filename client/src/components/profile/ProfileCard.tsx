import { useState } from "react";
import { User, Profile, InsertLike } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import InterestBadge from "@/components/profile/InterestBadge";
import { MapPin, Info, X, Star } from "lucide-react";
import { Heart } from "lucide-react";

interface ProfileCardProps {
  user: User & { profile?: Profile };
  onLike: () => void;
  onSkip: () => void;
}

export default function ProfileCard({ user, onLike, onSkip }: ProfileCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (likedId: number) => {
      const likeData: InsertLike = {
        likedId
      };
      const res = await apiRequest("POST", API_ENDPOINTS.LIKES.CREATE, likeData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.DISCOVER.GET] });
      
      if (data.isMatch) {
        toast({
          title: "It's a match! 🎉",
          description: `You and ${user.firstName} have matched! You can now start chatting.`,
        });
      } else {
        toast({
          title: "Liked!",
          description: `You liked ${user.firstName}. We'll notify you if you match!`,
        });
      }
      
      onLike();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setLoading(false);
    }
  });
  
  const handleLike = async () => {
    setLoading(true);
    await likeMutation.mutateAsync(user.id);
  };
  
  const handleSkip = () => {
    onSkip();
  };
  
  // If no profile photo is available, show a fallback
  const profilePhoto = user.profile?.photos && user.profile.photos.length > 0 
    ? user.profile.photos[0] 
    : "https://via.placeholder.com/500x700?text=No+Photo";
  
  return (
    <Card className="max-w-lg mx-auto bg-white rounded-xl card-shadow overflow-hidden">
      <div className="relative">
        <img
          src={profilePhoto}
          alt={`${user.firstName}, ${calculateAge(user.dateOfBirth)}`}
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-white text-2xl font-bold font-heading">
                {user.firstName}, {calculateAge(user.dateOfBirth)}
              </h3>
              {user.profile?.location && (
                <p className="text-white/90 flex items-center">
                  <MapPin className="mr-1" size={16} />
                  {user.profile.location}
                </p>
              )}
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full h-10 w-10 flex items-center justify-center">
              <Info className="text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="px-6 py-4">
        {user.profile?.interests && user.profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {user.profile.interests.map((interest, index) => (
              <InterestBadge key={index} interest={interest} />
            ))}
          </div>
        )}
        
        <p className="text-neutral-600">
          {user.profile?.bio || "No bio available"}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 bg-white border-t border-neutral-100 profile-actions">
        <div className="flex justify-between items-center w-full">
          <button 
            className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-400 hover:text-neutral-600"
            onClick={handleSkip}
            disabled={loading}
          >
            <X size={24} />
          </button>
          
          <button 
            className="w-16 h-16 rounded-full gradient-bg shadow-lg flex items-center justify-center text-white"
            onClick={handleLike}
            disabled={loading}
          >
            <Heart size={28} fill="currentColor" />
          </button>
          
          <button 
            className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-400 hover:text-info"
          >
            <Star size={24} />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
