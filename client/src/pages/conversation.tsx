import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { API_ENDPOINTS, ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MessageBubble from "@/components/message/MessageBubble";
import MessageInput from "@/components/message/MessageInput";
import { Message, User } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft, MoreHorizontal } from "lucide-react";

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
}

export default function Conversation() {
  const { matchId } = useParams();
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, setLocation]);
  
  // Get match details
  const { 
    data: matchDetails,
    isLoading: matchLoading,
    isError: matchError,
    error: matchErrorDetails
  } = useQuery<MatchWithDetails[]>({
    queryKey: [API_ENDPOINTS.MATCHES.GET],
    enabled: isAuthenticated,
    select: (data) => data.filter(match => match.id === parseInt(matchId)),
  });
  
  // Get messages
  const { 
    data: messages,
    isLoading: messagesLoading,
    isError: messagesError,
    error: messagesErrorDetails
  } = useQuery<Message[]>({
    queryKey: [API_ENDPOINTS.MATCHES.MESSAGES(parseInt(matchId))],
    enabled: isAuthenticated && !!matchId,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages?.length && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Mark messages as read when viewed
  useEffect(() => {
    if (messages?.length && user) {
      // Every time we load messages, they are automatically marked as read on the server
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.MATCHES.GET] });
    }
  }, [messages, user, queryClient]);
  
  // Get initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };
  
  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = format(new Date(message.sentAt), 'MMM dd, yyyy');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };
  
  // Handle back button
  const handleBack = () => {
    setLocation(ROUTES.MESSAGES);
  };
  
  // If loading or unauthorized
  if (authLoading || !user) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Get the current match and other user info
  const currentMatch = matchDetails?.[0];
  const otherUser = currentMatch?.otherUser;
  
  // Create a user object for the other user to pass to MessageBubble
  const otherUserObject: User = {
    id: otherUser?.id ?? 0,
    username: otherUser?.username ?? "",
    firstName: otherUser?.firstName ?? "Unknown",
    lastName: otherUser?.lastName ?? "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    interestedIn: "",
    createdAt: new Date()
  };
  
  const groupedMessages = messages ? groupMessagesByDate(messages) : {};
  
  return (
    <div className="h-screen flex flex-col">
      {/* Chat Header */}
      <div className="bg-white p-4 border-b border-neutral-200 flex items-center">
        <button className="mr-4 text-neutral-500 md:hidden" onClick={handleBack}>
          <ArrowLeft />
        </button>
        
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {currentMatch?.otherProfile?.photos?.length ? (
              <img 
                src={currentMatch.otherProfile.photos[0]} 
                alt={otherUser?.firstName || "Match"} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-neutral-200 text-neutral-800">
                  {getInitials(otherUser?.firstName)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-success ring-1 ring-white"></span>
        </div>
        
        <div className="ml-3">
          <h3 className="text-base font-medium text-neutral-900">{otherUser?.firstName || "Unknown"}</h3>
          <p className="text-xs text-neutral-500">Online</p>
        </div>
        
        <div className="ml-auto">
          <button className="text-neutral-500 hover:text-primary">
            <MoreHorizontal />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-neutral-50">
        {matchLoading || messagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-neutral-500">Loading conversation...</div>
          </div>
        ) : matchError || messagesError ? (
          <div className="flex justify-center items-center h-full flex-col">
            <div className="text-neutral-500 mb-2">Error loading conversation</div>
            <div className="text-sm text-neutral-400">
              {matchError ? matchErrorDetails?.message : messagesErrorDetails?.message}
            </div>
          </div>
        ) : messages?.length ? (
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date Indicator */}
                <div className="flex justify-center mb-4">
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                    {date}
                  </span>
                </div>
                
                {/* Messages for this date */}
                {msgs.map(message => (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    currentUser={user} 
                    otherUser={otherUserObject} 
                  />
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex justify-center items-center h-full flex-col">
            <div className="text-neutral-500 mb-2">No messages yet</div>
            <div className="text-sm text-neutral-400">
              Send a message to start the conversation!
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <MessageInput matchId={parseInt(matchId)} />
    </div>
  );
}
