import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Handshake } from "lucide-react";
import type { EntrustmentFormData } from "@/lib/types";

const entrustmentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  propertyType: z.string().min(1, "Please select property type"),
  location: z.string().min(1, "Location is required"),
  size: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  serviceType: z.string().min(1, "Please select service type"),
});

export default function EntrustmentForm() {
  const { toast } = useToast();
  
  const form = useForm<EntrustmentFormData & { size: string }>({
    resolver: zodResolver(entrustmentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      propertyType: "",
      location: "",
      size: "",
      description: "",
      serviceType: "",
    },
  });

  const entrustmentMutation = useMutation({
    mutationFn: async (data: EntrustmentFormData) => {
      const response = await apiRequest("POST", "/api/entrustments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted!",
        description: "Your entrustment request has been submitted. We'll contact you soon.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EntrustmentFormData & { size: string; bedrooms: string; bathrooms: string }) => {
    const formattedData: EntrustmentFormData = {
      ...data,
      size: data.size ? parseInt(data.size) : undefined,
      bedrooms: data.bedrooms ? parseInt(data.bedrooms) : undefined,
      bathrooms: data.bathrooms ? parseInt(data.bathrooms) : undefined,
    };
    entrustmentMutation.mutate(formattedData);
  };

  return (
    <div className="bg-neutral rounded-xl p-8 text-center">
      <div className="bg-accent text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
        <Handshake className="w-8 h-8" />
      </div>
      <h4 className="text-xl font-semibold mb-4">Entrustment Request</h4>
      <p className="text-gray-600 mb-6">Let us help you rent or sell your property efficiently</p>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full bg-accent hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200">
            Submit Property
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Your Property for Rent or Sale</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={entrustmentMutation.isPending} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={entrustmentMutation.isPending} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled={entrustmentMutation.isPending} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} disabled={entrustmentMutation.isPending} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={entrustmentMutation.isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={entrustmentMutation.isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rent">For Rent</SelectItem>
                          <SelectItem value="sell">For Sale</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Kolonaki, Athens" {...field} disabled={entrustmentMutation.isPending} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size (sq.m.)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={entrustmentMutation.isPending} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={entrustmentMutation.isPending} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={entrustmentMutation.isPending} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={4} 
                        placeholder="Describe your property, its features, and any special characteristics..."
                        {...field} 
                        disabled={entrustmentMutation.isPending} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={entrustmentMutation.isPending}
                className="w-full bg-accent hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
              >
                {entrustmentMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
