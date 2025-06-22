import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import type { SearchFilters } from "@/lib/types";

const searchSchema = z.object({
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minSize: z.string().optional(),
  maxSize: z.string().optional(),
  propertyType: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
});

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  isHomePage?: boolean;
}

export default function SearchFiltersComponent({ onSearch, isHomePage = false }: SearchFiltersProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  
  const form = useForm<SearchFilters>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      minPrice: "",
      maxPrice: "",
      minSize: "",
      maxSize: "",
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
    },
  });

  const onSubmit = (data: SearchFilters) => {
    // Remove empty strings
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value && value.trim() !== "") {
        acc[key as keyof SearchFilters] = value;
      }
      return acc;
    }, {} as SearchFilters);
    
    onSearch(cleanedData);
  };

  const containerClass = isHomePage 
    ? "modern-search-card rounded-2xl p-8 lg:p-10 max-w-6xl mx-auto"
    : "modern-search-card p-6 rounded-xl";

  return (
    <Card className={containerClass}>
      <CardContent className={isHomePage ? "p-0" : "p-0"}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Search Header */}
            {isHomePage && (
              <div className="text-center mb-10">
                <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Find Your Perfect Property</h3>
                <p className="text-gray-600 font-medium text-lg">Discover premium properties in Athens with our intelligent search</p>
              </div>
            )}
            
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                  Price Range (€)
                </FormLabel>
                <div className="flex space-x-3 items-center">
                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="From €100,000" 
                            {...field}
                            className="modern-input"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="flex items-center text-gray-600 font-medium px-2">to</span>
                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="To €1,000,000" 
                            {...field}
                            className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium placeholder:text-gray-400 placeholder:font-normal bg-white/70 backdrop-blur-sm"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                  Property Size (sq.m.)
                </FormLabel>
                <div className="flex space-x-3 items-center">
                  <FormField
                    control={form.control}
                    name="minSize"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="From 50 sq.m." 
                            {...field}
                            className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium placeholder:text-gray-400 placeholder:font-normal bg-white/70 backdrop-blur-sm"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="flex items-center text-gray-600 font-medium px-2">to</span>
                  <FormField
                    control={form.control}
                    name="maxSize"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="To 500 sq.m." 
                            {...field}
                            className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium placeholder:text-gray-400 placeholder:font-normal bg-white/70 backdrop-blur-sm"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            {/* More Filters Toggle */}
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 px-6 py-3 rounded-xl hover:bg-blue-50/50 border border-blue-200/50"
              >
                {showMoreFilters ? (
                  <>
                    <Minus className="w-5 h-5 mr-2" />
                    Show Less Options
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Advanced Search Options
                  </>
                )}
              </Button>
            </div>
            
            {/* Additional Filters */}
            {showMoreFilters && (
              <div className="space-y-6 pt-6 border-t border-gray-200/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                          Property Type
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white/70 backdrop-blur-sm">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-2 shadow-xl">
                            <SelectItem value="">Any type</SelectItem>
                            <SelectItem value="apartment">🏢 Apartment</SelectItem>
                            <SelectItem value="house">🏠 House</SelectItem>
                            <SelectItem value="villa">🏡 Villa</SelectItem>
                            <SelectItem value="studio">🏠 Studio</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                          Bedrooms
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white/70 backdrop-blur-sm">
                              <SelectValue placeholder="Number of bedrooms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-2 shadow-xl">
                            <SelectItem value="">Any</SelectItem>
                            <SelectItem value="1">1+ Bedroom</SelectItem>
                            <SelectItem value="2">2+ Bedrooms</SelectItem>
                            <SelectItem value="3">3+ Bedrooms</SelectItem>
                            <SelectItem value="4">4+ Bedrooms</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                          Bathrooms
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white/70 backdrop-blur-sm">
                              <SelectValue placeholder="Number of bathrooms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-2 shadow-xl">
                            <SelectItem value="">Any</SelectItem>
                            <SelectItem value="1">1+ Bathroom</SelectItem>
                            <SelectItem value="2">2+ Bathrooms</SelectItem>
                            <SelectItem value="3">3+ Bathrooms</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            
            {/* Search Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 text-lg"
              >
                <Search className="w-6 h-6 mr-3" />
                Find Perfect Properties
              </Button>
              {isHomePage && (
                <Button 
                  type="button"
                  variant="secondary"
                  className="flex-1 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 font-semibold py-5 px-8 rounded-2xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => window.location.href = "/properties"}
                >
                  Browse All Properties
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
