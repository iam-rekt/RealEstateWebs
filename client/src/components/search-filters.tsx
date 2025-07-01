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
  location: z.string().optional(),
  governorate: z.string().optional(),
  directorate: z.string().optional(),
  village: z.string().optional(),
  basin: z.string().optional(),
  neighborhood: z.string().optional(),
  plotNumber: z.string().optional(),
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
      location: "",
      governorate: "",
      directorate: "",
      village: "",
      basin: "",
      neighborhood: "",
      plotNumber: "",
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
              <div className="text-center mb-10" dir="rtl">
                <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">اعثر على العقار المثالي</h3>
                <p className="text-gray-600 font-medium text-lg">اكتشف العقارات المميزة في عمان بأذكى نظام بحث</p>
              </div>
            )}
            
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
              <div>
                <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                  نطاق السعر (دينار أردني)
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
                            placeholder="من 50,000 د.أ" 
                            {...field}
                            className="modern-input text-right"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="flex items-center text-gray-600 font-medium px-2">إلى</span>
                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="إلى 500,000 د.أ" 
                            {...field}
                            className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium placeholder:text-gray-400 placeholder:font-normal bg-white/70 backdrop-blur-sm text-right"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                  مساحة العقار (متر مربع)
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
                            placeholder="من 50 م²" 
                            {...field}
                            className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium placeholder:text-gray-400 placeholder:font-normal bg-white/70 backdrop-blur-sm text-right"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="flex items-center text-gray-600 font-medium px-2">إلى</span>
                  <FormField
                    control={form.control}
                    name="maxSize"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="إلى 500 م²" 
                            {...field}
                            className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium placeholder:text-gray-400 placeholder:font-normal bg-white/70 backdrop-blur-sm text-right"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            {/* More Filters Toggle */}
            <div className="text-center" dir="rtl">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 px-6 py-3 rounded-xl hover:bg-blue-50/50 border border-blue-200/50"
              >
                {showMoreFilters ? (
                  <>
                    <Minus className="w-5 h-5 ml-2" />
                    إظهار خيارات أقل
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 ml-2" />
                    خيارات بحث متقدمة
                  </>
                )}
              </Button>
            </div>
            
            {/* Additional Filters */}
            {showMoreFilters && (
              <div className="space-y-6 pt-6 border-t border-gray-200/50" dir="rtl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                          نوع العقار
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white/70 backdrop-blur-sm text-right">
                              <SelectValue placeholder="اختر نوع العقار" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-2 shadow-xl">
                            <SelectItem value="">جميع الأنواع</SelectItem>
                            <SelectItem value="land">أرض</SelectItem>
                            <SelectItem value="apartment">شقة</SelectItem>
                            <SelectItem value="villa">فيلا</SelectItem>
                            <SelectItem value="farm">مزرعة</SelectItem>
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
                          غرف النوم
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white/70 backdrop-blur-sm text-right">
                              <SelectValue placeholder="عدد غرف النوم" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-2 shadow-xl">
                            <SelectItem value="">أي عدد</SelectItem>
                            <SelectItem value="1">غرفة نوم واحدة+</SelectItem>
                            <SelectItem value="2">غرفتان نوم+</SelectItem>
                            <SelectItem value="3">3 غرف نوم+</SelectItem>
                            <SelectItem value="4">4 غرف نوم+</SelectItem>
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
                          دورات المياه
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white/70 backdrop-blur-sm text-right">
                              <SelectValue placeholder="عدد دورات المياه" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-2 shadow-xl">
                            <SelectItem value="">أي عدد</SelectItem>
                            <SelectItem value="1">دورة مياه واحدة+</SelectItem>
                            <SelectItem value="2">دورتان مياه+</SelectItem>
                            <SelectItem value="3">3 دورات مياه+</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Location Filters - Jordan Specific - Always Show for Land Search */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200/50">
                  <div className="col-span-full mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">تفاصيل موقع الأرض</h4>
                    <p className="text-sm text-gray-600">حدد الموقع التفصيلي للأرض المطلوبة</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="governorate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                          المحافظة
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white/70 backdrop-blur-sm text-right">
                              <SelectValue placeholder="إختر المحافظة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-2 shadow-xl">
                            <SelectItem value="">جميع المحافظات</SelectItem>
                            <SelectItem value="amman">عمان</SelectItem>
                            <SelectItem value="zarqa">الزرقاء</SelectItem>
                            <SelectItem value="irbid">إربد</SelectItem>
                            <SelectItem value="balqa">البلقاء</SelectItem>
                            <SelectItem value="madaba">مادبا</SelectItem>
                            <SelectItem value="karak">الكرك</SelectItem>
                            <SelectItem value="tafilah">الطفيلة</SelectItem>
                            <SelectItem value="maan">معان</SelectItem>
                            <SelectItem value="aqaba">العقبة</SelectItem>
                            <SelectItem value="mafraq">المفرق</SelectItem>
                            <SelectItem value="ajloun">عجلون</SelectItem>
                            <SelectItem value="jerash">جرش</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="directorate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                          المديرية
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white/70 backdrop-blur-sm text-right">
                              <SelectValue placeholder="إختر المديرية" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-2 shadow-xl">
                            <SelectItem value="">جميع المديريات</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                          القرية
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white/70 backdrop-blur-sm text-right">
                              <SelectValue placeholder="إختر القرية" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-2 shadow-xl">
                            <SelectItem value="">جميع القرى</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="basin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                          الحوض
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white/70 backdrop-blur-sm text-right">
                              <SelectValue placeholder="إختر الحوض" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-2 shadow-xl">
                            <SelectItem value="">جميع الأحواض</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                          الحي
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white/70 backdrop-blur-sm text-right">
                              <SelectValue placeholder="إختر الحي" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-2 shadow-xl">
                            <SelectItem value="">جميع الأحياء</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="plotNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-base font-semibold text-gray-800 mb-3 tracking-wide">
                          رقم القطعة
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="إختر رقم القطعة" 
                            {...field}
                            className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium placeholder:text-gray-400 placeholder:font-normal bg-white/70 backdrop-blur-sm text-right"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            
            {/* Search Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2" dir="rtl">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 text-lg"
              >
                <Search className="w-6 h-6 ml-3" />
                البحث عن العقارات المثالية
              </Button>
              {isHomePage && (
                <Button 
                  type="button"
                  variant="secondary"
                  className="flex-1 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 font-semibold py-5 px-8 rounded-2xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => window.location.href = "/properties"}
                >
                  تصفح جميع العقارات
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
