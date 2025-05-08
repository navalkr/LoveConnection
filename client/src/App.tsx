import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTES } from "@/lib/constants";

// Layout components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Discover from "@/pages/discover";
import Matches from "@/pages/matches";
import Messages from "@/pages/messages";
import Conversation from "@/pages/conversation";
import ProfilePage from "@/pages/profile";
import ForgotPassword from "@/pages/forgot-password";
import ForgotUsername from "@/pages/forgot-username";
import FaceVerificationPage from "@/pages/face-verification";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  
  // Check if we're on a page that doesn't need the header/footer
  const isAuthPage = location === ROUTES.LOGIN || 
                    location === ROUTES.REGISTER || 
                    location === ROUTES.FORGOT_PASSWORD || 
                    location === ROUTES.FORGOT_USERNAME ||
                    location === ROUTES.FACE_VERIFICATION;
  const isFullPage = location.startsWith('/discover') || 
                     location.startsWith('/messages') || 
                     location === ROUTES.HOME;
  
  // Check if we're on a page that needs the mobile nav
  const needsMobileNav = location !== ROUTES.HOME &&
                        location !== ROUTES.LOGIN && 
                        location !== ROUTES.REGISTER &&
                        location !== ROUTES.FORGOT_PASSWORD &&
                        location !== ROUTES.FORGOT_USERNAME &&
                        location !== ROUTES.FACE_VERIFICATION;
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Header />}
      
      <main className="flex-grow">
        <Switch>
          <Route path={ROUTES.HOME} component={Home} />
          <Route path={ROUTES.LOGIN} component={Login} />
          <Route path={ROUTES.REGISTER} component={Register} />
          <Route path={ROUTES.DISCOVER} component={Discover} />
          <Route path={ROUTES.MATCHES} component={Matches} />
          <Route path={ROUTES.MESSAGES} component={Messages} />
          <Route path={ROUTES.CONVERSATION} component={Conversation} />
          <Route path={ROUTES.PROFILE} component={ProfilePage} />
          <Route path={ROUTES.FORGOT_PASSWORD} component={ForgotPassword} />
          <Route path={ROUTES.FORGOT_USERNAME} component={ForgotUsername} />
          <Route path={ROUTES.FACE_VERIFICATION} component={FaceVerificationPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {needsMobileNav && <MobileNav />}
      {!isAuthPage && !isFullPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
