import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { SearchFilters } from "@/lib/types";

const landSearchSchema = z.object({
  propertyType: z.string().default("land"),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minSize: z.string().optional(),
  maxSize: z.string().optional(),
  governorate: z.string().optional(),
  directorate: z.string().optional(),
  village: z.string().optional(),
  basin: z.string().optional(),
  neighborhood: z.string().optional(),
  plotNumber: z.string().optional(),
});

type LandSearchFormData = z.infer<typeof landSearchSchema>;

interface LandSearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  isHomePage?: boolean;
}

export default function LandSearchFilters({ onSearch, isHomePage = false }: LandSearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const form = useForm<LandSearchFormData>({
    resolver: zodResolver(landSearchSchema),
    defaultValues: {
      propertyType: "land",
      minPrice: undefined,
      maxPrice: undefined,
      minSize: undefined,
      maxSize: undefined,
      governorate: undefined,
      directorate: undefined,
      village: undefined,
      basin: undefined,
      neighborhood: undefined,
      plotNumber: undefined,
    },
  });

  const onSubmit = (data: LandSearchFormData) => {
    // Convert to SearchFilters format
    const searchFilters: SearchFilters = {
      propertyType: data.propertyType,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      minSize: data.minSize,
      maxSize: data.maxSize,
      governorate: data.governorate,
      directorate: data.directorate,
      village: data.village,
      basin: data.basin,
      neighborhood: data.neighborhood,
      plotNumber: data.plotNumber,
    };
    onSearch(searchFilters);
  };

  // Jordan governorates in Arabic
  const jordanGovernorates = [
    "عمان",
    "إربد", 
    "الزرقاء",
    "البلقاء",
    "مادبا",
    "الكرك",
    "الطفيلة",
    "معان",
    "العقبة",
    "جرش",
    "عجلون",
    "المفرق"
  ];

  // Sample directorates for Amman (this would normally be dynamic based on governorate)
  const ammanDirectorates = [
    "قصبة عمان",
    "الجامعة",
    "وادي السير",
    "أبو نصير",
    "ماركا",
    "القويسمة",
    "سحاب",
    "الموقر",
    "ناعور"
  ];

  return (
    <Card className={`w-full ${isHomePage ? 'bg-white/90 backdrop-blur-sm shadow-2xl border-0' : 'bg-white shadow-lg'} rounded-2xl overflow-hidden`} dir="rtl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          البحث عن الأراضي
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Land Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-base font-semibold text-gray-800 mb-3">
                      نوع الأرض
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white text-right">
                          <SelectValue placeholder="اختر نوع الأرض" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-2 shadow-xl">
                        <SelectItem value="land">أرض سكنية</SelectItem>
                        <SelectItem value="farm">أرض زراعية</SelectItem>
                        <SelectItem value="commercial">أرض تجارية</SelectItem>
                        <SelectItem value="industrial">أرض صناعية</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Price Range */}
              <FormField
                control={form.control}
                name="minPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-base font-semibold text-gray-800 mb-3">
                      السعر الأدنى (د.أ)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="من 50,000 د.أ"
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white text-right"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-base font-semibold text-gray-800 mb-3">
                      السعر الأعلى (د.أ)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="إلى 500,000 د.أ"
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white text-right"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Land Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="minSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-base font-semibold text-gray-800 mb-3">
                      المساحة الدنيا (متر مربع)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="من 300 م²"
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white text-right"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-base font-semibold text-gray-800 mb-3">
                      المساحة العليا (متر مربع)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="إلى 2000 م²"
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white text-right"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Advanced Search Options Toggle */}
            <div className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all duration-200 font-semibold"
              >
                {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                خيارات بحث متقدمة
                {!showAdvanced && <span className="text-blue-500">+</span>}
              </Button>
            </div>

            {/* Jordan Location Hierarchy - Collapsible */}
            {showAdvanced && (
              <div className="pt-6 border-t border-gray-200/50 animate-in slide-in-from-top duration-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">تفاصيل الموقع في الأردن</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Governorate */}
                <FormField
                  control={form.control}
                  name="governorate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-base font-semibold text-gray-800 mb-3">
                        المحافظة
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white text-right">
                            <SelectValue placeholder="إختر المحافظة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-2 shadow-xl">
                          {jordanGovernorates.map((gov) => (
                            <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Directorate */}
                <FormField
                  control={form.control}
                  name="directorate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-base font-semibold text-gray-800 mb-3">
                        المديرية
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white text-right">
                            <SelectValue placeholder="إختر المديرية" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-2 shadow-xl">
                          {ammanDirectorates.map((dir) => (
                            <SelectItem key={dir} value={dir}>{dir}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Village */}
                <FormField
                  control={form.control}
                  name="village"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-base font-semibold text-gray-800 mb-3">
                        القرية
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="إختر القرية"
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white text-right"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Basin */}
                <FormField
                  control={form.control}
                  name="basin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-base font-semibold text-gray-800 mb-3">
                        الحوض
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="إختر الحوض"
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white text-right"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Neighborhood */}
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-base font-semibold text-gray-800 mb-3">
                        الحي
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="إختر الحي"
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white text-right"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Plot Number */}
                <FormField
                  control={form.control}
                  name="plotNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-base font-semibold text-gray-800 mb-3">
                        رقم القطعة
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="إختر رقم القطعة"
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium bg-white text-right"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            )}

            {/* Search Button */}
            <div className="pt-6">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Search className="w-5 h-5 ml-2" />
                البحث عن الأراضي
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}