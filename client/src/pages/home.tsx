import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ROUTES, STATS } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { Heart, UserPlus, Search, MessageCircle } from "lucide-react";

export default function Home() {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Redirect authenticated users to discover page
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation(ROUTES.DISCOVER);
    }
  }, [isAuthenticated, isLoading, setLocation]);
  
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                  <div>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-heading">
                      <span className="block text-neutral-900">Find your</span>
                      <span className="block text-primary">perfect match</span>
                    </h1>
                    <p className="mt-3 text-base text-neutral-600 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                      Join thousands of singles looking for meaningful connections. Our smart matching helps you find compatible partners based on your interests and preferences.
                    </p>
                    <div className="mt-8 sm:mt-12">
                      <div className="rounded-md shadow">
                        <Link href={ROUTES.REGISTER}>
                          <Button variant="gradient" size="xl" rounded="full" className="w-full animate-pulse-slow">
                            Get Started Free
                          </Button>
                        </Link>
                      </div>
                      <div className="mt-3 sm:mt-4 text-sm">
                        <Link href={ROUTES.LOGIN}>
                          <a className="font-medium text-primary hover:text-primary-dark">
                            Already have an account? Sign in <span aria-hidden="true">→</span>
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img 
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" 
            src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=800" 
            alt="Happy couple in cafe"
          />
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-primary text-3xl font-bold">{STATS.ACTIVE_USERS}</p>
              <p className="text-neutral-600">Active Users</p>
            </div>
            <div>
              <p className="text-primary text-3xl font-bold">{STATS.MATCHES_DAILY}</p>
              <p className="text-neutral-600">Matches Daily</p>
            </div>
            <div>
              <p className="text-primary text-3xl font-bold">{STATS.SUCCESS_RATE}</p>
              <p className="text-neutral-600">Success Rate</p>
            </div>
            <div>
              <p className="text-primary text-3xl font-bold">{STATS.SUCCESS_STORIES}</p>
              <p className="text-neutral-600">Success Stories</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading">How Heartlink Works</h2>
            <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
              Finding your perfect match has never been easier
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white text-2xl mb-4">
                <UserPlus size={28} />
              </div>
              <h3 className="text-xl font-semibold font-heading mb-2">Create Your Profile</h3>
              <p className="text-neutral-600">Answer a few questions about yourself and what you're looking for</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white text-2xl mb-4">
                <Search size={28} />
              </div>
              <h3 className="text-xl font-semibold font-heading mb-2">Browse Matches</h3>
              <p className="text-neutral-600">Our algorithm suggests compatible profiles based on your preferences</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white text-2xl mb-4">
                <MessageCircle size={28} />
              </div>
              <h3 className="text-xl font-semibold font-heading mb-2">Connect & Chat</h3>
              <p className="text-neutral-600">Start conversations with your matches and build meaningful connections</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading">Success Stories</h2>
            <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
              See how Heartlink has brought people together
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl card-shadow overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=300" 
                alt="Mark and Sarah hiking" 
                className="w-full h-48 object-cover" 
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold font-heading mb-2">Mark & Sarah</h3>
                <div className="flex items-center mb-4">
                  <Heart className="text-primary mr-1" size={16} fill="currentColor" />
                  <span className="text-neutral-500 text-sm">Matched 2 years ago</span>
                </div>
                <p className="text-neutral-700">
                  "We both swiped right because of our shared love for hiking. Our first date was a trail walk, and we've been inseparable ever since. Thank you Heartlink!"
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl card-shadow overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1543269664-56d93c1b41a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=300" 
                alt="David and Lisa in cafe" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold font-heading mb-2">David & Lisa</h3>
                <div className="flex items-center mb-4">
                  <Heart className="text-primary mr-1" size={16} fill="currentColor" />
                  <span className="text-neutral-500 text-sm">Matched 1 year ago</span>
                </div>
                <p className="text-neutral-700">
                  "We were both looking for someone who shared our passion for travel. Our matching algorithm was spot on! We've already visited 5 countries together."
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl card-shadow overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=300" 
                alt="Alex and Jamie at concert" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold font-heading mb-2">Alex & Jamie</h3>
                <div className="flex items-center mb-4">
                  <Heart className="text-primary mr-1" size={16} fill="currentColor" />
                  <span className="text-neutral-500 text-sm">Matched 8 months ago</span>
                </div>
                <p className="text-neutral-700">
                  "We connected over our love of indie music. Our first date was a concert, and now we're planning to move in together. Heartlink made it all possible!"
                </p>
              </div>
            </div>
          </div>
          <div className="text-center mt-10">
            <a href="#" className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
              Read more success stories
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
              <h2 className="text-3xl font-bold font-heading mb-4">Take Heartlink With You</h2>
              <p className="text-lg text-neutral-600 mb-6">
                Download our app and never miss a match. Connect with your potential partner anytime, anywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#" className="inline-flex items-center rounded-lg border border-neutral-300 bg-neutral-50 px-5 py-3 hover:bg-neutral-100">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-neutral-900" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16zm0 1a1 1 0 011 1v2h2a1 1 0 010 2h-2v2a1 1 0 01-2 0v-2H9a1 1 0 010-2h2V6a1 1 0 011-1z"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-neutral-600">Download on the</p>
                    <p className="text-base font-medium text-neutral-900">App Store</p>
                  </div>
                </a>
                <a href="#" className="inline-flex items-center rounded-lg border border-neutral-300 bg-neutral-50 px-5 py-3 hover:bg-neutral-100">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-neutral-900" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16zm-2 4v6l5-3-5-3z"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-neutral-600">Get it on</p>
                    <p className="text-base font-medium text-neutral-900">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative max-w-sm mx-auto lg:mx-0 lg:ml-auto">
                <img 
                  src="https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000" 
                  alt="Heartlink mobile app" 
                  className="rounded-xl shadow-xl max-w-full h-auto"
                />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 gradient-bg rounded-full flex items-center justify-center text-white text-xl font-bold animate-pulse-slow">
                  <div className="text-center">
                    <div className="text-2xl">50K+</div>
                    <div className="text-xs">Downloads</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
