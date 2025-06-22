import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, MapPin, Bed, Bath, Ruler, Heart, Share2, Calendar } from "lucide-react";
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
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Property ID</h1>
          <Button onClick={() => setLocation("/properties")}>
            Back to Properties
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation("/properties")}>
            Back to Properties
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const getBedroomText = (bedrooms: number) => {
    if (bedrooms === 0) return "Studio";
    return `${bedrooms} bedroom${bedrooms > 1 ? 's' : ''}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out this property: ${property?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Property link has been copied to your clipboard.",
      });
    }
  };

  const handleContactAboutProperty = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </div>

          {/* Property Details */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Property Image */}
              <div className="relative">
                <img 
                  src={property.imageUrl} 
                  alt={property.title}
                  className="w-full h-96 object-cover rounded-xl shadow-lg"
                />
                {property.featured && (
                  <Badge className="absolute top-4 left-4 bg-accent text-white px-3 py-1">
                    Featured
                  </Badge>
                )}
                <div className="absolute top-4 right-4 flex space-x-2">
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
                  <p className="text-gray-600 flex items-center text-lg">
                    <MapPin className="w-5 h-5 mr-2" />
                    {property.location}
                  </p>
                </div>

                <div className="flex items-center space-x-6 text-gray-600">
                  <span className="flex items-center">
                    <Bed className="w-5 h-5 mr-2" />
                    {getBedroomText(property.bedrooms)}
                  </span>
                  <span className="flex items-center">
                    <Bath className="w-5 h-5 mr-2" />
                    {property.bathrooms} bathroom{property.bathrooms > 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center">
                    <Ruler className="w-5 h-5 mr-2" />
                    {property.size} sq.m.
                  </span>
                </div>

                <div className="border-t pt-6">
                  <span className="text-4xl font-bold text-primary">{formatPrice(property.price)}</span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    onClick={handleContactAboutProperty}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3"
                  >
                    Contact About This Property
                  </Button>
                  <Button variant="outline" className="px-6">
                    Schedule Viewing
                  </Button>
                </div>
              </div>
            </div>

            {/* Property Details Card */}
            <Card className="mb-12">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="text-gray-600">Type</span>
                    <p className="font-medium capitalize">{property.propertyType}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Size</span>
                    <p className="font-medium">{property.size} sq.m.</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Bedrooms</span>
                    <p className="font-medium">{getBedroomText(property.bedrooms)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Bathrooms</span>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Properties */}
            {relatedProperties.length > 0 && (
              <section className="mb-12">
                <h3 className="text-2xl font-bold text-text-primary mb-6">Similar Properties</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedProperties.map((relatedProperty) => (
                    <Card key={relatedProperty.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <img 
                        src={relatedProperty.imageUrl} 
                        alt={relatedProperty.title}
                        className="w-full h-48 object-cover"
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
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Contact Section */}
            <section id="contact" className="bg-neutral rounded-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-text-primary mb-2">Interested in this property?</h3>
                <p className="text-gray-600">Get in touch with us for more information or to schedule a viewing</p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <ContactForm />
              </div>
            </section>
          </section>
        </>
      ) : null}

      <Footer />
    </div>
  );
}
