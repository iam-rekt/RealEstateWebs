import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";

interface MultipleImageUploadProps {
  value?: string[];
  onChange: (imageUrls: string[]) => void;
  label?: string;
  required?: boolean;
  maxImages?: number;
}

export default function MultipleImageUpload({ 
  value = [], 
  onChange, 
  label = "Property Images", 
  required = false,
  maxImages = 5
}: MultipleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // Check if adding these files would exceed the limit
    if (previewUrls.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);
        }

        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        return data.imageUrl;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      const updatedUrls = [...previewUrls, ...newImageUrls];
      
      setPreviewUrls(updatedUrls);
      onChange(updatedUrls);

      toast({
        title: "Images uploaded successfully",
        description: `${newImageUrls.length} image(s) uploaded`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlAdd = (url: string) => {
    if (!url.trim()) return;
    
    if (previewUrls.length >= maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive",
      });
      return;
    }

    const updatedUrls = [...previewUrls, url.trim()];
    setPreviewUrls(updatedUrls);
    onChange(updatedUrls);
  };

  const removeImage = (index: number) => {
    const updatedUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(updatedUrls);
    onChange(updatedUrls);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const updatedUrls = [...previewUrls];
    const [movedItem] = updatedUrls.splice(fromIndex, 1);
    updatedUrls.splice(toIndex, 0, movedItem);
    setPreviewUrls(updatedUrls);
    onChange(updatedUrls);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Image Preview Grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Actions */}
      {previewUrls.length < maxImages && (
        <div className="flex flex-col gap-4">
          {/* File Upload */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images ({previewUrls.length}/{maxImages})
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* URL Input */}
          <ImageUrlInput onAdd={handleUrlAdd} />
        </div>
      )}

      {previewUrls.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">No images uploaded yet</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload First Image
          </Button>
        </div>
      )}
    </div>
  );
}

function ImageUrlInput({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAdd(url);
      setUrl("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="url"
        placeholder="Or paste image URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" variant="outline" size="icon">
        <Plus className="w-4 h-4" />
      </Button>
    </form>
  );
}