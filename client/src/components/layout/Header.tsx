import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Heart } from "lucide-react";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    setLocation(ROUTES.HOME);
  };
  
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };
  
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href={ROUTES.HOME} className="text-2xl font-bold text-primary flex items-center">
                <Heart className="mr-2" fill="currentColor" />
                Heartlink
            </Link>
          </div>
          
          {isAuthenticated ? (
            <nav className="hidden md:flex space-x-8">
              <Link href={ROUTES.DISCOVER} className={`px-3 py-2 text-sm font-medium ${location === ROUTES.DISCOVER ? 'text-primary' : 'text-neutral-900 hover:text-primary'}`}>
                Discover
              </Link>
              <Link href={ROUTES.MATCHES} className={`px-3 py-2 text-sm font-medium ${location === ROUTES.MATCHES ? 'text-primary' : 'text-neutral-900 hover:text-primary'}`}>
                Matches
              </Link>
              <Link href={ROUTES.MESSAGES} className={`px-3 py-2 text-sm font-medium ${location === ROUTES.MESSAGES ? 'text-primary' : 'text-neutral-900 hover:text-primary'}`}>
                Messages
              </Link>
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center text-neutral-900 hover:text-primary px-3 py-2 text-sm font-medium">
                      Profile
                      <div className="relative ml-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="" alt={user?.firstName} />
                          <AvatarFallback className="bg-neutral-300 text-neutral-800">
                            {getInitials(user?.firstName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-success"></span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.PROFILE} className="cursor-pointer w-full">
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </nav>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link href={ROUTES.LOGIN} className="text-primary hover:text-primary-dark font-medium">
                Log in
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button variant="gradient" rounded="full">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
