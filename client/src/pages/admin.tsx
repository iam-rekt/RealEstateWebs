import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Plus, Edit, LogOut, Home, Building, Users, Mail, MessageSquare, FileText, Settings } from "lucide-react";
import { format } from "date-fns";
import type { Property, Contact, Newsletter, Entrustment, PropertyRequest, InsertProperty, Governorate, Directorate, InsertGovernorate, InsertDirectorate, PropertyType, InsertPropertyType } from "@shared/schema";
import MultipleImageUpload from "@/components/multiple-image-upload";

interface AdminAuth {
  authenticated: boolean;
  admin?: { id: number; username: string };
}

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  size: string;
  propertyType: string;
  location: string;
  address: string;
  images: string[];
  governorateId: string;
  directorateId: string;
  village: string;
  basin: string;
  neighborhood: string;
  plotNumber: string;
  featured: boolean;
  available: boolean;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Format price in Arabic numerals
  const formatPriceArabic = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('ar-JO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [governorateForm, setGovernorateForm] = useState({ nameAr: "", nameEn: "" });
  const [directorateForm, setDirectorateForm] = useState({ nameAr: "", nameEn: "", governorateId: "" });
  const [isGovernorateDialogOpen, setIsGovernorateDialogOpen] = useState(false);
  const [isDirectorateDialogOpen, setIsDirectorateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    price: "",
    size: "",
    propertyType: "",
    location: "",
    address: "",
    images: [],
    governorateId: "",
    directorateId: "",
    village: "",
    basin: "",
    neighborhood: "",
    plotNumber: "",
    featured: false,
    available: true,
  });

  // Check authentication
  const { data: auth, isLoading: authLoading, refetch: refetchAuth } = useQuery<AdminAuth>({
    queryKey: ["/api/admin/auth"],
    retry: false,
    staleTime: 0, // Always refetch when component mounts
  });

  // Refetch auth on component mount to ensure fresh data
  useEffect(() => {
    refetchAuth();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && (!auth || !auth.authenticated)) {
      setLocation("/admin/login");
    }
  }, [auth, authLoading, setLocation]);

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/admin/login");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin panel",
      });
    },
  });

  // Fetch data with proper typing
  const { data: propertiesData } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: auth?.authenticated,
  });
  const properties = propertiesData || [];

  const { data: contactsData } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
    enabled: auth?.authenticated,
  });
  const contacts = contactsData || [];

  const { data: newslettersData } = useQuery<Newsletter[]>({
    queryKey: ["/api/admin/newsletters"],
    enabled: auth?.authenticated,
  });
  const newsletters = newslettersData || [];

  const { data: entrustmentsData } = useQuery<Entrustment[]>({
    queryKey: ["/api/admin/entrustments"],
    enabled: auth?.authenticated,
  });
  const entrustments = entrustmentsData || [];

  const { data: propertyRequestsData } = useQuery<PropertyRequest[]>({
    queryKey: ["/api/admin/property-requests"],
    enabled: auth?.authenticated,
  });
  const propertyRequests = propertyRequestsData || [];

  const { data: governoratesData } = useQuery<Governorate[]>({
    queryKey: ["/api/admin/governorates"],
    enabled: auth?.authenticated,
  });
  const governorates = governoratesData || [];

  const { data: directoratesData } = useQuery<Directorate[]>({
    queryKey: ["/api/admin/directorates"],
    enabled: auth?.authenticated,
  });
  const directorates = directoratesData || [];

  // Delete mutations
  const createDeleteMutation = (endpoint: string, queryKey: string[]) => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Delete failed");
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
        toast({
          title: "Deleted successfully",
          description: "Item has been removed",
        });
      },
      onError: () => {
        toast({
          title: "Delete failed",
          description: "Failed to delete item",
          variant: "destructive",
        });
      },
    });
  };

  const deleteProperty = createDeleteMutation("/api/admin/properties", ["/api/properties"]);
  const deleteContact = createDeleteMutation("/api/admin/contacts", ["/api/admin/contacts"]);
  const deleteNewsletter = createDeleteMutation("/api/admin/newsletters", ["/api/admin/newsletters"]);
  const deleteEntrustment = createDeleteMutation("/api/admin/entrustments", ["/api/admin/entrustments"]);
  const deletePropertyRequest = createDeleteMutation("/api/admin/property-requests", ["/api/admin/property-requests"]);

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const propertyData = {
        title: data.title,
        description: data.description,
        price: data.price,
        size: parseInt(data.size),
        bedrooms: 0, // Set to 0 for land properties
        bathrooms: 0, // Set to 0 for land properties
        propertyType: data.propertyType,
        location: data.location,
        address: data.address,
        images: data.images,
        governorateId: data.governorateId ? parseInt(data.governorateId) : null,
        directorateId: data.directorateId ? parseInt(data.directorateId) : null,
        village: data.village || null,
        basin: data.basin || null,
        neighborhood: data.neighborhood || null,
        plotNumber: data.plotNumber || null,
        featured: data.featured,
        available: data.available,
      };
      const response = await fetch("/api/admin/properties", {
        method: "POST",
        body: JSON.stringify(propertyData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create property");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Property created",
        description: "Property has been added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create property",
        variant: "destructive",
      });
    },
  });

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PropertyFormData }) => {
      const propertyData = {
        title: data.title,
        description: data.description,
        price: data.price,
        size: parseInt(data.size),
        bedrooms: 0, // Set to 0 for land properties
        bathrooms: 0, // Set to 0 for land properties
        propertyType: data.propertyType,
        location: data.location,
        address: data.address,
        images: data.images,
        governorateId: data.governorateId ? parseInt(data.governorateId) : null,
        directorateId: data.directorateId ? parseInt(data.directorateId) : null,
        village: data.village || null,
        basin: data.basin || null,
        neighborhood: data.neighborhood || null,
        plotNumber: data.plotNumber || null,
        featured: data.featured,
        available: data.available,
      };
      const response = await fetch(`/api/admin/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify(propertyData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update property");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setEditingProperty(null);
      resetForm();
      toast({
        title: "Property updated",
        description: "Property has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      });
    },
  });

  // Governorate mutations
  const createGovernorateMutation = useMutation({
    mutationFn: async (governorateData: InsertGovernorate) => {
      return apiRequest("POST", "/api/admin/governorates", governorateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/governorates"] });
      setGovernorateForm({ nameAr: "", nameEn: "" });
      setIsGovernorateDialogOpen(false);
      toast({
        title: "نجح الإضافة",
        description: "تم إضافة المحافظة بنجاح",
      });
    },
    onError: (error) => {
      console.error("Error creating governorate:", error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة المحافظة",
        variant: "destructive",
      });
    },
  });

  // Directorate mutations
  const createDirectorateMutation = useMutation({
    mutationFn: async (directorateData: InsertDirectorate) => {
      return apiRequest("POST", "/api/admin/directorates", directorateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/directorates"] });
      setDirectorateForm({ nameAr: "", nameEn: "", governorateId: "" });
      setIsDirectorateDialogOpen(false);
      toast({
        title: "نجح الإضافة",
        description: "تم إضافة المديرية بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة المديرية",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      size: "",
      propertyType: "",
      location: "",
      address: "",
      images: [] as string[],
      governorateId: "",
      directorateId: "",
      village: "",
      basin: "",
      neighborhood: "",
      plotNumber: "",
      featured: false,
      available: true,
    });
  };

  const handleCreateProperty = () => {
    setIsCreateDialogOpen(true);
    resetForm();
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description,
      price: property.price,
      size: property.size.toString(),
      propertyType: property.propertyType,
      location: property.location,
      address: property.address,
      images: property.images || [],
      governorateId: property.governorateId?.toString() || "",
      directorateId: property.directorateId?.toString() || "",
      village: property.village || "",
      basin: property.basin || "",
      neighborhood: property.neighborhood || "",
      plotNumber: property.plotNumber || "",
      featured: property.featured || false,
      available: property.available !== false,
    });
  };

  // Settings Tab Component
  const SettingsTab = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    // Fetch current settings
    const { data: settingsData } = useQuery({
      queryKey: ["/api/admin/site-settings"],
      enabled: !!auth?.authenticated,
    });

    useEffect(() => {
      if (settingsData && Array.isArray(settingsData)) {
        const settingsMap = settingsData.reduce((acc: Record<string, string>, setting: any) => {
          acc[setting.settingKey] = setting.settingValue;
          return acc;
        }, {});
        setSettings(settingsMap);
        setLoading(false);
      }
    }, [settingsData]);

    const updateSettingsMutation = useMutation({
      mutationFn: async (updatedSettings: Record<string, string>) => {
        const response = await fetch("/api/admin/site-settings", {
          method: "POST",
          body: JSON.stringify({ settings: updatedSettings }),
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error("Failed to update settings");
        }
        return await response.json();
      },
      onSuccess: () => {
        toast({
          title: "Settings updated successfully",
          description: "Site settings have been saved.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      },
      onError: (error) => {
        toast({
          title: "Failed to update settings",
          description: "Please try again.",
          variant: "destructive",
        });
      },
    });

    const handleSettingChange = (key: string, value: string) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSettingsSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateSettingsMutation.mutate(settings);
    };

    if (loading) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Settings</CardTitle>
            <CardDescription>
              Manage footer content and contact information displayed on the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Company Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={settings.footer_company_name || ""}
                      onChange={(e) => handleSettingChange("footer_company_name", e.target.value)}
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={settings.footer_tagline || ""}
                      onChange={(e) => handleSettingChange("footer_tagline", e.target.value)}
                      placeholder="Premium Properties in Amman"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Company Description</Label>
                  <textarea
                    id="description"
                    value={settings.footer_description || ""}
                    onChange={(e) => handleSettingChange("footer_description", e.target.value)}
                    placeholder="Company description for footer"
                    className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="address">العنوان الكامل</Label>
                    <Input
                      id="address"
                      value={settings.footer_address || ""}
                      onChange={(e) => handleSettingChange("footer_address", e.target.value)}
                      placeholder="الصويفية - مجمع فرح التجاري - الطابق الثاني"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">الهاتف</Label>
                    <Input
                      id="phone"
                      value={settings.footer_phone || ""}
                      onChange={(e) => handleSettingChange("footer_phone", e.target.value)}
                      placeholder="+962 6 5826440"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fax">الفاكس</Label>
                    <Input
                      id="fax"
                      value={settings.footer_fax || ""}
                      onChange={(e) => handleSettingChange("footer_fax", e.target.value)}
                      placeholder="+962 6 5826408"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile1">الجوال الأول</Label>
                    <Input
                      id="mobile1"
                      value={settings.footer_mobile1 || ""}
                      onChange={(e) => handleSettingChange("footer_mobile1", e.target.value)}
                      placeholder="+962 79 5566030"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile2">الجوال الثاني</Label>
                    <Input
                      id="mobile2"
                      value={settings.footer_mobile2 || ""}
                      onChange={(e) => handleSettingChange("footer_mobile2", e.target.value)}
                      placeholder="+962 77 5566030"
                    />
                  </div>
                  <div>
                    <Label htmlFor="po_box">صندوق البريد</Label>
                    <Input
                      id="po_box"
                      value={settings.footer_po_box || ""}
                      onChange={(e) => handleSettingChange("footer_po_box", e.target.value)}
                      placeholder="ص.ب: 37 عمان 11831 الأردن"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manager">المدير العام</Label>
                    <Input
                      id="manager"
                      value={settings.footer_manager || ""}
                      onChange={(e) => handleSettingChange("footer_manager", e.target.value)}
                      placeholder="المدير العام: فؤاد حدادين"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      value={settings.footer_email || ""}
                      onChange={(e) => handleSettingChange("footer_email", e.target.value)}
                      placeholder="info@randrealestate.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">الموقع الإلكتروني</Label>
                    <Input
                      id="website"
                      value={settings.footer_website || ""}
                      onChange={(e) => handleSettingChange("footer_website", e.target.value)}
                      placeholder="www.randrealestate.com"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="working_hours">أوقات العمل</Label>
                    <textarea
                      id="working_hours"
                      value={settings.footer_working_hours || ""}
                      onChange={(e) => handleSettingChange("footer_working_hours", e.target.value)}
                      placeholder="الأحد إلى الخميس&#10;9:30 صباحاً - 5:00 مساءً"
                      className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Social Media Links</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="facebook">Facebook URL</Label>
                    <Input
                      id="facebook"
                      value={settings.footer_social_facebook || ""}
                      onChange={(e) => handleSettingChange("footer_social_facebook", e.target.value)}
                      placeholder="https://facebook.com/company"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram URL</Label>
                    <Input
                      id="instagram"
                      value={settings.footer_social_instagram || ""}
                      onChange={(e) => handleSettingChange("footer_social_instagram", e.target.value)}
                      placeholder="https://instagram.com/company"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input
                      id="linkedin"
                      value={settings.footer_social_linkedin || ""}
                      onChange={(e) => handleSettingChange("footer_social_linkedin", e.target.value)}
                      placeholder="https://linkedin.com/company"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Contact Details */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Additional Contact Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      value={settings.contact_phone_mobile || ""}
                      onChange={(e) => handleSettingChange("contact_phone_mobile", e.target.value)}
                      placeholder="+962 79 123 4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sales_email">Sales Email</Label>
                    <Input
                      id="sales_email"
                      value={settings.contact_email_sales || ""}
                      onChange={(e) => handleSettingChange("contact_email_sales", e.target.value)}
                      placeholder="sales@haddadinrealestate.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="working_hours">Working Hours</Label>
                  <textarea
                    id="working_hours"
                    value={settings.contact_working_hours || ""}
                    onChange={(e) => handleSettingChange("contact_working_hours", e.target.value)}
                    placeholder="Sunday - Thursday: 9:00 AM - 6:00 PM"
                    className="w-full min-h-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="min-w-32"
                >
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProperty) {
      updatePropertyMutation.mutate({ id: editingProperty.id, data: formData });
    } else {
      createPropertyMutation.mutate(formData);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!auth?.authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Haddadin Admin
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  أهلاً وسهلاً، {auth.admin?.username}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="flex items-center"
              >
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Button>
              <Button
                variant="destructive"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Properties</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{properties.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Contacts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{contacts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Newsletters</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{newsletters.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Entrustments</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{entrustments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Requests</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{propertyRequests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="properties">الأراضي</TabsTrigger>
              <TabsTrigger value="contacts">الاتصالات</TabsTrigger>
              <TabsTrigger value="newsletters">النشرة الإخبارية</TabsTrigger>
              <TabsTrigger value="entrustments">الاستشارات</TabsTrigger>
              <TabsTrigger value="requests">طلبات الأراضي</TabsTrigger>
              <TabsTrigger value="locations">المواقع</TabsTrigger>
              <TabsTrigger value="property-types">أنواع الأراضي</TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-1" />
                الإعدادات
              </TabsTrigger>
            </TabsList>

            {/* Properties Tab */}
            <TabsContent value="properties">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>إدارة الأراضي</CardTitle>
                      <CardDescription>إدارة جميع قوائم الأراضي</CardDescription>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={handleCreateProperty}>
                          <Plus className="h-4 w-4 mr-2" />
                          إضافة أرض
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>إضافة أرض جديدة</DialogTitle>
                          <DialogDescription>
                            إضافة أرض جديدة إلى القوائم
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="title">عنوان الأرض</Label>
                              <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="مثال: أرض سكنية في عبدون"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="price">السعر (د.أ)</Label>
                              <Input
                                id="price"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                placeholder="500,000"
                                required
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="description">وصف الأرض</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="تفاصيل عن الأرض، الموقع، والمميزات"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label htmlFor="size">حجم الأرض (م²)</Label>
                              <Input
                                id="size"
                                type="number"
                                value={formData.size}
                                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                                placeholder="مثال: 500"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="propertyType">نوع الأرض</Label>
                              <Select value={formData.propertyType} onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر نوع الأرض" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="land">أرض سكنية</SelectItem>
                                  <SelectItem value="farm">أرض زراعية</SelectItem>
                                  <SelectItem value="commercial">أرض تجارية</SelectItem>
                                  <SelectItem value="industrial">أرض صناعية</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="location">الموقع</Label>
                              <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="مثال: عبدون، عمان"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="address">العنوان التفصيلي</Label>
                            <Input
                              id="address"
                              value={formData.address}
                              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="العنوان الكامل للأرض"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="governorateId">المحافظة</Label>
                              <Select value={formData.governorateId} onValueChange={(value) => setFormData(prev => ({ ...prev, governorateId: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="إختر المحافظة" />
                                </SelectTrigger>
                                <SelectContent>
                                  {governorates.map((gov: any) => (
                                    <SelectItem key={gov.id} value={gov.id.toString()}>
                                      {gov.nameAr}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="directorateId">المديرية</Label>
                              <Select value={formData.directorateId} onValueChange={(value) => setFormData(prev => ({ ...prev, directorateId: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="إختر المديرية" />
                                </SelectTrigger>
                                <SelectContent>
                                  {directorates.map((dir: any) => (
                                    <SelectItem key={dir.id} value={dir.id.toString()}>
                                      {dir.nameAr}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="village">القرية</Label>
                              <Input
                                id="village"
                                value={formData.village}
                                onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                                placeholder="القرية"
                              />
                            </div>
                            <div>
                              <Label htmlFor="basin">الحوض</Label>
                              <Input
                                id="basin"
                                value={formData.basin}
                                onChange={(e) => setFormData(prev => ({ ...prev, basin: e.target.value }))}
                                placeholder="الحوض"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="neighborhood">الحي</Label>
                              <Input
                                id="neighborhood"
                                value={formData.neighborhood}
                                onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                                placeholder="الحي"
                              />
                            </div>
                            <div>
                              <Label htmlFor="plotNumber">رقم القطعة</Label>
                              <Input
                                id="plotNumber"
                                value={formData.plotNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, plotNumber: e.target.value }))}
                                placeholder="رقم القطعة"
                              />
                            </div>
                          </div>

                          <MultipleImageUpload
                            value={formData.images}
                            onChange={(images) => setFormData(prev => ({ ...prev, images }))}
                            label="Property Images"
                            required
                          />

                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="featured"
                                checked={formData.featured}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: !!checked }))}
                              />
                              <Label htmlFor="featured">Featured Property</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="available"
                                checked={formData.available}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: !!checked }))}
                              />
                              <Label htmlFor="available">Available</Label>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createPropertyMutation.isPending}>
                              {createPropertyMutation.isPending ? "Creating..." : "Create Property"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {properties.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">No properties found</p>
                    ) : (
                      properties.map((property: any) => (
                        <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{property.title}</h3>
                              {property.featured && <Badge variant="secondary">Featured</Badge>}
                              <Badge variant={property.available ? "default" : "destructive"}>
                                {property.available ? "Available" : "Unavailable"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {property.location} • {formatPriceArabic(property.price)} د.أ • {property.size}m²
                            </p>
                            <p className="text-xs text-gray-500">
                              Created: {format(new Date(property.createdAt), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProperty(property)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteProperty.mutate(property.id)}
                              disabled={deleteProperty.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Edit Property Dialog */}
              <Dialog open={!!editingProperty} onOpenChange={(open) => !open && setEditingProperty(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Property</DialogTitle>
                    <DialogDescription>
                      Update property information
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                          id="edit-title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-price">Price</Label>
                        <Input
                          id="edit-price"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="edit-size">Size (m²)</Label>
                        <Input
                          id="edit-size"
                          type="number"
                          value={formData.size}
                          onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                          required
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-propertyType">نوع الأرض</Label>
                        <Select value={formData.propertyType} onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الأرض" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="land">أرض سكنية</SelectItem>
                            <SelectItem value="farm">أرض زراعية</SelectItem>
                            <SelectItem value="commercial">أرض تجارية</SelectItem>
                            <SelectItem value="industrial">أرض صناعية</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-location">Location</Label>
                        <Input
                          id="edit-location"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-address">Address</Label>
                      <Input
                        id="edit-address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-governorateId">المحافظة</Label>
                        <Select value={formData.governorateId} onValueChange={(value) => setFormData(prev => ({ ...prev, governorateId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="إختر المحافظة" />
                          </SelectTrigger>
                          <SelectContent>
                            {governorates.map((gov: any) => (
                              <SelectItem key={gov.id} value={gov.id.toString()}>
                                {gov.nameAr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-directorateId">المديرية</Label>
                        <Select value={formData.directorateId} onValueChange={(value) => setFormData(prev => ({ ...prev, directorateId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="إختر المديرية" />
                          </SelectTrigger>
                          <SelectContent>
                            {directorates.map((dir: any) => (
                              <SelectItem key={dir.id} value={dir.id.toString()}>
                                {dir.nameAr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-village">القرية</Label>
                        <Input
                          id="edit-village"
                          value={formData.village}
                          onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                          placeholder="القرية"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-basin">الحوض</Label>
                        <Input
                          id="edit-basin"
                          value={formData.basin}
                          onChange={(e) => setFormData(prev => ({ ...prev, basin: e.target.value }))}
                          placeholder="الحوض"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-neighborhood">الحي</Label>
                        <Input
                          id="edit-neighborhood"
                          value={formData.neighborhood}
                          onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                          placeholder="الحي"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-plotNumber">رقم القطعة</Label>
                        <Input
                          id="edit-plotNumber"
                          value={formData.plotNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, plotNumber: e.target.value }))}
                          placeholder="رقم القطعة"
                        />
                      </div>
                    </div>

                    <MultipleImageUpload
                      value={formData.images}
                      onChange={(images) => setFormData(prev => ({ ...prev, images }))}
                      label="Property Images"
                      required
                    />

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-featured"
                          checked={formData.featured}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: !!checked }))}
                        />
                        <Label htmlFor="edit-featured">Featured Property</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-available"
                          checked={formData.available}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: !!checked }))}
                        />
                        <Label htmlFor="edit-available">Available</Label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setEditingProperty(null)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updatePropertyMutation.isPending}>
                        {updatePropertyMutation.isPending ? "Updating..." : "Update Property"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Messages</CardTitle>
                  <CardDescription>Customer inquiries and messages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contacts.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">No contacts found</p>
                    ) : (
                      contacts.map((contact: any) => (
                        <div key={contact.id} className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{contact.firstName} {contact.lastName}</h3>
                              <Badge variant="outline">{contact.subject}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{contact.email}</p>
                            {contact.phone && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">{contact.phone}</p>
                            )}
                            <p className="text-sm mt-2">{contact.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(contact.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteContact.mutate(contact.id)}
                            disabled={deleteContact.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Newsletters Tab */}
            <TabsContent value="newsletters">
              <Card>
                <CardHeader>
                  <CardTitle>Newsletter Subscriptions</CardTitle>
                  <CardDescription>Email subscribers for newsletter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {newsletters.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">No newsletter subscriptions found</p>
                    ) : (
                      newsletters.map((newsletter: any) => (
                        <div key={newsletter.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{newsletter.email}</p>
                            <p className="text-xs text-gray-500">
                              Subscribed: {format(new Date(newsletter.createdAt), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteNewsletter.mutate(newsletter.id)}
                            disabled={deleteNewsletter.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Entrustments Tab */}
            <TabsContent value="entrustments">
              <Card>
                <CardHeader>
                  <CardTitle>Property Entrustments</CardTitle>
                  <CardDescription>Property owners wanting to list their properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {entrustments.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">No entrustments found</p>
                    ) : (
                      entrustments.map((entrustment: any) => (
                        <div key={entrustment.id} className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{entrustment.firstName} {entrustment.lastName}</h3>
                              <Badge variant="outline">{entrustment.serviceType}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {entrustment.email} • {entrustment.phone}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {entrustment.propertyType} in {entrustment.location}
                              {entrustment.size && ` • ${entrustment.size}m²`}
                              {entrustment.bedrooms && ` • ${entrustment.bedrooms} bed`}
                              {entrustment.bathrooms && ` • ${entrustment.bathrooms} bath`}
                            </p>
                            <p className="text-sm mt-2">{entrustment.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(entrustment.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteEntrustment.mutate(entrustment.id)}
                            disabled={deleteEntrustment.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Property Requests Tab */}
            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>Property Requests</CardTitle>
                  <CardDescription>Customer requirements and search criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {propertyRequests.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">No property requests found</p>
                    ) : (
                      propertyRequests.map((request: any) => (
                        <div key={request.id} className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-semibold">{request.firstName} {request.lastName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {request.email}
                              {request.phone && ` • ${request.phone}`}
                            </p>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              Requirements: 
                              {request.propertyType && ` ${request.propertyType}`}
                              {request.location && ` in ${request.location}`}
                              {request.minPrice && ` • Min: ${formatPriceArabic(request.minPrice)} د.أ`}
                              {request.maxPrice && ` • Max: ${formatPriceArabic(request.maxPrice)} د.أ`}
                              {request.bedrooms && ` • ${request.bedrooms}+ bed`}
                              {request.bathrooms && ` • ${request.bathrooms}+ bath`}
                            </div>
                            <p className="text-sm mt-2">{request.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(request.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletePropertyRequest.mutate(request.id)}
                            disabled={deletePropertyRequest.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Governorates Management */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>المحافظات</CardTitle>
                        <CardDescription>إدارة محافظات الأردن</CardDescription>
                      </div>
                      <Dialog open={isGovernorateDialogOpen} onOpenChange={setIsGovernorateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            إضافة محافظة
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>إضافة محافظة جديدة</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="govNameAr">الاسم بالعربية</Label>
                              <Input 
                                id="govNameAr" 
                                placeholder="اسم المحافظة بالعربية" 
                                value={governorateForm.nameAr}
                                onChange={(e) => setGovernorateForm(prev => ({ ...prev, nameAr: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="govNameEn">الاسم بالإنجليزية</Label>
                              <Input 
                                id="govNameEn" 
                                placeholder="Governorate name in English" 
                                value={governorateForm.nameEn}
                                onChange={(e) => setGovernorateForm(prev => ({ ...prev, nameEn: e.target.value }))}
                              />
                            </div>
                            <Button 
                              className="w-full"
                              onClick={() => {
                                if (governorateForm.nameAr.trim()) {
                                  createGovernorateMutation.mutate({
                                    nameAr: governorateForm.nameAr.trim(),
                                    nameEn: governorateForm.nameEn.trim() || undefined
                                  });
                                }
                              }}
                              disabled={createGovernorateMutation.isPending || !governorateForm.nameAr.trim()}
                            >
                              {createGovernorateMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {governorates.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">لا توجد محافظات</p>
                      ) : (
                        governorates.map((governorate) => (
                          <div key={governorate.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{governorate.nameAr}</p>
                              {governorate.nameEn && (
                                <p className="text-sm text-gray-500">{governorate.nameEn}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Directorates Management */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>المديريات</CardTitle>
                        <CardDescription>إدارة مديريات المحافظات</CardDescription>
                      </div>
                      <Dialog open={isDirectorateDialogOpen} onOpenChange={setIsDirectorateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            إضافة مديرية
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>إضافة مديرية جديدة</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="dirGov">المحافظة</Label>
                              <Select 
                                value={directorateForm.governorateId} 
                                onValueChange={(value) => setDirectorateForm(prev => ({ ...prev, governorateId: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المحافظة" />
                                </SelectTrigger>
                                <SelectContent>
                                  {governorates.map((gov) => (
                                    <SelectItem key={gov.id} value={gov.id.toString()}>
                                      {gov.nameAr}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="dirNameAr">الاسم بالعربية</Label>
                              <Input 
                                id="dirNameAr" 
                                placeholder="اسم المديرية بالعربية" 
                                value={directorateForm.nameAr}
                                onChange={(e) => setDirectorateForm(prev => ({ ...prev, nameAr: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="dirNameEn">الاسم بالإنجليزية</Label>
                              <Input 
                                id="dirNameEn" 
                                placeholder="Directorate name in English" 
                                value={directorateForm.nameEn}
                                onChange={(e) => setDirectorateForm(prev => ({ ...prev, nameEn: e.target.value }))}
                              />
                            </div>
                            <Button 
                              className="w-full"
                              onClick={() => {
                                if (directorateForm.nameAr.trim() && directorateForm.governorateId) {
                                  createDirectorateMutation.mutate({
                                    nameAr: directorateForm.nameAr.trim(),
                                    nameEn: directorateForm.nameEn.trim() || undefined,
                                    governorateId: parseInt(directorateForm.governorateId)
                                  });
                                }
                              }}
                              disabled={createDirectorateMutation.isPending || !directorateForm.nameAr.trim() || !directorateForm.governorateId}
                            >
                              {createDirectorateMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {directorates.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">لا توجد مديريات</p>
                      ) : (
                        directorates.map((directorate) => {
                          const governorate = governorates.find(g => g.id === directorate.governorateId);
                          return (
                            <div key={directorate.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{directorate.nameAr}</p>
                                <p className="text-sm text-gray-500">
                                  {governorate?.nameAr || 'غير محدد'}
                                  {directorate.nameEn && ` • ${directorate.nameEn}`}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Property Types Tab */}
            <TabsContent value="property-types">
              <PropertyTypesTab />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// Property Types Management Component
function PropertyTypesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPropertyType, setEditingPropertyType] = useState<PropertyType | null>(null);
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    isActive: true
  });

  // Fetch property types
  const { data: propertyTypes = [], isLoading } = useQuery<PropertyType[]>({
    queryKey: ["/api/admin/property-types"],
    enabled: true
  });

  // Create property type mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertPropertyType) => {
      return await apiRequest("POST", "/api/admin/property-types", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/property-types"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "تم إنشاء نوع الأرض بنجاح",
        description: "تم إضافة نوع الأرض الجديد إلى النظام",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء نوع الأرض",
        description: "حدث خطأ أثناء إضافة نوع الأرض الجديد",
        variant: "destructive",
      });
    }
  });

  // Update property type mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPropertyType> }) => {
      return await apiRequest("PUT", `/api/admin/property-types/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/property-types"] });
      setEditingPropertyType(null);
      resetForm();
      toast({
        title: "تم تحديث نوع الأرض بنجاح",
        description: "تم تحديث بيانات نوع الأرض بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في تحديث نوع الأرض",
        description: "حدث خطأ أثناء تحديث بيانات نوع الأرض",
        variant: "destructive",
      });
    }
  });

  // Delete property type mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/property-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/property-types"] });
      toast({
        title: "تم حذف نوع الأرض بنجاح",
        description: "تم حذف نوع الأرض من النظام",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في حذف نوع الأرض",
        description: "حدث خطأ أثناء حذف نوع الأرض",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nameAr: "",
      nameEn: "",
      isActive: true
    });
  };

  const handleSubmit = () => {
    if (!formData.nameAr.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "الرجاء إدخال اسم نوع الأرض باللغة العربية",
        variant: "destructive",
      });
      return;
    }

    if (editingPropertyType) {
      updateMutation.mutate({ id: editingPropertyType.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (propertyType: PropertyType) => {
    setEditingPropertyType(propertyType);
    setFormData({
      nameAr: propertyType.nameAr,
      nameEn: propertyType.nameEn || "",
      isActive: propertyType.isActive ?? true
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا النوع؟")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>إدارة أنواع الأراضي</CardTitle>
            <CardDescription>إضافة وتعديل أنواع الأراضي المتاحة</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingPropertyType(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة نوع جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingPropertyType ? "تعديل نوع الأرض" : "إضافة نوع أرض جديد"}</DialogTitle>
                <DialogDescription>
                  {editingPropertyType ? "تعديل بيانات نوع الأرض" : "إضافة نوع أرض جديد إلى النظام"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nameAr">الاسم بالعربية *</Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="مثل: أرض سكنية"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g: Residential Land"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                  />
                  <Label htmlFor="isActive">نشط</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingPropertyType ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">جارٍ التحميل...</div>
        ) : (
          <div className="space-y-4">
            {propertyTypes.map((propertyType: PropertyType) => (
              <div key={propertyType.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{propertyType.nameAr}</h3>
                    {propertyType.nameEn && (
                      <span className="text-sm text-gray-500">({propertyType.nameEn})</span>
                    )}
                    <Badge variant={propertyType.isActive ? "default" : "secondary"}>
                      {propertyType.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    تم الإنشاء: {format(new Date(propertyType.createdAt!), "dd/MM/yyyy")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(propertyType)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(propertyType.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {propertyTypes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                لا توجد أنواع أراضي مضافة حالياً
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}