"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import DeleteQrButton from "@/components/DeleteQrButton";
import { toast } from "sonner";
import QRCodeStyling from "qr-code-styling";

type QR = {
  id: string;
  label: string;
  slug: string;
  destination: string;
  logoUrl?: string | null;
  fgColor?: string | null;
  bgColor?: string | null;
  styleType?: string | null;
  logoAspect?: string | null;
  cornerRadius?: number | null;
  logoSizePct?: number | null;
  createdAt: Date;
  _count?: { scans: number };
};

interface MyQrClientProps {
  initialQrs: QR[];
}

export default function MyQrClient({ initialQrs }: MyQrClientProps) {
  const [qrs, setQrs] = useState<QR[]>(initialQrs);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQrs, setSelectedQrs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "label" | "scans">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    setShowBulkActions(selectedQrs.size > 0);
  }, [selectedQrs]);

  const filteredAndSortedQrs = qrs
    .filter(qr => 
      qr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.destination.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "label":
          return a.label.localeCompare(b.label);
        case "scans":
          return (b._count?.scans || 0) - (a._count?.scans || 0);
        default:
          return 0;
      }
    });

  const handleSelectAll = () => {
    if (selectedQrs.size === filteredAndSortedQrs.length) {
      setSelectedQrs(new Set());
    } else {
      setSelectedQrs(new Set(filteredAndSortedQrs.map(qr => qr.id)));
    }
  };

  const handleSelectQr = (id: string) => {
    const newSelected = new Set(selectedQrs);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQrs(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedQrs.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedQrs.size} QR code(s)?`)) {
      try {
        const promises = Array.from(selectedQrs).map(id =>
          fetch(`/api/qrcodes?id=${id}`, { method: "DELETE" })
        );
        await Promise.all(promises);
        setQrs(qrs.filter(qr => !selectedQrs.has(qr.id)));
        setSelectedQrs(new Set());
        toast.success(`Deleted ${selectedQrs.size} QR code(s)`);
      } catch (error) {
        toast.error("Failed to delete QR codes");
      }
    }
  };

  const handleBulkExport = () => {
    selectedQrs.forEach(id => {
      const qr = qrs.find(q => q.id === id);
      if (qr) {
        window.open(`/api/scan/${qr.slug}`, '_blank');
      }
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My QR Codes</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your QR codes ({qrs.length} total)
          </p>
        </div>
        <Button 
          onClick={() => window.location.href = "/"}
          size="lg"
        >
          Create New QR Code
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by label or destination URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="label">By Label</option>
              <option value="scans">By Scans</option>
            </select>
            <div className="flex border border-border rounded-md overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-none border-0"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none border-0 border-l"
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {filteredAndSortedQrs.length > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedQrs.size === filteredAndSortedQrs.length && filteredAndSortedQrs.length > 0}
                onChange={handleSelectAll}
                className="rounded"
              />
              Select All ({selectedQrs.size} selected)
            </label>
            {showBulkActions && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                >
                  Bulk Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Codes Grid/List */}
      {filteredAndSortedQrs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? "No QR codes found" : "No QR codes yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? "Try adjusting your search criteria"
              : "Create your first QR code to get started"
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => window.location.href = "/"}>
              Create Your First QR Code
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "space-y-4"
        }>
          {filteredAndSortedQrs.map((qr) => (
            <QrCodeCard
              key={qr.id}
              qr={qr}
              isSelected={selectedQrs.has(qr.id)}
              onSelect={() => handleSelectQr(qr.id)}
              viewMode={viewMode}
              onDelete={() => {
                setQrs(qrs.filter(q => q.id !== qr.id));
                setSelectedQrs(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(qr.id);
                  return newSet;
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QrCodeCard({ 
  qr, 
  isSelected, 
  onSelect, 
  viewMode,
  onDelete 
}: { 
  qr: QR; 
  isSelected: boolean; 
  onSelect: () => void; 
  viewMode: "grid" | "list";
  onDelete: () => void;
}) {
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateQrImage();
  }, [qr]);

  async function generateQrImage() {
    setIsGenerating(true);
    try {
      const url = `${window.location.origin}/api/scan/${qr.slug}`;
      console.log("Generating QR for:", url, "with styles:", { 
        fg: qr.fgColor, 
        bg: qr.bgColor, 
        logo: qr.logoUrl, 
        style: qr.styleType,
        corner: qr.cornerRadius 
      });
      
      // Try advanced QR generation first if we have custom styling
      if (qr.logoUrl || qr.styleType !== "square" || (qr.cornerRadius && qr.cornerRadius > 0)) {
        try {
          await generateAdvancedQr(url);
          return;
        } catch (advancedError) {
          console.warn("Advanced QR generation failed, falling back to basic:", advancedError);
        }
      }
      
      // Fallback to basic QR generation
      await generateBasicQr(url);
      
    } catch (error) {
      console.error("QR generation failed for", qr.label, ":", error);
      setQrImageUrl(null);
    } finally {
      setIsGenerating(false);
    }
  }

  async function generateAdvancedQr(url: string) {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('Advanced QR generation requires browser environment');
    }

    const qrOptions: any = {
      width: 200,
      height: 200,
      data: url,
      margin: 4,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "M"
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: (qr.logoSizePct || 20) / 100,
        crossOrigin: "anonymous",
        margin: 0,
      },
      dotsOptions: {
        color: qr.fgColor || "#000000",
        type: getDotsType(qr.styleType)
      },
      backgroundOptions: {
        color: qr.bgColor || "#ffffff",
      },
      cornersSquareOptions: {
        color: qr.fgColor || "#000000",
        type: getCornersType(qr.cornerRadius)
      },
      cornersDotOptions: {
        color: qr.fgColor || "#000000",
        type: getCornerDotsType(qr.cornerRadius)
      }
    };

    // Add logo if specified
    if (qr.logoUrl) {
      qrOptions.image = qr.logoUrl;
    }

    console.log("QR Options:", qrOptions);
    const qrCode = new QRCodeStyling(qrOptions);
    
    return new Promise<void>((resolve, reject) => {
      try {
        // Create container element
        const container = document.createElement('div');
        container.style.width = '200px';
        container.style.height = '200px';
        
        // Append QR code to container
        qrCode.append(container);
        
        // Wait for rendering to complete
        setTimeout(() => {
          try {
            const canvas = container.querySelector('canvas');
            if (canvas) {
              const dataUrl = canvas.toDataURL('image/png');
              console.log("Advanced QR generated successfully for:", qr.label);
              setQrImageUrl(dataUrl);
              resolve();
            } else {
              throw new Error('Canvas not found after QR generation');
            }
          } catch (error) {
            reject(error);
          }
        }, 300); // Increased timeout for logo loading
        
      } catch (error) {
        reject(error);
      }
    });
  }

  async function generateBasicQr(url: string) {
    const QRCode = await import("qrcode");
    const png = await QRCode.toDataURL(url, { 
      margin: 1, 
      width: 200,
      color: { 
        dark: qr.fgColor || "#000000", 
        light: qr.bgColor || "#ffffff" 
      } 
    });
    console.log("Basic QR generated successfully for:", qr.label);
    setQrImageUrl(png);
  }

  function getDotsType(styleType: string | null | undefined): string {
    switch (styleType) {
      case "dots": return "dots";
      case "classy": return "classy";
      case "classy-rounded": return "classy-rounded";
      case "extra-rounded": return "extra-rounded";
      default: return "square";
    }
  }

  function getCornersType(cornerRadius: number | null | undefined): string {
    return cornerRadius && cornerRadius > 0 ? "extra-rounded" : "square";
  }

  function getCornerDotsType(cornerRadius: number | null | undefined): string {
    return cornerRadius && cornerRadius > 0 ? "dot" : "square";
  }

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const downloadQr = () => {
    if (qrImageUrl) {
      const a = document.createElement("a");
      a.href = qrImageUrl;
      a.download = `${qr.label || qr.slug}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  if (viewMode === "list") {
    return (
      <Card className="animate-slide-up">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="rounded mr-3"
              />
            </label>
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {isGenerating ? (
                <div className="animate-spin text-lg">⏳</div>
              ) : qrImageUrl ? (
                <img src={qrImageUrl} alt={qr.label} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">📱</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{qr.label}</h3>
              <p className="text-sm text-muted-foreground truncate">{qr.destination}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>Created: {formatDate(qr.createdAt)}</span>
                <span>Scans: {qr._count?.scans || 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={downloadQr}>
                Download
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/scan/${qr.slug}`} target="_blank">
                  Open
                </a>
              </Button>
              <DeleteQrButton id={qr.id} onSuccess={onDelete} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 animate-slide-up">
      <CardHeader className="relative">
        <label className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded"
          />
        </label>
        <div className="text-center py-4">
          <div className="w-32 h-32 mx-auto bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden">
            {isGenerating ? (
              <div className="animate-spin text-2xl">⏳</div>
            ) : qrImageUrl ? (
              <img src={qrImageUrl} alt={qr.label} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">📱</span>
            )}
          </div>
          <h3 className="font-semibold truncate">{qr.label}</h3>
          <p className="text-sm text-muted-foreground truncate mt-1">{qr.destination}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>{formatDate(qr.createdAt)}</span>
          <span>{qr._count?.scans || 0} scans</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadQr} className="flex-1">
            Download
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/scan/${qr.slug}`} target="_blank">
              Open
            </a>
          </Button>
          <DeleteQrButton id={qr.id} onSuccess={onDelete} />
        </div>
      </CardContent>
    </Card>
  );
}