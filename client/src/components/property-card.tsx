import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Square, Eye } from "lucide-react";
import type { PropertyCardProps } from "@/lib/types";

export default function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const getPropertyTypeArabic = (type: string) => {
    switch(type) {
      case 'land': return 'أرض سكنية';
      case 'farm': return 'أرض زراعية';
      case 'commercial': return 'أرض تجارية';
      case 'industrial': return 'أرض صناعية';
      default: return 'أرض';
    }
  };

  const formatPriceArabic = (price: string) => {
    const numPrice = parseFloat(price);
    const formattedPrice = new Intl.NumberFormat('ar-JO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
    return formattedPrice;
  };

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-white rounded-2xl group" dir="rtl">
      <div className="relative overflow-hidden">
        <img
          src={property.images?.[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
          alt={property.title}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {property.featured && (
          <Badge className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold shadow-lg">
            مميزة
          </Badge>
        )}
        
        <button
          onClick={() => onViewDetails(property.id)}
          className="absolute inset-0 w-full h-full bg-transparent hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Eye className="w-6 h-6 text-gray-800" />
          </div>
        </button>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
              {property.title}
            </h3>
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="w-4 h-4 ml-2 text-blue-500" />
              <span className="text-sm">{property.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
              <div className="flex items-center">
                <Square className="w-4 h-4 ml-1 text-gray-400" />
                <span>{property.size} م²</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-blue-600">{formatPriceArabic(property.price)}</span>
              <span className="text-gray-500 text-sm mr-1">د.أ</span>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {getPropertyTypeArabic(property.propertyType)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}