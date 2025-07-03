import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Check, MapPin, Phone, Mail, Clock, Star, ArrowRight, Building, Users, Award, TrendingUp, Sparkles, Home as HomeIcon, TreePine, ShoppingCart, Key, X, Search } from "lucide-react";
// Logo will be loaded from public folder
import Header from "@/components/header";
import Footer from "@/components/footer";

import PropertyCard from "@/components/property-card";
import ContactForm from "@/components/contact-form";
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
            {/* Logo and Title */}
            <div className="mb-8 flex flex-col items-center gap-3">
              <img 
                src="/logo.png" 
                alt="شركة رند للاستثمار العقاري و تطويره" 
                className="h-20 lg:h-24 w-auto object-contain"
              />
              <h1 className="text-2xl lg:text-4xl font-bold text-blue-600 tracking-wide leading-tight">
                شركة رند للاستثمار العقاري و تطويره
              </h1>
            </div>
            
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto mb-8"></div>
            

          </div>
          
          {/* Land Search Filters Card */}
          <div className="max-w-5xl mx-auto">
            <LandSearchFilters onSearch={handleSearch} isHomePage={true} />
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
                <h4 className="text-xl font-bold text-gray-900 mb-6">استكشاف حسب منطقة عمان</h4>
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
                        {getFilteredProperties("all").length} قطعة أرض متاحة
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
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">اختر منطقة</h4>
                    <p className="text-gray-500">اختر منطقة من عمان أعلاه لتصفح الأراضي في ذلك الموقع</p>
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


        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-text-primary mb-4">خدماتنا</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              خدمات عقارية شاملة لتلبية جميع احتياجاتك من الأراضي
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </section>



      <Footer />
    </div>
  );
}
