import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { API_ENDPOINTS, ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { Profile as ProfileType } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileForm from "@/components/profile/ProfileForm";
import PhotoUpload from "@/components/profile/PhotoUpload";
import InterestBadge from "@/components/profile/InterestBadge";
import { Camera, MapPin, Edit } from "lucide-react";

export default function ProfilePage() {
  const [_, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("view");
  
  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, setLocation]);
  
  // Fetch profile
  const { 
    data: profile, 
    isLoading,
    isError,
    error
  } = useQuery<ProfileType>({
    queryKey: [API_ENDPOINTS.PROFILE.GET],
    enabled: isAuthenticated,
  });
  
  // Get initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };
  
  // Handle successful profile update
  const handleProfileUpdated = () => {
    setActiveTab("view");
  };
  
  // If loading or unauthorized
  if (authLoading || !user) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="bg-white pb-20 md:pb-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold font-heading mb-6">Your Profile</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="view">View Profile</TabsTrigger>
            <TabsTrigger value="edit">Edit Profile</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view">
            <Card className="rounded-xl card-shadow overflow-hidden">
              {/* Profile Header */}
              <div className="relative h-48 bg-gradient-to-r from-primary to-secondary">
                <div className="absolute -bottom-16 left-8">
                  <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden">
                    {profile?.photos?.length ? (
                      <img 
                        src={profile.photos[0]} 
                        alt={user.firstName} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Avatar className="w-32 h-32">
                        <AvatarFallback className="bg-neutral-200 text-neutral-800 text-4xl">
                          {getInitials(user.firstName)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-4 right-4">
                  <Button 
                    variant="secondary" 
                    className="bg-white/20 backdrop-blur-sm text-white rounded-full p-2"
                    onClick={() => setActiveTab("photos")}
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Profile Info */}
              <CardContent className="pt-20 px-8 pb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold font-heading">
                      {user.firstName} {user.lastName || ""}
                    </h3>
                    {(profile?.city || profile?.state || profile?.country) && (
                      <p className="text-neutral-500 flex items-center">
                        <MapPin className="mr-1" size={16} />
                        {[
                          profile?.city,
                          profile?.state,
                          profile?.country
                        ].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {profile?.profession && (
                      <p className="text-neutral-500 mt-1">
                        {profile.profession}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="link" 
                    className="text-primary font-medium hover:text-primary-dark"
                    onClick={() => setActiveTab("edit")}
                  >
                    Edit Profile
                  </Button>
                </div>
                
                {/* About Me */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold font-heading mb-2">About Me</h4>
                  <p className="text-neutral-700">
                    {profile?.bio || "No bio yet. Add one by editing your profile!"}
                  </p>
                </div>
                
                {/* Interests */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold font-heading">Interests</h4>
                    <Button 
                      variant="link" 
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                      onClick={() => setActiveTab("edit")}
                    >
                      Edit
                    </Button>
                  </div>
                  {profile?.interests && profile.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <InterestBadge key={index} interest={interest} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500">No interests yet. Add some by editing your profile!</p>
                  )}
                </div>
                
                {/* Photos */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold font-heading">My Photos</h4>
                    <Button 
                      variant="link" 
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                      onClick={() => setActiveTab("photos")}
                    >
                      Add Photos
                    </Button>
                  </div>
                  {profile?.photos && profile.photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {profile.photos.map((photo, index) => (
                        <img 
                          key={index}
                          src={photo} 
                          alt={`Photo ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-lg" 
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500">No photos yet. Add some to make your profile stand out!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="edit">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Edit Your Profile</h3>
                {isLoading ? (
                  <div className="py-4">Loading profile...</div>
                ) : isError ? (
                  <div className="py-4 text-destructive">Error loading profile: {error?.message}</div>
                ) : (
                  <ProfileForm profile={profile} onSuccess={handleProfileUpdated} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="photos">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Manage Your Photos</h3>
                {isLoading ? (
                  <div className="py-4">Loading photos...</div>
                ) : isError ? (
                  <div className="py-4 text-destructive">Error loading photos: {error?.message}</div>
                ) : (
                  <PhotoUpload profile={profile} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
