import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Image, Smile, Send } from "lucide-react";

interface MessageInputProps {
  matchId: number;
}

export default function MessageInput({ matchId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest(
        "POST", 
        API_ENDPOINTS.MATCHES.MESSAGES(matchId), 
        { content }
      );
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ 
        queryKey: [API_ENDPOINTS.MATCHES.MESSAGES(matchId)] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [API_ENDPOINTS.MATCHES.GET] 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="bg-white p-4 border-t border-neutral-200">
      <div className="flex items-center">
        <button className="text-neutral-500 hover:text-primary mr-3">
          <Image size={20} />
        </button>
        
        <div className="flex-1 bg-neutral-100 rounded-full px-4 py-2 flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="bg-transparent border-0 flex-1 focus:outline-none text-neutral-800"
            disabled={sendMessageMutation.isPending}
          />
          <button className="text-neutral-500 hover:text-primary ml-2">
            <Smile size={20} />
          </button>
        </div>
        
        <Button
          onClick={handleSendMessage}
          variant="gradient"
          rounded="full"
          size="icon"
          className="ml-3"
          disabled={!message.trim() || sendMessageMutation.isPending}
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
