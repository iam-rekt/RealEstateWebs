import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Plus, Edit, LogOut, Home, Building, Users, Mail, MessageSquare, FileText } from "lucide-react";
import { format } from "date-fns";

interface AdminAuth {
  authenticated: boolean;
  admin?: { id: number; username: string };
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch data
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    enabled: auth?.authenticated,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/admin/contacts"],
    enabled: auth?.authenticated,
  });

  const { data: newsletters = [] } = useQuery({
    queryKey: ["/api/admin/newsletters"],
    enabled: auth?.authenticated,
  });

  const { data: entrustments = [] } = useQuery({
    queryKey: ["/api/admin/entrustments"],
    enabled: auth?.authenticated,
  });

  const { data: propertyRequests = [] } = useQuery({
    queryKey: ["/api/admin/property-requests"],
    enabled: auth?.authenticated,
  });

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
                    <Button onClick={() => setLocation("/admin/properties/new")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property
                    </Button>
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
                              onClick={() => setLocation(`/admin/properties/${property.id}/edit`)}
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