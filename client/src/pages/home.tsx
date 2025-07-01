import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Check, MapPin, Phone, Mail, Clock, Star, ArrowRight, Building, Users, Award, TrendingUp, Sparkles, Home as HomeIcon, TreePine, ShoppingCart, Key, X, Search } from "lucide-react";
// Logo will be loaded from public folder
import Header from "@/components/header";
import Footer from "@/components/footer";

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
import LandSearchFilters from "@/components/land-search-filters";

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("");

  const { data: featuredProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties/featured"],
  });

  const { data: allProperties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch site settings for dynamic contact information
  const { data: settingsData } = useQuery({
    queryKey: ["/api/site-settings"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Extract settings data
  const settings = settingsData ? (settingsData as Record<string, string>) : {} as Record<string, string>;
  const contactAddress = settings.contact_office_address || "Amman, Jordan";
  const contactPhone = settings.contact_phone_primary || "+962 6 XXX XXXX";
  const contactMobile = settings.contact_phone_mobile || "+962 79 XXX XXXX";
  const contactEmail = settings.contact_email_main || "info@haddadinrealestate.com";
  const contactSalesEmail = settings.contact_email_sales || "sales@haddadinrealestate.com";
  const workingHours = settings.contact_working_hours || "Mon - Fri: 9:00 AM - 6:00 PM<br />Sat: 9:00 AM - 3:00 PM";

  // Enhanced filter function with multiple criteria
  const getFilteredProperties = (category: string) => {
    let filtered = allProperties;
    
    // Category filtering
    if (category === "land") {
      filtered = filtered.filter(p => p.propertyType === "land");
    } else if (category === "buy") {
      filtered = filtered.filter(p => p.available === true);
    } else if (category === "renting") {
      filtered = filtered.filter(p => p.available === false);
    } else if (category === "featured") {
      filtered = featuredProperties;
    }
    
    // Region filtering
    if (selectedRegion) {
      filtered = filtered.filter(p => p.location.toLowerCase().includes(selectedRegion.toLowerCase()));
    }
    
    // Property type filtering
    if (propertyType && propertyType !== "all") {
      filtered = filtered.filter(p => p.propertyType === propertyType);
    }
    
    // Bedrooms filtering
    if (bedrooms && bedrooms !== "all") {
      const bedroomCount = parseInt(bedrooms);
      filtered = filtered.filter(p => p.bedrooms >= bedroomCount);
    }
    
    // Price range filtering
    if (priceRange && priceRange !== "all") {
      if (priceRange === "0-300000") {
        filtered = filtered.filter(p => {
          const price = parseInt(p.price.replace(/[€,]/g, ''));
          return price <= 300000;
        });
      } else if (priceRange === "300000-500000") {
        filtered = filtered.filter(p => {
          const price = parseInt(p.price.replace(/[€,]/g, ''));
          return price > 300000 && price <= 500000;
        });
      } else if (priceRange === "500000+") {
        filtered = filtered.filter(p => {
          const price = parseInt(p.price.replace(/[€,]/g, ''));
          return price > 500000;
        });
      }
    }
    
    return filtered;
  };

  // مناطق عمان للفلترة
  const ammanAreas = [
    "عبدون", "صويفية", "دابوق", "دير غبار", "أم أذينة", "خلدا",
    "تلاع العلي", "الشميساني", "جبل عمان", "جبل الويبدة", "اللويبدة",
    "الرابية", "مرج الحمام", "شارع المطار", "المدينة الرياضية", "الكرسي",
    "طبربور", "شارع مكة", "الجاردنز", "شارع الجامعة", "الجبيهة"
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
      
      {/* Hero Section - Clean Modern Design */}
      <section className="bg-white text-slate-800 py-20 lg:py-32 relative overflow-hidden">
        {/* Geometric Background Elements */}
        <div className="absolute inset-0">
          {/* Large subtle circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full -translate-y-48 translate-x-48 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-50 rounded-full translate-y-40 -translate-x-40 opacity-40"></div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="w-full h-full" style={{
              backgroundImage: `linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-200 rotate-45 opacity-30 animate-float"></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-sky-300 rounded-full opacity-40 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-6 h-6 border-2 border-blue-300 rotate-12 opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-in-up" dir="rtl">
            {/* Logo */}
            <div className="mb-12">
              <img 
                src="/logo.png" 
                alt="شركة راند للتطوير العقاري" 
                className="h-32 w-auto object-contain mx-auto"
              />
            </div>
            
            {/* Clean Typography */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-6 tracking-wide leading-tight">
                <span className="text-blue-600">شركة راند</span>
                <br />
                <span className="text-gray-700">للتطوير العقاري</span>
              </h1>
              <h2 className="text-3xl lg:text-5xl font-light tracking-tight leading-tight">
                <span className="text-gray-700 font-light">عقارات</span>
                <br />
                <span className="text-blue-500 font-medium">مميزة</span>
              </h2>
            </div>
            
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto mb-8"></div>
            
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
              اكتشف العقارات الاستثنائية في <span className="text-blue-500 font-medium">عمان</span> مع إرشاد الخبراء وخدمة شخصية مميزة
            </p>
          </div>
          
          {/* Clean Search Card */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 lg:p-12 hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-slate-800 mb-2">ابحث عن عقارك</h3>
                <p className="text-slate-600 font-light">ابدأ بحثك بنظام الفلترة المتقدم لدينا</p>
              </div>
              
              <div className="flex justify-center">
                <button 
                  onClick={() => {
                    const propertiesSection = document.getElementById('properties');
                    if (propertiesSection) {
                      propertiesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  استكشف العقارات
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>





      {/* Property Categories and Regions */}
      <section id="properties" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8" dir="rtl">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              استكشف العقارات
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              تصفح العقارات حسب الفئة أو استكشف مناطق مختلفة في عمان
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-white rounded-xl p-3 shadow-sm border border-sky-200 min-h-[60px]" dir="rtl">
              <TabsTrigger value="all" className="flex items-center justify-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-400 data-[state=active]:to-sky-500 data-[state=active]:text-white rounded-lg transition-all duration-300 font-medium text-xs py-2 px-2">
                <Star className="w-3 h-3" />
                جميع الأراضي
              </TabsTrigger>
              <TabsTrigger value="featured" className="flex items-center justify-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-400 data-[state=active]:to-sky-500 data-[state=active]:text-white rounded-lg transition-all duration-300 font-medium text-xs py-2 px-2">
                <Sparkles className="w-3 h-3" />
                أراضي مميزة
              </TabsTrigger>
              <TabsTrigger value="land" className="flex items-center justify-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-400 data-[state=active]:to-sky-500 data-[state=active]:text-white rounded-lg transition-all duration-300 font-medium text-xs py-2 px-2">
                <TreePine className="w-3 h-3" />
                أراضي سكنية
              </TabsTrigger>
              <TabsTrigger value="farm" className="flex items-center justify-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-400 data-[state=active]:to-sky-500 data-[state=active]:text-white rounded-lg transition-all duration-300 font-medium text-xs py-2 px-2">
                <TreePine className="w-3 h-3" />
                أراضي زراعية
              </TabsTrigger>
            </TabsList>

            {/* Modern Filter Bar */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-sky-100" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">نوع العقار</label>
                  <select 
                    value={propertyType} 
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all duration-200 bg-white text-gray-700 text-sm text-right"
                  >
                    <option value="">جميع أنواع الأراضي</option>
                    <option value="land">أرض سكنية</option>
                    <option value="farm">أرض زراعية</option>
                    <option value="commercial">أرض تجارية</option>
                    <option value="industrial">أرض صناعية</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">نطاق السعر</label>
                  <select 
                    value={priceRange} 
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all duration-200 bg-white text-gray-700 text-sm text-right"
                  >
                    <option value="">جميع الأسعار</option>
                    <option value="0-100000">حتى 100,000 د.أ</option>
                    <option value="100000-300000">100,000 - 300,000 د.أ</option>
                    <option value="300000+">300,000+ د.أ</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">المساحة (متر مربع)</label>
                  <select 
                    value={bedrooms} 
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all duration-200 bg-white text-gray-700 text-sm text-right"
                  >
                    <option value="">أي مساحة</option>
                    <option value="300">300+ متر مربع</option>
                    <option value="500">500+ متر مربع</option>
                    <option value="1000">1000+ متر مربع</option>
                    <option value="2000">2000+ متر مربع</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">الموقع</label>
                  <select 
                    value={selectedRegion} 
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all duration-200 bg-white text-gray-700 text-sm text-right"
                  >
                    <option value="">جميع المناطق</option>
                    {ammanAreas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Filter Results Summary */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-sky-50 text-sky-700 border-sky-200 text-sm">
                    {getFilteredProperties(activeTab).length} عقار متوفر
                  </Badge>
                  {(propertyType || priceRange || bedrooms || selectedRegion) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setPropertyType("");
                        setPriceRange("");
                        setBedrooms("");
                        setSelectedRegion("");
                      }}
                      className="bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 text-sm px-3 py-1.5 rounded-md transition-all duration-200"
                    >
                      مسح الفلاتر
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                      <Skeleton className="h-64 w-full" />
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
                  ))
                ) : (
                  getFilteredProperties("all").slice(0, 9).map((property: any) => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="featured" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getFilteredProperties("featured").slice(0, 9).map((property: any) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="buy" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getFilteredProperties("buy").slice(0, 9).map((property: any) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
              {getFilteredProperties("buy").length === 0 && (
                <div className="text-center py-16">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-600 mb-2">No properties for sale found</h4>
                  <p className="text-gray-500">Try adjusting your filters or browse all properties</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="renting" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getFilteredProperties("renting").slice(0, 9).map((property: any) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
              {getFilteredProperties("renting").length === 0 && (
                <div className="text-center py-16">
                  <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-600 mb-2">No rental properties found</h4>
                  <p className="text-gray-500">Try adjusting your filters or browse all properties</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="regions" className="space-y-6">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-lg border border-blue-100/50">
                <h4 className="text-xl font-bold text-gray-900 mb-6">Explore by Amman Area</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {ammanAreas.map((area) => (
                    <Button
                      key={area}
                      variant={selectedRegion === area ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRegion(area)}
                      className="justify-start hover:bg-blue-50 transition-all duration-200"
                    >
                      {area}
                    </Button>
                  ))}
                </div>
                
                {selectedRegion && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        {selectedRegion}
                      </Badge>
                      <span className="text-gray-600 font-medium">
                        {getFilteredProperties("all").length} properties available
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {selectedRegion ? (
                  getFilteredProperties("all").slice(0, 9).map((property: any) => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      onViewDetails={handleViewDetails}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <MapPin className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">Select an Area</h4>
                    <p className="text-gray-500">Choose an Amman area above to browse properties in that location</p>
                  </div>
                )}
              </div>

              {selectedRegion && getFilteredProperties("all").length === 0 && (
                <div className="text-center py-16">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-600 mb-2">
                    No properties found in {selectedRegion}
                  </h4>
                  <p className="text-gray-500">
                    Try selecting a different region or adjusting your filters
                  </p>
                </div>
              )}
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
              <h3 className="text-3xl font-bold text-text-primary mb-6">About Tariq Haddadin Real Estate</h3>
              <p className="text-gray-600 text-lg mb-6">
                Located in the heart of Amman, Jordan, we specialize in connecting buyers and investors 
                with exceptional properties throughout the Amman metropolitan area.
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
                  <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: contactAddress }} />
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Phone</h4>
                  <p className="text-gray-600">{contactPhone}</p>
                  <p className="text-gray-600 text-sm mt-1">Mobile: {contactMobile}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Email</h4>
                  <p className="text-gray-600">{contactEmail}</p>
                  <p className="text-gray-600 text-sm mt-1">Sales: {contactSalesEmail}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Business Hours</h4>
                  <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: workingHours }} />
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Statistics Section - Enhanced with dynamic effects */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <Footer />
    </div>
  );
}
