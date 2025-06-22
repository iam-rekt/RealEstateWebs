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
    ? "bg-white rounded-2xl shadow-2xl p-6 lg:p-8 max-w-4xl mx-auto"
    : "bg-white p-4 rounded-lg shadow-sm";

  return (
    <Card className={containerClass}>
      <CardContent className={isHomePage ? "p-0" : "p-0"}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (€)
                </FormLabel>
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Min price" 
                            {...field}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="flex items-center text-gray-500">to</span>
                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Max price" 
                            {...field}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                  Size Range (sq.m.)
                </FormLabel>
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="minSize"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Min size" 
                            {...field}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="flex items-center text-gray-500">to</span>
                  <FormField
                    control={form.control}
                    name="maxSize"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Max size" 
                            {...field}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
                className="text-primary hover:text-primary-dark font-medium transition-colors duration-200"
              >
                {showMoreFilters ? (
                  <>
                    <Minus className="w-4 h-4 mr-2" />
                    Less filters
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    More filters
                  </>
                )}
              </Button>
            </div>
            
            {/* Additional Filters */}
            {showMoreFilters && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                          Property Type
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                              <SelectValue placeholder="Any type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Any type</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
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
                        <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                          Bedrooms
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Any</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
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
                        <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                          Bathrooms
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Any</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            
            {/* Search Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Properties
              </Button>
              {isHomePage && (
                <Button 
                  type="button"
                  variant="secondary"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-8 rounded-lg transition-colors duration-200"
                  onClick={() => window.location.href = "/properties"}
                >
                  All our properties
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
