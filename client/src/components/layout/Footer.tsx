import { Link } from "wouter";
import { ROUTES } from "@/lib/constants";
import { Heart, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold font-heading mb-4 flex items-center">
              <Heart className="mr-2 text-primary" fill="currentColor" />
              Heartlink
            </h3>
            <p className="text-neutral-400 mb-4">
              Connecting hearts in the digital age.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-400 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Press</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-400 hover:text-white">Dating Tips</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Success Stories</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Dating Safety</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Cookie Policy</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Community Guidelines</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-neutral-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Heartlink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
