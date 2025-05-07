import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Profile, InsertProfile } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, INTERESTS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import InterestBadge from "@/components/profile/InterestBadge";

interface ProfileFormProps {
  profile: Profile | null;
  onSuccess?: () => void;
}

// Create a schema for the form based on the profile schema
const profileFormSchema = z.object({
  bio: z.string().max(500, {
    message: "Bio must be 500 characters or less",
  }),
  location: z.string().min(1, {
    message: "Please enter your location",
  }),
  interests: z.array(z.string()).min(1, {
    message: "Please select at least one interest",
  }).max(10, {
    message: "You can select up to 10 interests",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm({ profile, onSuccess }: ProfileFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize form with existing profile data or defaults
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: profile?.bio || "",
      location: profile?.location || "",
      interests: profile?.interests || [],
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<InsertProfile>) => {
      const res = await apiRequest("PUT", API_ENDPOINTS.PROFILE.UPDATE, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROFILE.GET] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    const currentInterests = form.getValues().interests;
    const interestExists = currentInterests.includes(interest);
    
    if (interestExists) {
      form.setValue(
        "interests", 
        currentInterests.filter(i => i !== interest),
        { shouldValidate: true }
      );
    } else if (currentInterests.length < 10) {
      form.setValue(
        "interests", 
        [...currentInterests, interest],
        { shouldValidate: true }
      );
    } else {
      toast({
        title: "Maximum interests reached",
        description: "You can select up to 10 interests",
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Me</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell potential matches about yourself..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Write a short bio that describes who you are and what you're looking for.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. San Francisco, CA"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter your city and state/country.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interests</FormLabel>
              <FormDescription>
                Select up to 10 interests that describe your hobbies and passions.
              </FormDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {INTERESTS.map((interest) => (
                  <InterestBadge
                    key={interest}
                    interest={interest}
                    selected={field.value.includes(interest)}
                    selectable
                    onClick={() => toggleInterest(interest)}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          variant="gradient"
          disabled={updateProfileMutation.isPending}
          className="w-full md:w-auto"
        >
          {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </Form>
  );
}
