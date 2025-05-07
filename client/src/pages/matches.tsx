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

export default function Matches() {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Fetch matches
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
  
  // Filter for new matches (no messages yet)
  const newMatches = matches?.filter(match => !match.lastMessage) || [];
  
  // Filter for conversations (has messages)
  const conversations = matches?.filter(match => match.lastMessage) || [];
  
  // If loading or unauthorized
  if (authLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="bg-white pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold font-heading mb-6">Your Matches</h2>
        
        {/* New Matches */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-neutral-700 mb-4">New Matches</h3>
          {isLoading ? (
            <div className="py-4 text-neutral-500">Loading matches...</div>
          ) : isError ? (
            <div className="py-4 text-neutral-500">Error loading matches: {error?.message}</div>
          ) : newMatches.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {newMatches.map((match) => (
                <Link key={match.id} href={`/conversation/${match.id}`}>
                  <a className="flex-shrink-0 w-24 text-center">
                    <div className="relative mx-auto">
                      <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-primary p-1 bg-white">
                        {match.otherProfile?.photos?.length ? (
                          <img 
                            src={match.otherProfile.photos[0]} 
                            alt={match.otherUser?.firstName || "Match"} 
                            className="w-full h-full object-cover rounded-full" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-200 rounded-full">
                            <span className="text-neutral-800 font-semibold text-xl">
                              {getInitials(match.otherUser?.firstName)}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-success ring-2 ring-white"></span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{match.otherUser?.firstName || "Unknown"}</p>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-4 text-neutral-500">No new matches yet. Keep swiping!</div>
          )}
        </div>
        
        {/* Conversations */}
        <div>
          <h3 className="text-lg font-medium text-neutral-700 mb-4">Messages</h3>
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
                        <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                          {match.unreadCount}
                        </span>
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
                        <p className="text-sm text-neutral-500 truncate">
                          {match.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-4 text-neutral-500">No conversations yet. Start chatting with your matches!</div>
          )}
        </div>
      </div>
    </div>
  );
}
