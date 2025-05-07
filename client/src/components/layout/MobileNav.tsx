import { Link, useLocation } from "wouter";
import { ROUTES } from "@/lib/constants";
import { Compass, Heart, MessageCircle, User } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();
  
  return (
    <nav className="md:hidden bg-white shadow-lg fixed bottom-0 left-0 right-0 z-50">
      <div className="flex justify-around">
        <Link href={ROUTES.DISCOVER}>
          <a className={`flex flex-col items-center py-3 px-5 ${
            location === ROUTES.DISCOVER 
              ? 'text-primary' 
              : 'text-neutral-500'
          }`}>
            <Compass className="text-xl" size={20} />
            <span className="text-xs mt-1">Discover</span>
          </a>
        </Link>
        
        <Link href={ROUTES.MATCHES}>
          <a className={`flex flex-col items-center py-3 px-5 ${
            location === ROUTES.MATCHES 
              ? 'text-primary' 
              : 'text-neutral-500'
          }`}>
            <Heart className="text-xl" size={20} />
            <span className="text-xs mt-1">Matches</span>
          </a>
        </Link>
        
        <Link href={ROUTES.MESSAGES}>
          <a className={`flex flex-col items-center py-3 px-5 relative ${
            location === ROUTES.MESSAGES || location.startsWith('/conversation') 
              ? 'text-primary' 
              : 'text-neutral-500'
          }`}>
            <MessageCircle className="text-xl" size={20} />
            <span className="text-xs mt-1">Messages</span>
            {/* Notification indicator would be conditionally rendered based on unread messages */}
          </a>
        </Link>
        
        <Link href={ROUTES.PROFILE}>
          <a className={`flex flex-col items-center py-3 px-5 ${
            location === ROUTES.PROFILE 
              ? 'text-primary' 
              : 'text-neutral-500'
          }`}>
            <User className="text-xl" size={20} />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
