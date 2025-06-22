import { Heart, Bed, Bath, Ruler, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PropertyCardProps } from "@/lib/types";
import { useState } from "react";

export default function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
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
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden hover-lift transition-all duration-300 animate-fade-in-up group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={property.imageUrl} 
          alt={property.title}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Featured badge */}
        {property.featured && (
          <Badge className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            <Star className="w-4 h-4 mr-1" />
            Featured
          </Badge>
        )}
        
        {/* Heart button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200"
        >
          <Heart className={`w-5 h-5 transition-colors duration-200 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600 hover:text-red-500'}`} />
        </button>
        
        {/* View details overlay on hover */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={() => onViewDetails(property.id)}
            className="bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-3 rounded-full font-semibold flex items-center space-x-2 hover:bg-white transition-all duration-200 animate-scale-in"
          >
            <Eye className="w-5 h-5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xl font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
            {property.title}
          </h4>
          <span className="text-2xl font-bold text-blue-600 ml-2">
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
          <span className="flex items-center bg-gray-100 rounded-full px-3 py-1">
            <Bed className="w-4 h-4 mr-1 text-blue-500" />
            {getBedroomText(property.bedrooms)}
          </span>
          <span className="flex items-center bg-gray-100 rounded-full px-3 py-1">
            <Bath className="w-4 h-4 mr-1 text-blue-500" />
            {property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}
          </span>
          <span className="flex items-center bg-gray-100 rounded-full px-3 py-1">
            <Ruler className="w-4 h-4 mr-1 text-blue-500" />
            {property.size} sq.m.
          </span>
        </div>
        
        <Button 
          onClick={() => onViewDetails(property.id)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
