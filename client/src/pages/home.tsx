import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Check, MapPin, Phone, Mail, Clock, Star, ArrowRight, Building, Users, Award, TrendingUp, Sparkles, Home as HomeIcon, TreePine, ShoppingCart, Key } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SearchFilters from "@/components/search-filters";
import PropertyCard from "@/components/property-card";
import NewsletterForm from "@/components/newsletter-form";
import ContactForm from "@/components/contact-form";
import EntrustmentForm from "@/components/entrustment-form";
import PropertyRequestForm from "@/components/property-request-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import type { Property } from "@shared/schema";
import type { SearchFilters as SearchFiltersType } from "@/lib/types";

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("properties");
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const { data: featuredProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties/featured"],
  });

  const { data: allProperties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Filter properties by category and region
  const getFilteredProperties = (category: string) => {
    let filtered = allProperties;
    
    if (category === "land") {
      filtered = allProperties.filter(p => p.propertyType === "land");
    } else if (category === "buy") {
      filtered = allProperties.filter(p => p.available === true);
    } else if (category === "renting") {
      filtered = allProperties.filter(p => p.available === false);
    }
    
    if (selectedRegion) {
      filtered = filtered.filter(p => p.location.toLowerCase().includes(selectedRegion.toLowerCase()));
    }
    
    return filtered;
  };

  // Athens regions for filter
  const athensRegions = [
    "Alimos", "Glyfada", "Voula", "Vouliagmeni", "Varkiza", "Saronida",
    "Kifisia", "Marousi", "Chalandri", "Psychiko", "Filothei",
    "Kolonaki", "Exarchia", "Plaka", "Monastiraki", "Thiseio",
    "Piraeus", "Faliro", "Kallithea", "Nea Smyrni", "Pagrati"
  ];

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
    <div className="min-h-screen bg-white pt-24">
      <Header />
      
      {/* Hero Section with enhanced effects */}
      <section className="bg-gradient-hero text-white py-16 lg:py-24 relative overflow-hidden">
        {/* Subtle geometric background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 drop-shadow-lg leading-tight tracking-tight">
              Find Premium Properties in{" "}
              <span className="text-yellow-300 font-black">Athens</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto drop-shadow font-medium leading-relaxed">
              Discover exceptional real estate opportunities in Greece's capital with our curated collection of premium properties
            </p>
          </div>
          
          <div className="glass-effect rounded-xl p-6 hover-lift animate-scale-in">
            <SearchFilters onSearch={handleSearch} isHomePage={true} />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center animate-fade-in-up hover-lift">
              <div className="bg-gradient-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-float">
                <Building className="w-8 h-8" />
              </div>
              <h4 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">500+</h4>
              <p className="text-gray-700 font-medium text-lg">Properties Listed</p>
            </div>
            <div className="text-center animate-fade-in-up hover-lift" style={{animationDelay: "0.1s"}}>
              <div className="bg-gradient-secondary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-float" style={{animationDelay: "1s"}}>
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">1200+</h4>
              <p className="text-gray-700 font-medium text-lg">Happy Clients</p>
            </div>
            <div className="text-center animate-fade-in-up hover-lift" style={{animationDelay: "0.2s"}}>
              <div className="bg-gradient-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-float" style={{animationDelay: "2s"}}>
                <Award className="w-8 h-8" />
              </div>
              <h4 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">15+</h4>
              <p className="text-gray-700 font-medium text-lg">Years Experience</p>
            </div>
            <div className="text-center animate-fade-in-up hover-lift" style={{animationDelay: "0.3s"}}>
              <div className="bg-gradient-secondary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-float" style={{animationDelay: "3s"}}>
                <TrendingUp className="w-8 h-8" />
              </div>
              <h4 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">98%</h4>
              <p className="text-gray-700 font-medium text-lg">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Property Categories and Regions */}
      <section id="properties" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
              Explore Properties
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Browse properties by category or explore different regions of Athens
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-white/80 backdrop-blur-sm border border-blue-200/50">
              <TabsTrigger value="properties" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <HomeIcon className="w-4 h-4" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="land" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <TreePine className="w-4 h-4" />
                Land
              </TabsTrigger>
              <TabsTrigger value="buy" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <ShoppingCart className="w-4 h-4" />
                Buy
              </TabsTrigger>
              <TabsTrigger value="renting" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <Key className="w-4 h-4" />
                Renting
              </TabsTrigger>
              <TabsTrigger value="regions" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <MapPin className="w-4 h-4" />
                Regions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">All Properties</h3>
                <p className="text-gray-600">Discover our complete collection of properties</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
                ) : (
                  getFilteredProperties("properties").slice(0, 6).map((property: any) => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="land" className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Land Plots</h3>
                <p className="text-gray-600">Premium land plots for development opportunities</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getFilteredProperties("land").slice(0, 6).map((property: any) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="buy" className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Properties for Sale</h3>
                <p className="text-gray-600">Find your perfect home to purchase</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getFilteredProperties("buy").slice(0, 6).map((property: any) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="renting" className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Properties for Rent</h3>
                <p className="text-gray-600">Explore rental properties in prime locations</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getFilteredProperties("renting").slice(0, 6).map((property: any) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="regions" className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Athens Regions</h3>
                <p className="text-gray-600">Explore properties by location across Athens</p>
              </div>
              
              {/* Region Filter */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Region</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <Button
                    variant={selectedRegion === "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRegion("")}
                    className="justify-start"
                  >
                    All Regions
                  </Button>
                  {athensRegions.map((region) => (
                    <Button
                      key={region}
                      variant={selectedRegion === region ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRegion(region)}
                      className="justify-start"
                    >
                      {region}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Properties in Selected Region */}
              <div className="space-y-4">
                {selectedRegion && (
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      <MapPin className="w-3 h-3 mr-1" />
                      {selectedRegion}
                    </Badge>
                    <span className="text-gray-600">
                      {getFilteredProperties("properties").length} properties found
                    </span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {getFilteredProperties("properties").slice(0, 6).map((property: any) => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>

                {getFilteredProperties("properties").length === 0 && (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">
                      No properties found in {selectedRegion || "this region"}
                    </h4>
                    <p className="text-gray-500">
                      Try selecting a different region or browse all properties
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* View All Properties Button */}
          <div className="text-center mt-12">
            <Button 
              onClick={() => setLocation("/properties")}
              size="lg"
              className="bg-gradient-primary hover:bg-blue-600 text-white px-8 py-3"
            >
              View All Properties
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
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
