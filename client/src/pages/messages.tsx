import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { API_ENDPOINTS, ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface MatchWithDetails {
  id: number;
  user1Id: number;
  user2Id: number;
  matchedAt: string;
  otherUser: {
    id: number;
    username: string;
    firstName: string;
    lastName: string | null;
  } | null;
  otherProfile: {
    id: number;
    userId: number;
    photos: string[] | null;
  } | null;
  lastMessage: {
    id: number;
    content: string;
    sentAt: string;
  } | null;
  unreadCount: number;
}

export default function Messages() {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Fetch matches with messages
  const { 
    data: matches, 
    isLoading,
    isError,
    error
  } = useQuery<MatchWithDetails[]>({
    queryKey: [API_ENDPOINTS.MATCHES.GET],
    enabled: isAuthenticated,
  });
  
  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, setLocation]);
  
  // Get initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };
  
  // Filter for conversations (has messages)
  const conversations = matches?.filter(match => match.lastMessage) || [];
  
  // If loading or unauthorized
  if (authLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="bg-white pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold font-heading mb-6">Messages</h2>
        
        {isLoading ? (
          <div className="py-4 text-neutral-500">Loading conversations...</div>
        ) : isError ? (
          <div className="py-4 text-neutral-500">Error loading conversations: {error?.message}</div>
        ) : conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((match) => (
              <Link key={match.id} href={`/conversation/${match.id}`}>
                <a className="flex items-center p-3 rounded-lg hover:bg-neutral-50 transition">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden">
                      {match.otherProfile?.photos?.length ? (
                        <img 
                          src={match.otherProfile.photos[0]} 
                          alt={match.otherUser?.firstName || "Match"} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="bg-neutral-200 text-neutral-800">
                            {getInitials(match.otherUser?.firstName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    {match.unreadCount > 0 && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-success ring-2 ring-white"></span>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-baseline justify-between">
                      <h4 className="text-base font-medium text-neutral-900">
                        {match.otherUser?.firstName || "Unknown"}
                      </h4>
                      {match.lastMessage && (
                        <span className="text-xs text-neutral-500">
                          {formatDistanceToNow(new Date(match.lastMessage.sentAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    {match.lastMessage && (
                      <p className={`text-sm ${match.unreadCount > 0 ? 'text-neutral-800 font-medium' : 'text-neutral-500'} truncate`}>
                        {match.lastMessage.content}
                      </p>
                    )}
                  </div>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-4 text-neutral-500">
            <p>No messages yet.</p>
            <p className="mt-2">Match with someone to start chatting!</p>
          </div>
        )}
      </div>
    </div>
  );
}
