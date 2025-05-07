import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, User } from "@shared/schema";
import { format } from "date-fns";
import { CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  currentUser: User;
  otherUser: User;
}

export default function MessageBubble({ message, currentUser, otherUser }: MessageBubbleProps) {
  const isSent = message.senderId === currentUser.id;
  const sender = isSent ? currentUser : otherUser;
  
  // Format the message time
  const formatMessageTime = (date: Date) => {
    return format(date, "h:mm a");
  };
  
  // Get initials for the avatar fallback
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  
  if (isSent) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-xs">
          <div className="bg-primary p-3 rounded-lg message-bubble-sent">
            <p className="text-white">{message.content}</p>
          </div>
          <div className="flex justify-end items-center mt-1">
            <span className="text-xs text-neutral-500 mr-1">
              {formatMessageTime(new Date(message.sentAt))}
            </span>
            <CheckCheck size={12} className="text-info" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex mb-4">
      <div className="flex-shrink-0 mr-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src="" alt={otherUser.firstName} />
          <AvatarFallback className="bg-neutral-300 text-neutral-800 text-xs">
            {getInitials(otherUser.firstName)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div>
        <div className="bg-white p-3 rounded-lg message-bubble-received max-w-xs">
          <p className="text-neutral-800">{message.content}</p>
        </div>
        <span className="text-xs text-neutral-500 ml-2">
          {formatMessageTime(new Date(message.sentAt))}
        </span>
      </div>
    </div>
  );
}
