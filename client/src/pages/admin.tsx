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
import { Trash2, Plus, Edit, LogOut, Home, Building, Users, Mail, MessageSquare, FileText } from "lucide-react";
import { format } from "date-fns";
import type { Property, Contact, Newsletter, Entrustment, PropertyRequest, InsertProperty } from "@shared/schema";

interface AdminAuth {
  authenticated: boolean;
  admin?: { id: number; username: string };
}

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  size: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  location: string;
  address: string;
  imageUrl: string;
  featured: boolean;
  available: boolean;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    price: "",
    size: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: "",
    location: "",
    address: "",
    imageUrl: "",
    featured: false,
    available: true,
  });

  // Check authentication
  const { data: auth, isLoading: authLoading } = useQuery<AdminAuth>({
    queryKey: ["/api/admin/auth"],
    retry: false,
  });

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
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
        propertyType: data.propertyType,
        location: data.location,
        address: data.address,
        imageUrl: data.imageUrl,
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
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
        propertyType: data.propertyType,
        location: data.location,
        address: data.address,
        imageUrl: data.imageUrl,
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      size: "",
      bedrooms: "",
      bathrooms: "",
      propertyType: "",
      location: "",
      address: "",
      imageUrl: "",
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
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      propertyType: property.propertyType,
      location: property.location,
      address: property.address,
      imageUrl: property.imageUrl,
      featured: property.featured || false,
      available: property.available !== false,
    });
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
                  Pin-point Admin
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome back, {auth.admin?.username}
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
              <TabsTrigger value="entrustments">Entrustments</TabsTrigger>
              <TabsTrigger value="requests">Property Requests</TabsTrigger>
            </TabsList>

            {/* Properties Tab */}
            <TabsContent value="properties">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Properties Management</CardTitle>
                      <CardDescription>Manage all property listings</CardDescription>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={handleCreateProperty}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Property
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create New Property</DialogTitle>
                          <DialogDescription>
                            Add a new property to the listings
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="price">Price</Label>
                              <Input
                                id="price"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                placeholder="€500,000"
                                required
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="size">Size (m²)</Label>
                              <Input
                                id="size"
                                type="number"
                                value={formData.size}
                                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="bedrooms">Bedrooms</Label>
                              <Input
                                id="bedrooms"
                                type="number"
                                value={formData.bedrooms}
                                onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="bathrooms">Bathrooms</Label>
                              <Input
                                id="bathrooms"
                                type="number"
                                value={formData.bathrooms}
                                onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="propertyType">Property Type</Label>
                              <Select value={formData.propertyType} onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="apartment">Apartment</SelectItem>
                                  <SelectItem value="house">House</SelectItem>
                                  <SelectItem value="villa">Villa</SelectItem>
                                  <SelectItem value="studio">Studio</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              value={formData.address}
                              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input
                              id="imageUrl"
                              value={formData.imageUrl}
                              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                              placeholder="https://example.com/image.jpg"
                              required
                            />
                          </div>

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
                              {property.location} • {property.price} • {property.size}m²
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
                      <div>
                        <Label htmlFor="edit-bedrooms">Bedrooms</Label>
                        <Input
                          id="edit-bedrooms"
                          type="number"
                          value={formData.bedrooms}
                          onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-bathrooms">Bathrooms</Label>
                        <Input
                          id="edit-bathrooms"
                          type="number"
                          value={formData.bathrooms}
                          onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-propertyType">Property Type</Label>
                        <Select value={formData.propertyType} onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
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

                    <div>
                      <Label htmlFor="edit-imageUrl">Image URL</Label>
                      <Input
                        id="edit-imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                        required
                      />
                    </div>

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
                              {request.minPrice && ` • Min: ${request.minPrice}`}
                              {request.maxPrice && ` • Max: ${request.maxPrice}`}
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
          </Tabs>
        </div>
      </main>
    </div>
  );
}