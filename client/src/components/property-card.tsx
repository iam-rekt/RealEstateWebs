import { Heart, Bed, Bath, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PropertyCardProps } from "@/lib/types";

export default function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
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
    return `${bedrooms} bed${bedrooms > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 property-card">
      <div className="relative">
        <img 
          src={property.imageUrl} 
          alt={property.title}
          className="w-full h-64 object-cover"
        />
        {property.featured && (
          <Badge className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </Badge>
        )}
        <button className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all duration-200">
          <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xl font-semibold text-text-primary line-clamp-1">
            {property.title}
          </h4>
          <span className="text-2xl font-bold text-primary ml-2">
            {formatPrice(property.price)}
          </span>
        </div>
        
        <p className="text-gray-600 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {property.location}
        </p>
        
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            <Bed className="w-4 h-4 mr-1" />
            {getBedroomText(property.bedrooms)}
          </span>
          <span className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            {property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}
          </span>
          <span className="flex items-center">
            <Ruler className="w-4 h-4 mr-1" />
            {property.size} sq.m.
          </span>
        </div>
        
        <Button 
          onClick={() => onViewDetails(property.id)}
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors duration-200"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
