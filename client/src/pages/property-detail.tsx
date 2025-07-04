import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, MapPin, Bed, Bath, Ruler, Heart, Share2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ContactForm from "@/components/contact-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Property } from "@shared/schema";

export default function PropertyDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const propertyId = parseInt(params.id || "0");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !isNaN(propertyId) && propertyId > 0,
  });

  const { data: allProperties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Get related properties (same type, different from current)
  const relatedProperties = allProperties
    .filter(p => p.id !== propertyId && p.propertyType === property?.propertyType)
    .slice(0, 3);

  if (isNaN(propertyId) || propertyId <= 0) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">رقم العقار غير صحيح</h1>
          <Button onClick={() => setLocation("/properties")}>
            العودة إلى العقارات
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">العقار غير موجود</h1>
          <p className="text-gray-600 mb-6">العقار الذي تبحث عنه غير موجود أو تم حذفه.</p>
          <Button onClick={() => setLocation("/properties")}>
            العودة إلى العقارات
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('ar-JO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice) + ' د.أ';
  };



  const getPropertyTypeArabic = (type: string) => {
    switch (type.toLowerCase()) {
      case 'residential': case 'سكنية': return 'سكنية';
      case 'commercial': case 'تجارية': return 'تجارية';
      case 'industrial': case 'صناعية': return 'صناعية';
      case 'agricultural': case 'زراعية': return 'زراعية';
      case 'services': case 'خدماتية': return 'خدماتية';
      case 'mixed': case 'مختلطة': return 'مختلطة';
      case 'land': case 'أرض': return 'أرض';
      default: return type;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `شاهد هذا العقار: ${property?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "تم نسخ الرابط!",
        description: "تم نسخ رابط العقار إلى الحافظة.",
      });
    }
  };

  const handleContactAboutProperty = () => {
    // Scroll to footer contact information
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      
      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      ) : property ? (
        <>
          {/* Navigation */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Button
              variant="outline"
              onClick={() => setLocation("/properties")}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة إلى العقارات
            </Button>
          </div>

          {/* Property Details */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Property Image Gallery */}
              <div className="relative">
                <div className="relative mb-4">
                  <img 
                    src={property.images?.[currentImageIndex] || property.images?.[0] || "/uploads/land-property-1.svg"} 
                    alt={property.title}
                    className="w-full h-96 object-cover rounded-xl shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== "/uploads/land-property-1.svg") {
                        target.src = "/uploads/land-property-1.svg";
                      }
                    }}
                  />
                  {property.featured && (
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold px-3 py-1">
                      مميزة
                    </Badge>
                  )}
                  
                  {/* Image Navigation Arrows */}
                  {property.images && property.images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === 0 ? property.images!.length - 1 : prev - 1
                        )}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === property.images!.length - 1 ? 0 : prev + 1
                        )}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Image Thumbnails */}
                {property.images && property.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {property.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === index 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${property.title} - صورة ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== "/uploads/land-property-1.svg") {
                              target.src = "/uploads/land-property-1.svg";
                            }
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="absolute top-4 left-4 flex space-x-2 space-x-reverse">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white bg-opacity-90 hover:bg-opacity-100"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white bg-opacity-90 hover:bg-opacity-100"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Property Information */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-text-primary mb-2">{property.title}</h1>
                  <div className="text-gray-600 space-y-2">
                    <p className="flex items-center text-lg">
                      <MapPin className="w-5 h-5 ml-2 flex-shrink-0" />
                      {property.location}
                    </p>
                    
                    {/* Jordan Location Information */}
                    {((property as any).governorateName || (property as any).directorateName) && (
                      <div className="flex flex-wrap gap-2 pr-7">
                        {(property as any).governorateName && (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            محافظة: {(property as any).governorateName}
                          </span>
                        )}
                        {(property as any).directorateName && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            مديرية: {(property as any).directorateName}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Additional Location Details */}
                    {(property.village || property.basin || property.neighborhood || property.plotNumber) && (
                      <div className="grid grid-cols-2 gap-2 pr-7 text-sm">
                        {property.village && (
                          <div className="flex items-center">
                            <span className="text-gray-500 font-medium">القرية:</span>
                            <span className="mr-2">{property.village}</span>
                          </div>
                        )}
                        {property.basin && (
                          <div className="flex items-center">
                            <span className="text-gray-500 font-medium">الحوض:</span>
                            <span className="mr-2">{property.basin}</span>
                          </div>
                        )}
                        {property.neighborhood && (
                          <div className="flex items-center">
                            <span className="text-gray-500 font-medium">الحي:</span>
                            <span className="mr-2">{property.neighborhood}</span>
                          </div>
                        )}
                        {property.plotNumber && (
                          <div className="flex items-center">
                            <span className="text-gray-500 font-medium">رقم القطعة:</span>
                            <span className="mr-2">{property.plotNumber}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-6 space-x-reverse text-gray-600">
                  <span className="flex items-center">
                    <Ruler className="w-5 h-5 ml-2" />
                    {property.size} م²
                  </span>
                  {property.governorateId && (
                    <span className="flex items-center">
                      <MapPin className="w-5 h-5 ml-2" />
                      محافظة
                    </span>
                  )}
                  {property.village && (
                    <span className="flex items-center">
                      قرية: {property.village}
                    </span>
                  )}
                </div>

                <div className="border-t pt-6">
                  <span className="text-4xl font-bold text-primary">{formatPrice(property.price)}</span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">الوصف</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>

                <div className="flex space-x-4 space-x-reverse">
                  <Button 
                    onClick={handleContactAboutProperty}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3"
                  >
                    تواصل معنا
                  </Button>
                </div>
              </div>
            </div>

            {/* Property Details Card */}
            <Card className="mb-12">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">تفاصيل العقار</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="text-gray-600">النوع</span>
                    <p className="font-medium">{getPropertyTypeArabic(property.propertyType)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">المساحة</span>
                    <p className="font-medium">{property.size} م²</p>
                  </div>
                  {property.village && (
                    <div>
                      <span className="text-gray-600">القرية</span>
                      <p className="font-medium">{property.village}</p>
                    </div>
                  )}
                  {property.basin && (
                    <div>
                      <span className="text-gray-600">الحوض</span>
                      <p className="font-medium">{property.basin}</p>
                    </div>
                  )}
                  {property.neighborhood && (
                    <div>
                      <span className="text-gray-600">الحي</span>
                      <p className="font-medium">{property.neighborhood}</p>
                    </div>
                  )}
                  {property.plotNumber && (
                    <div>
                      <span className="text-gray-600">رقم القطعة</span>
                      <p className="font-medium">{property.plotNumber}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Related Properties */}
            {relatedProperties.length > 0 && (
              <section className="mb-12">
                <h3 className="text-2xl font-bold text-text-primary mb-6">عقارات مشابهة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedProperties.map((relatedProperty) => (
                    <Card key={relatedProperty.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <img 
                        src={relatedProperty.images?.[0] || "/uploads/land-property-1.svg"} 
                        alt={relatedProperty.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== "/uploads/land-property-1.svg") {
                            target.src = "/uploads/land-property-1.svg";
                          }
                        }}
                      />
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2 line-clamp-1">{relatedProperty.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{relatedProperty.location}</p>
                        <p className="text-primary font-bold">{formatPrice(relatedProperty.price)}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-3"
                          onClick={() => setLocation(`/property/${relatedProperty.id}`)}
                        >
                          عرض التفاصيل
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}


          </section>
        </>
      ) : null}

      <Footer />
    </div>
  );
}
