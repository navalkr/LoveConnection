import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Profile, InsertProfile } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, INTERESTS, PROFESSIONS, COUNTRIES } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  // Location fields
  country: z.string().min(1, {
    message: "Please select your country",
  }),
  state: z.string().optional(),
  city: z.string().min(1, {
    message: "Please enter your city",
  }),
  vicinity: z.string().optional(),
  coordinates: z.string().optional(),
  // Profession field (required)
  profession: z.string().min(1, {
    message: "Please select your profession",
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
      country: profile?.country || "",
      state: profile?.state || "",
      city: profile?.city || "",
      vicinity: profile?.vicinity || "",
      coordinates: profile?.coordinates || "",
      profession: profile?.profession || "",
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
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Location</h3>
          
          <div className="flex gap-4">
            <div className="flex items-start">
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="mr-2"
                onClick={() => {
                  // Implement location detection
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        // Store coordinates
                        const coords = `${position.coords.latitude},${position.coords.longitude}`;
                        form.setValue("coordinates", coords, { shouldValidate: true });
                        
                        // You would normally use these coordinates to fetch location details
                        // from a geocoding API, but for now we'll just store them
                        toast({
                          title: "Location detected",
                          description: "We've saved your coordinates. Please complete your location details.",
                        });
                      },
                      (error) => {
                        toast({
                          title: "Error detecting location",
                          description: "Please enter your location manually.",
                          variant: "destructive",
                        });
                      }
                    );
                  } else {
                    toast({
                      title: "Geolocation not supported",
                      description: "Your browser doesn't support geolocation. Please enter your location manually.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <MapPin className="h-4 w-4" />
              </Button>
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Country</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your state/province" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profession</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your profession" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROFESSIONS.map((profession) => (
                    <SelectItem key={profession.value} value={profession.value}>
                      {profession.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Let others know what you do for a living.
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
