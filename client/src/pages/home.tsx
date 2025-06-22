import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Check, MapPin, Phone, Mail, Clock, Star, ArrowRight, Building, Users, Award, TrendingUp, Sparkles } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SearchFilters from "@/components/search-filters";
import PropertyCard from "@/components/property-card";
import NewsletterForm from "@/components/newsletter-form";
import ContactForm from "@/components/contact-form";
import EntrustmentForm from "@/components/entrustment-form";
import PropertyRequestForm from "@/components/property-request-form";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import type { Property } from "@shared/schema";
import type { SearchFilters as SearchFiltersType } from "@/lib/types";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: featuredProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties/featured"],
  });

  const searchMutation = useMutation({
    mutationFn: async (filters: SearchFiltersType) => {
      const response = await apiRequest("POST", "/api/properties/search", filters);
      return response.json() as Promise<Property[]>;
    },
    onSuccess: () => {
      setLocation("/properties");
    },
  });

  const handleSearch = (filters: SearchFiltersType) => {
    sessionStorage.setItem("searchFilters", JSON.stringify(filters));
    searchMutation.mutate(filters);
  };

  const handleViewDetails = (id: number) => {
    setLocation(`/property/${id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section with enhanced effects */}
      <section className="bg-gradient-hero text-white py-16 lg:py-24 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 animate-float">
            <Building className="w-16 h-16 text-white" />
          </div>
          <div className="absolute top-40 right-20 animate-float" style={{animationDelay: "1s"}}>
            <Star className="w-12 h-12 text-white" />
          </div>
          <div className="absolute bottom-20 left-1/4 animate-float" style={{animationDelay: "2s"}}>
            <MapPin className="w-14 h-14 text-white" />
          </div>
          <div className="absolute top-1/2 right-1/4 animate-float" style={{animationDelay: "3s"}}>
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
              Search properties to buy and invest in{" "}
              <span className="text-yellow-300 animate-pulse-glow">Athens</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto drop-shadow">
              Discover your perfect property in the heart of Greece with our comprehensive real estate platform
            </p>
          </div>
          
          <div className="glass-effect rounded-xl p-6 hover-lift animate-scale-in">
            <SearchFilters onSearch={handleSearch} isHomePage={true} />
          </div>
        </div>
        
        {/* Decorative wave */}
        <svg 
          className="absolute bottom-0 left-0 w-full h-16" 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
            fill="white" 
          />
        </svg>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center animate-fade-in-up hover-lift">
              <div className="bg-gradient-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-float">
                <Building className="w-8 h-8" />
              </div>
              <h4 className="text-3xl font-bold text-gray-900 mb-2">500+</h4>
              <p className="text-gray-600">Properties Listed</p>
            </div>
            <div className="text-center animate-fade-in-up hover-lift" style={{animationDelay: "0.1s"}}>
              <div className="bg-gradient-secondary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-float" style={{animationDelay: "1s"}}>
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-3xl font-bold text-gray-900 mb-2">1200+</h4>
              <p className="text-gray-600">Happy Clients</p>
            </div>
            <div className="text-center animate-fade-in-up hover-lift" style={{animationDelay: "0.2s"}}>
              <div className="bg-gradient-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-float" style={{animationDelay: "2s"}}>
                <Award className="w-8 h-8" />
              </div>
              <h4 className="text-3xl font-bold text-gray-900 mb-2">15+</h4>
              <p className="text-gray-600">Years Experience</p>
            </div>
            <div className="text-center animate-fade-in-up hover-lift" style={{animationDelay: "0.3s"}}>
              <div className="bg-gradient-secondary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-float" style={{animationDelay: "3s"}}>
                <TrendingUp className="w-8 h-8" />
              </div>
              <h4 className="text-3xl font-bold text-gray-900 mb-2">98%</h4>
              <p className="text-gray-600">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section id="properties" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Properties
              <Sparkles className="inline-block w-8 h-8 ml-2 text-yellow-500 animate-pulse-glow" />
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover exceptional properties in prime Athens locations
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <Skeleton className="w-full h-64" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-text-primary mb-4">Our Services</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive real estate services to meet all your property needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <NewsletterForm />
            <EntrustmentForm />
            <PropertyRequestForm />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-neutral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-text-primary mb-6">About Pin-point Real Estate</h3>
              <p className="text-gray-600 text-lg mb-6">
                Located in the heart of Alimos, South Athens, we specialize in connecting buyers and investors 
                with exceptional properties throughout the Athens metropolitan area.
              </p>
              <p className="text-gray-600 mb-6">
                With years of local market expertise and a commitment to personalized service, we guide our 
                clients through every step of their real estate journey.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-primary mr-3" />
                  <span className="text-gray-700">Local market expertise</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-primary mr-3" />
                  <span className="text-gray-700">Personalized service</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-primary mr-3" />
                  <span className="text-gray-700">Comprehensive property portfolio</span>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Modern office building in Athens" 
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-text-primary mb-4">Contact Us</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ready to find your dream property? Get in touch with our expert team
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Office Location</h4>
                  <p className="text-gray-600">Alimos, Athens - South<br />Greece</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Phone</h4>
                  <p className="text-gray-600">+30 210 XXX XXXX</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Email</h4>
                  <p className="text-gray-600">info@pin-point.gr</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Business Hours</h4>
                  <p className="text-gray-600">Mon - Fri: 9:00 AM - 6:00 PM<br />Sat: 9:00 AM - 3:00 PM</p>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
