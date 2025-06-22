import { Link } from "wouter";
import { Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const handleScrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-text-primary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h5 className="text-2xl font-bold mb-4">Pin-point Real Estate</h5>
            <p className="text-gray-300 mb-4">
              Your trusted partner for real estate in Athens. We specialize in connecting buyers and investors with exceptional properties throughout the Athens metropolitan area.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h6 className="font-semibold mb-4">Quick Links</h6>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/properties">
                  <a className="hover:text-white transition-colors duration-200">Properties</a>
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollToSection("#services")}
                  className="hover:text-white transition-colors duration-200 text-left"
                >
                  Services
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollToSection("#about")}
                  className="hover:text-white transition-colors duration-200 text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollToSection("#contact")}
                  className="hover:text-white transition-colors duration-200 text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h6 className="font-semibold mb-4">Contact Info</h6>
            <ul className="space-y-2 text-gray-300">
              <li>Alimos, Athens - South</li>
              <li>Greece</li>
              <li>+30 210 XXX XXXX</li>
              <li>info@pin-point.gr</li>
            </ul>
          </div>
        </div>
        
        <hr className="border-gray-600 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">&copy; 2024 Pin-point Real Estate. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors duration-200">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
