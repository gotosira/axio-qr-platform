"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import FolderSelector from "@/components/FolderSelector";
import { toast } from "sonner";

export type QR = {
  id: string;
  label: string;
  slug: string;
  destination: string;
  collectLeads?: boolean;
  logoUrl?: string | null;
  fgColor?: string | null;
  bgColor?: string | null;
  styleType?: string | null;
  logoAspect?: string | null;
  cornerRadius?: number | null;
  logoSizePct?: number | null;
};

export default function QrGenerator() {
  const [label, setLabel] = useState("");
  const [destination, setDestination] = useState("");
  const [creating, setCreating] = useState(false);
  // list moved to My QR page
  const [error, setError] = useState<string | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(35); // percentage of QR size
  const [logoAspect, setLogoAspect] = useState<"1:1" | "16:9" | "3:4">("1:1");
  const [fgColor, setFgColor] = useState<string>("#000000");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [styleType, setStyleType] = useState<"square" | "rounded" | "dots">("square");
  const [cornerRadius, setCornerRadius] = useState<number>(8);
  const [qrSize, setQrSize] = useState<number>(256);
  const [collectLeads, setCollectLeads] = useState<boolean>(false);
  const [removeLogoBg, setRemoveLogoBg] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [originalLogoFile, setOriginalLogoFile] = useState<File | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // management list removed here

  async function create() {
    setError(null);
    
    // Basic validation
    if (!label.trim()) {
      setError("Please enter a label for your QR code");
      toast.error("Please enter a label for your QR code");
      return;
    }
    
    if (!destination.trim()) {
      setError("Please enter destination content for your QR code");
      toast.error("Please enter destination content for your QR code");
      return;
    }

    if (!selectedFolderId) {
      setError("Please select a folder for your QR code");
      toast.error("Please select a folder for your QR code");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/qrcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          destination: destination.trim(),
          collectLeads,
          leadTemplateId: selectedTemplate || null,
          folderId: selectedFolderId,
          style: {
            logoUrl: logoDataUrl || undefined,
            fgColor,
            bgColor,
            styleType,
            logoAspect,
            cornerRadius,
            logoSizePct: logoSize,
          },
          metadata: urlMetadata ? {
            title: urlMetadata.title,
            description: urlMetadata.description,
            image: urlMetadata.image,
          } : undefined,
        }),
      });
      
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create QR code");
      }
      
      // Reset form
      setLabel("");
      setDestination("");
      setLogoDataUrl(null);
      setOriginalLogoFile(null);
      setUrlMetadata(null);
      setPreviewUrl(null);
      setCollectLeads(false);
      setRemoveLogoBg(false);
      setSelectedTemplate("");
      setSelectedFolderId(null);
      
      toast.success("QR code created successfully! Check 'My QR Codes' to manage it.");
    } catch (e: any) {
      const errorMessage = e.message || "Failed to create QR code";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  }

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [urlMetadata, setUrlMetadata] = useState<{
    title?: string;
    description?: string;
    image?: string;
    favicon?: string;
  } | null>(null);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/lead-templates");
      if (response.ok) {
        const templatesData = await response.json();
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  useEffect(() => {
    if (destination && destination.trim()) {
      generatePreview();
      
      // Debounce metadata fetching - reduced delay for faster UX
      const timeoutId = setTimeout(() => {
        fetchUrlMetadata(destination);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setPreviewUrl(null);
      setUrlMetadata(null);
    }
  }, [destination, logoDataUrl, logoSize, logoAspect, fgColor, bgColor, styleType, cornerRadius, qrSize, removeLogoBg]);

  // Reprocess logo when removeLogoBg setting changes
  useEffect(() => {
    if (originalLogoFile) {
      reprocessCurrentLogo();
    }
  }, [removeLogoBg]);

  async function generatePreview() {
    try {
      const { default: QRCodeStyling } = await import("qr-code-styling");
      const qr = new QRCodeStyling({
        width: qrSize,
        height: qrSize,
        data: destination,
        image: logoDataUrl || undefined,
        imageOptions: {
          imageSize: logoDataUrl ? logoSize / 100 : 0,
          margin: removeLogoBg ? 0 : 4,
          crossOrigin: "anonymous",
          hideBackgroundDots: removeLogoBg,
        },
        backgroundOptions: { color: bgColor },
        dotsOptions: {
          color: fgColor,
          type: styleType === "square" ? "square" : styleType,
        } as any,
        cornersSquareOptions: { type: "extra-rounded", color: fgColor } as any,
        cornersDotOptions: { color: fgColor } as any,
      });
      const blob = (await qr.getRawData("png")) as Blob;
      const dataUrl = await blobToDataURL(blob);
      setPreviewUrl(dataUrl);
    } catch {
      try {
        const png = await QRCode.toDataURL(destination, { 
          margin: 1, 
          width: qrSize, 
          color: { dark: fgColor, light: bgColor } 
        });
        setPreviewUrl(png);
      } catch (e) {
        setPreviewUrl(null);
      }
    }
  }

  async function fetchUrlMetadata(url: string) {
    // Only fetch metadata for valid URLs
    if (!isValidUrl(url)) {
      return;
    }

    setFetchingMetadata(true);
    try {
      const response = await fetch('/api/url-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const metadata = await response.json();
        setUrlMetadata(metadata);
        
        // Auto-fill label if it's empty and we have a title
        if (!label && metadata.title) {
          setLabel(metadata.title);
        }
      }
    } catch (error) {
      console.error('Failed to fetch URL metadata:', error);
    } finally {
      setFetchingMetadata(false);
    }
  }

  function isValidUrl(string: string): boolean {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      }
    }
  };

  const processImageFile = async (file: File) => {
    try {
      // Check file size first
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error("Image is too large. Please use an image smaller than 5MB.");
        return;
      }

      setOriginalLogoFile(file);
      const compressedDataUrl = await compressImage(file);
      setLogoDataUrl(compressedDataUrl);
    } catch (error) {
      console.error('Image processing failed:', error);
      toast.error("Failed to process image. Please try a different image.");
    }
  };

  // Reprocess logo when removeLogoBg changes
  const reprocessCurrentLogo = async () => {
    if (logoDataUrl && originalLogoFile) {
      try {
        const compressedDataUrl = await compressImage(originalLogoFile);
        setLogoDataUrl(compressedDataUrl);
      } catch (error) {
        console.error('Logo reprocessing failed:', error);
      }
    }
  };

  const compressImage = (file: File, maxWidth = 512, maxHeight = 512, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Clear canvas with transparent background
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          
          // Draw image
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        // Determine output format based on input file type and removeLogoBg setting
        const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
        const shouldPreserveTransparency = isPng || removeLogoBg;
        
        let compressedDataUrl: string;
        
        if (shouldPreserveTransparency) {
          // Use PNG format to preserve transparency
          compressedDataUrl = canvas.toDataURL('image/png');
        } else {
          // Use JPEG format for better compression
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        // Check if compressed size is still reasonable
        const compressedSize = compressedDataUrl.length * 0.75; // Approximate size
        if (compressedSize > 1024 * 1024) { // 1MB limit
          if (shouldPreserveTransparency) {
            // For PNG, try to reduce size by using a smaller resolution
            const smallerCanvas = document.createElement('canvas');
            const smallerCtx = smallerCanvas.getContext('2d');
            const smallerWidth = Math.floor(width * 0.7);
            const smallerHeight = Math.floor(height * 0.7);
            
            smallerCanvas.width = smallerWidth;
            smallerCanvas.height = smallerHeight;
            
            if (smallerCtx) {
              smallerCtx.clearRect(0, 0, smallerWidth, smallerHeight);
              smallerCtx.drawImage(img, 0, 0, smallerWidth, smallerHeight);
              resolve(smallerCanvas.toDataURL('image/png'));
            } else {
              resolve(compressedDataUrl);
            }
          } else {
            // Try with lower quality for JPEG
            const lowerQualityDataUrl = canvas.toDataURL('image/jpeg', 0.5);
            resolve(lowerQualityDataUrl);
          }
        } else {
          resolve(compressedDataUrl);
        }
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  return (
    <div className="bg-card rounded-2xl border shadow-sm">
      <div className="p-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Create QR Code</h3>
              <p className="text-muted-foreground">
                Generate a custom QR code with your branding and style preferences.
              </p>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Label</label>
                <Input 
                  placeholder="My awesome QR code" 
                  value={label} 
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Destination</label>
                <Input 
                  placeholder="https://example.com, phone:+1234567890, text, etc." 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a URL, phone number, text, or any content for your QR code
                </p>
              </div>

              {/* Folder Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Folder</label>
                <FolderSelector
                  value={selectedFolderId}
                  onChange={setSelectedFolderId}
                  required={true}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Select a folder to organize your QR code. You can create a new folder if needed.
                </p>
              </div>

              {/* Lead Collection Option */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="collectLeads"
                  checked={collectLeads}
                  onChange={(e) => setCollectLeads(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                />
                <label htmlFor="collectLeads" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Collect leads before redirecting
                </label>
              </div>
              {collectLeads && (
                <div className="ml-6 space-y-4">
                  <div className="p-3 rounded-lg bg-muted/30 border border-muted">
                    <p className="text-xs text-muted-foreground">
                      When enabled, users will see a lead collection form before being redirected to your destination URL.
                      This helps you capture contact information from QR code scans.
                    </p>
                  </div>
                  
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Lead Form Template</label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="">Default Template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose a custom template or use the default form design.{" "}
                      <a 
                        href="/lead-templates" 
                        target="_blank" 
                        className="text-primary hover:underline"
                      >
                        Create templates →
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Logo (Optional)</label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : logoDataUrl
                    ? 'border-success bg-success/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  aria-label="Upload logo image"
                  title="Upload logo image"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    processImageFile(file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  {logoDataUrl ? (
                    <div className="flex items-center justify-center gap-4">
                      <img src={logoDataUrl} alt="Logo preview" className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-medium">Logo uploaded successfully</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.preventDefault();
                            setLogoDataUrl(null);
                            setOriginalLogoFile(null);
                          }}
                          className="mt-2"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="w-10 h-10 mx-auto mb-2 text-muted-foreground">📁</div>
                      <p className="text-sm font-medium">Drop your logo here or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Logo Settings */}
            {logoDataUrl && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Logo Size: {logoSize}%</label>
                    <input 
                      type="range" 
                      min={10} 
                      max={60} 
                      value={logoSize} 
                      onChange={(e) => setLogoSize(parseInt(e.target.value))}
                      aria-label={`Logo size: ${logoSize}%`}
                      title={`Logo size: ${logoSize}%`}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                    <select 
                      value={logoAspect} 
                      onChange={(e) => setLogoAspect(e.target.value as any)}
                      aria-label="Logo aspect ratio"
                      title="Logo aspect ratio"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="1:1">Square (1:1)</option>
                      <option value="16:9">Wide (16:9)</option>
                      <option value="3:4">Tall (3:4)</option>
                    </select>
                  </div>
                </div>
                
                {/* Remove Logo Background Option */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="removeLogoBg"
                    checked={removeLogoBg}
                    onChange={(e) => setRemoveLogoBg(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <label htmlFor="removeLogoBg" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Remove logo background
                  </label>
                </div>
                {removeLogoBg && (
                  <div className="ml-6 p-3 rounded-lg bg-muted/30 border border-muted">
                    <p className="text-xs text-muted-foreground">
                      This will make the logo background transparent and remove the white background dots behind it for a cleaner look.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* QR Size Setting */}
            <div>
              <label className="block text-sm font-medium mb-2">QR Code Size: {qrSize}px</label>
              <input 
                type="range" 
                min={128} 
                max={2000} 
                step={64}
                value={qrSize} 
                onChange={(e) => setQrSize(parseInt(e.target.value))}
                aria-label={`QR code size: ${qrSize}px`}
                title={`QR code size: ${qrSize}px`}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Small (128px)</span>
                <span>Medium (1000px)</span>
                <span>Highest (2000px)</span>
              </div>
            </div>

            {/* Style Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Foreground Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={fgColor} 
                    onChange={(e) => setFgColor(e.target.value)}
                    aria-label="Foreground color picker"
                    title="Foreground color picker"
                    className="w-12 h-10 rounded border border-border"
                  />
                  <Input 
                    value={fgColor} 
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)}
                    aria-label="Background color picker"
                    title="Background color picker"
                    className="w-12 h-10 rounded border border-border"
                  />
                  <Input 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Style</label>
                <select 
                  value={styleType} 
                  onChange={(e) => setStyleType(e.target.value as any)}
                  aria-label="QR code style"
                  title="QR code style"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="square">Square</option>
                  <option value="rounded">Rounded</option>
                  <option value="dots">Dots</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Corner Radius: {cornerRadius}px</label>
                <input 
                  type="range" 
                  min={0} 
                  max={20} 
                  value={cornerRadius} 
                  onChange={(e) => setCornerRadius(parseInt(e.target.value))}
                  aria-label={`Corner radius: ${cornerRadius}px`}
                  title={`Corner radius: ${cornerRadius}px`}
                  className="w-full"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button 
              onClick={create} 
              disabled={creating || !label.trim() || !destination.trim() || !selectedFolderId}
              size="lg"
              className="w-full"
            >
              {creating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">⏳</div>
                  Creating...
                </div>
              ) : (
                "Create QR Code"
              )}
            </Button>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-muted/30 rounded-xl p-6 border">
              <h4 className="text-lg font-semibold mb-4">Live Preview</h4>
              <div className="bg-background rounded-lg p-6 shadow-sm border">
                {previewUrl ? (
                  <div className="text-center">
                    <img 
                      src={previewUrl} 
                      alt="QR Code Preview" 
                      className="mx-auto rounded-lg shadow-sm"
                      style={{ 
                        width: Math.min(qrSize, 320), 
                        height: Math.min(qrSize, 320),
                        maxWidth: '100%'
                      }}
                    />
                    <div className="mt-4 space-y-2">
                      <p className="font-medium">{label || "QR Code"}</p>
                      <p className="text-sm text-muted-foreground break-all">{destination}</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="mx-auto bg-muted/50 rounded-lg flex items-center justify-center"
                    style={{ 
                      width: Math.min(qrSize, 320), 
                      height: Math.min(qrSize, 320),
                      maxWidth: '100%'
                    }}
                  >
                    <div className="text-center text-muted-foreground">
                      <div className="text-4xl mb-2">📱</div>
                      <p className="text-sm">Enter content to see preview</p>
                    </div>
                  </div>
                )}
                
                {/* URL Metadata Display */}
                {(fetchingMetadata || urlMetadata) && (
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                    <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <span>🔗</span>
                      URL Preview
                      {fetchingMetadata && (
                        <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      )}
                    </h5>
                    
                    {urlMetadata && (
                      <div className="space-y-3">
                        {urlMetadata.favicon && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={urlMetadata.favicon} 
                              alt="Favicon" 
                              className="w-4 h-4"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {isValidUrl(destination) ? new URL(destination).hostname : destination}
                            </span>
                          </div>
                        )}
                        
                        {urlMetadata.title && (
                          <div>
                            <p className="font-medium text-sm">{urlMetadata.title}</p>
                          </div>
                        )}
                        
                        {urlMetadata.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {urlMetadata.description}
                          </p>
                        )}
                        
                        {urlMetadata.image && (
                          <div className="flex justify-center">
                            <img 
                              src={urlMetadata.image} 
                              alt="URL Preview" 
                              className="max-w-full h-20 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        {urlMetadata.title && !label && (
                          <button
                            type="button"
                            onClick={() => setLabel(urlMetadata.title!)}
                            className="text-xs text-primary hover:underline"
                          >
                            Use as QR label
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QrCard({
  qr,
  logoDataUrl,
  logoSizePct = 24,
  fgColor = "#000000",
  bgColor = "#ffffff",
  styleType = "square",
  cornerRadius = 8,
  logoAspect = "1:1",
}: {
  qr: QR;
  logoDataUrl?: string | null;
  logoSizePct?: number;
  fgColor?: string;
  bgColor?: string;
  styleType?: "square" | "rounded" | "dots";
  cornerRadius?: number;
  logoAspect?: "1:1" | "16:9" | "3:4";
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);
  const url = typeof window !== "undefined" ? `${window.location.origin}/api/scan/${qr.slug}` : "";
  useEffect(() => {
    (async () => {
      // Try advanced styling first; fallback to basic
      try {
        const { default: QRCodeStyling } = await import("qr-code-styling");
        const qr = new QRCodeStyling({
          width: 256,
          height: 256,
          data: url,
          image: logoDataUrl || undefined,
          imageOptions: {
            imageSize: logoDataUrl ? logoSizePct / 100 : 0,
            margin: 4,
            crossOrigin: "anonymous",
          },
          backgroundOptions: { color: bgColor },
          dotsOptions: {
            color: fgColor,
            type: styleType === "square" ? "square" : styleType,
          } as any,
          cornersSquareOptions: { type: "extra-rounded", color: fgColor } as any,
          cornersDotOptions: { color: fgColor } as any,
        });
        const blob = (await qr.getRawData("png")) as Blob;
        const dataUrl = await blobToDataURL(blob);
        setDataUrl(dataUrl);
        return;
      } catch {
        const png = await QRCode.toDataURL(url, { margin: 1, width: 256, color: { dark: fgColor, light: bgColor } });
        setDataUrl(png);
      }
    })();
  }, [url, logoDataUrl, logoSizePct, fgColor, bgColor, styleType, cornerRadius]);
  useEffect(() => {
    if (!dataUrl) return;
    if (!logoDataUrl) {
      setCompositeUrl(dataUrl);
      return;
    }
    composeWithLogo(dataUrl, logoDataUrl, logoSizePct / 100, cornerRadius).then(setCompositeUrl).catch(() => setCompositeUrl(dataUrl));
  }, [dataUrl, logoDataUrl, logoSizePct, cornerRadius]);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{qr.label}</div>
            <div className="text-xs text-gray-500 break-all">{qr.destination}</div>
          </div>
          <a href={url} className="text-xs text-blue-700 underline" target="_blank">Open</a>
        </div>
      </CardHeader>
      <CardContent>
        {compositeUrl && (
          <img src={compositeUrl} alt={qr.label} className="w-full h-auto rounded" />
        )}
        <div className="text-xs text-gray-600 break-all mt-2">{url}</div>
        {compositeUrl && (
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(url).then(() => toast.success("Link copied"))}>Copy link</Button>
            <Button variant="secondary" size="sm" onClick={() => downloadDataUrl(compositeUrl, `${qr.slug}.png`)}>Download PNG</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function composeWithLogo(qrPng: string, logoPng: string, ratio: number, radiusPct = 8, aspect: "1:1" | "16:9" | "3:4" = "1:1") {
  const qrImg = await loadImage(qrPng);
  const logoImg = await loadImage(logoPng);
  const size = Math.max(qrImg.width, qrImg.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(qrImg, 0, 0, size, size);

  const logoMax = Math.floor(size * ratio);
  // derive width/height from aspect
  let w = logoMax;
  let h = logoMax;
  if (aspect === "16:9") {
    w = logoMax;
    h = Math.floor((logoMax * 9) / 16);
  } else if (aspect === "3:4") {
    w = Math.floor((logoMax * 3) / 4);
    h = logoMax;
  }
  const x = Math.floor((size - w) / 2);
  const y = Math.floor((size - h) / 2);

  // draw white rounded background for contrast
  const radius = Math.floor(Math.min(w, h) * (radiusPct / 100));
  roundRect(ctx, x - 6, y - 6, w + 12, h + 12, radius);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.drawImage(logoImg, x, y, w, h);
  return canvas.toDataURL("image/png");
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function blobToDataURL(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}


