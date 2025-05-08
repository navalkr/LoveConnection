import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, CheckCircle } from "lucide-react";

interface FaceVerificationProps {
  verificationToken: string;
  onVerificationComplete: () => void;
}

export default function FaceVerification({ 
  verificationToken, 
  onVerificationComplete 
}: FaceVerificationProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Use a mutation for face verification
  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/verify-face", {
        token: verificationToken,
        // In a real implementation, you might include:
        // imageData: capturedImage
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Verification Successful",
        description: "Your identity has been verified. You can now access your account.",
      });
      
      setIsVerified(true);
      
      // Notify parent component that verification is complete after a short delay
      setTimeout(() => {
        onVerificationComplete();
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: "We couldn't verify your identity. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    return () => {
      // Clean up video stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
      setIsCapturing(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imgData);
      
      // Stop the video stream
      const tracks = (video.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
      setIsCapturing(false);
    }
  };

  const resetCapture = async () => {
    setCapturedImage(null);
    await startCamera();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Face Verification</CardTitle>
        <CardDescription>
          Please verify your identity by taking a photo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVerified ? (
          <div className="flex flex-col items-center justify-center p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-lg font-medium text-center">
              Verification Complete
            </p>
            <p className="text-neutral-600 text-center mt-2">
              You'll be redirected to your account shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="relative rounded-lg overflow-hidden bg-neutral-100 aspect-video flex items-center justify-center">
              {!isCapturing && !capturedImage && (
                <div className="text-center p-6">
                  <Camera className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
                  <p className="text-neutral-600">
                    Click "Start Camera" to begin
                  </p>
                </div>
              )}
              
              {isCapturing && (
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              )}
              
              {capturedImage && (
                <img 
                  src={capturedImage} 
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isVerified && (
          <>
            {!isCapturing && !capturedImage && (
              <Button 
                onClick={startCamera}
                className="w-full"
                variant="default"
              >
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            )}
            
            {isCapturing && !capturedImage && (
              <Button 
                onClick={captureImage}
                className="w-full"
                variant="default"
              >
                Capture Photo
              </Button>
            )}
            
            {capturedImage && (
              <div className="w-full flex gap-2">
                <Button 
                  onClick={resetCapture}
                  className="flex-1"
                  variant="outline"
                >
                  Retake
                </Button>
                
                <Button 
                  onClick={() => verifyMutation.mutate()}
                  className="flex-1"
                  variant="default"
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}