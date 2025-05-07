import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

interface PhotoUploadProps {
  profile: Profile | null;
}

export default function PhotoUpload({ profile }: PhotoUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    profile?.photos || []
  );
  
  // In a real implementation, this would upload files to a storage service
  // For this demo, we'll just use base64 encoding
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Check if the user already has max photos
    if (previewUrls.length + files.length > 6) {
      toast({
        title: "Too many photos",
        description: "You can upload a maximum of 6 photos",
        variant: "destructive",
      });
      return;
    }
    
    // Read selected files and convert to base64
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrls(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input
    e.target.value = "";
  };
  
  // Remove a photo
  const removePhoto = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  // Save photos to profile
  const updatePhotosMutation = useMutation({
    mutationFn: async (photos: string[]) => {
      const res = await apiRequest("PUT", API_ENDPOINTS.PROFILE.UPDATE, { photos });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROFILE.GET] });
      toast({
        title: "Photos updated",
        description: "Your photos have been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const savePhotos = () => {
    updatePhotosMutation.mutate(previewUrls);
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative">
            <img 
              src={url} 
              alt={`User photo ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-neutral-500 hover:text-destructive"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {previewUrls.length < 6 && (
          <label className="w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
            <div className="flex flex-col items-center gap-2 text-neutral-500">
              <Camera size={24} />
              <span className="text-sm">Add Photo</span>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
              multiple
            />
          </label>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="button"
          onClick={savePhotos}
          variant="gradient"
          disabled={updatePhotosMutation.isPending}
        >
          {updatePhotosMutation.isPending ? "Saving..." : "Save Photos"}
        </Button>
      </div>
    </div>
  );
}
