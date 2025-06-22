export interface SearchFilters {
  minPrice?: string;
  maxPrice?: string;
  minSize?: string;
  maxSize?: string;
  propertyType?: string;
  bedrooms?: string;
  bathrooms?: string;
  location?: string;
}

export interface PropertyCardProps {
  property: {
    id: number;
    title: string;
    price: string;
    size: number;
    bedrooms: number;
    bathrooms: number;
    propertyType: string;
    location: string;
    imageUrl: string;
    featured?: boolean;
  };
  onViewDetails: (id: number) => void;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface NewsletterFormData {
  email: string;
}

export interface EntrustmentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyType: string;
  location: string;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  description: string;
  serviceType: string;
}

export interface PropertyRequestFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  propertyType?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  minSize?: number;
  maxSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  message: string;
}
