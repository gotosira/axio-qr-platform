"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import DeleteQrButton from "@/components/DeleteQrButton";
import DownloadQrDropdown from "@/components/DownloadQrDropdown";
import QRCodeMover from "@/components/QRCodeMover";
import FolderManager from "@/components/FolderManager";
import Modal, { ModalHeader, ModalContent, ModalFooter } from "@/components/ui/Modal";
import ColorPicker from "@/components/ui/ColorPicker";
import { toast } from "sonner";
import QRCodeStyling from "qr-code-styling";
import { X, Download, FolderOpen, Grid, List, Filter, ChevronLeft, ChevronRight, FolderPlus } from "lucide-react";
import { FOLDER_ICONS, FolderIconType } from "@/components/ui/FolderIcons";

const BULK_DOWNLOAD_SIZES = [
  { label: "Small (256px)", value: 256 },
  { label: "Medium (512px)", value: 512 },
  { label: "Large (1024px)", value: 1024 },
  { label: "Extra Large (1536px)", value: 1536 },
  { label: "Highest (2000px)", value: 2000 },
];

const PRESET_ICON_KEYS: FolderIconType[] = [
  "folder", "folderOpen", "target", "rocket", "star", "fire", 
  "diamond", "palette", "chart", "heart", "shopping", "building", 
  "book", "tool", "globe"
];

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
  folderId?: string | null;
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
  const [showBulkExportModal, setShowBulkExportModal] = useState(false);
  const [bulkExportProgress, setBulkExportProgress] = useState(0);
  const [isBulkExporting, setIsBulkExporting] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [manuallyToggled, setManuallyToggled] = useState(false);
  const [folders, setFolders] = useState<Array<{id: string, name: string, icon: string, color: string}>>([]);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [folderFormData, setFolderFormData] = useState({
    name: "",
    description: "",
    icon: "folder" as FolderIconType,
    color: "#3b82f6"
  });

  useEffect(() => {
    setShowBulkActions(selectedQrs.size > 0);
  }, [selectedQrs]);

  const filteredAndSortedQrs = qrs
    .filter(qr => {
      // Filter by search term
      const matchesSearch = qr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qr.destination.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by folder
      const matchesFolder = selectedFolderId === null 
        ? true // Show all QR codes when "All QR Codes" is selected
        : qr.folderId === selectedFolderId;
      
      if (selectedFolderId) {
        console.log(`QR ${qr.label}: folderId=${qr.folderId}, selectedFolderId=${selectedFolderId}, matchesFolder=${matchesFolder}`);
      }
      
      return matchesSearch && matchesFolder;
    })
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

  const handleFolderSelect = (folderId: string | null) => {
    console.log("Folder selected:", folderId);
    console.log("Available QRs:", qrs.map(qr => ({ label: qr.label, folderId: qr.folderId })));
    setSelectedFolderId(folderId);
    setSelectedQrs(new Set()); // Clear selection when changing folders
  };

  const refreshQRCodes = async () => {
    try {
      const response = await fetch("/api/qrcodes");
      if (response.ok) {
        const data = await response.json();
        setQrs(data);
        setSelectedQrs(new Set());
      }
    } catch (error) {
      console.error("Failed to refresh QR codes:", error);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    }
  };

  const handleFolderCreated = () => {
    fetchFolders(); // Refresh the folder list
    setShowCreateFolderModal(false);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderFormData.name.trim()) {
      toast.error("Folder name is required");
      return;
    }

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(folderFormData)
      });

      if (response.ok) {
        await fetchFolders();
        setShowCreateFolderModal(false);
        setFolderFormData({
          name: "",
          description: "",
          icon: "folder",
          color: "#3b82f6"
        });
        toast.success("Folder created successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create folder");
      }
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      const prevMobile = isMobile;
      setIsMobile(mobile);
      
      // Only auto-adjust on initial load or when switching between mobile/desktop
      if (prevMobile !== mobile && !manuallyToggled) {
        if (mobile) {
          // Auto-collapse sidebar on mobile/tablet (initial load only)
          setIsSidebarCollapsed(true);
        } else {
          // Auto-expand sidebar when returning to desktop view
          setIsSidebarCollapsed(false);
        }
      }
      
      // Reset manual toggle flag when switching to desktop
      if (!mobile && prevMobile !== mobile) {
        setManuallyToggled(false);
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, manuallyToggled]);

  const handleDropQR = async (qrId: string, folderId: string | null) => {
    try {
      const response = await fetch(`/api/qrcodes/${qrId}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId })
      });

      if (response.ok) {
        await refreshQRCodes();
        await fetchFolders(); // Refresh folder counts too
        const folderName = folderId 
          ? folders.find(f => f.id === folderId)?.name || "folder"
          : "Uncategorized";
        toast.success(`QR code moved to ${folderName}`);
      } else {
        toast.error("Failed to move QR code");
      }
    } catch (error) {
      console.error("Failed to move QR code:", error);
      toast.error("Failed to move QR code");
    }
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
    setShowBulkExportModal(true);
  };

  const processBulkExport = async (targetSize: number) => {
    setIsBulkExporting(true);
    setBulkExportProgress(0);
    
    const selectedQrList = Array.from(selectedQrs).map(id => qrs.find(q => q.id === id)).filter(Boolean) as QR[];
    const totalQrs = selectedQrList.length;
    
    try {
      for (let i = 0; i < selectedQrList.length; i++) {
        const qr = selectedQrList[i];
        await generateAndDownloadQr(qr, targetSize);
        setBulkExportProgress(((i + 1) / totalQrs) * 100);
        
        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success(`Successfully exported ${totalQrs} QR code(s)`);
      setShowBulkExportModal(false);
      setSelectedQrs(new Set());
    } catch (error) {
      console.error("Bulk export failed:", error);
      toast.error("Failed to export some QR codes");
    } finally {
      setIsBulkExporting(false);
      setBulkExportProgress(0);
    }
  };

  const generateAndDownloadQr = async (qr: QR, targetSize: number) => {
    const url = `${window.location.origin}/api/scan/${qr.slug}`;
    let dataUrl: string;

    // Try advanced QR generation if we have custom styling
    if (qr.logoUrl || qr.styleType !== "square" || (qr.cornerRadius && qr.cornerRadius > 0)) {
      try {
        dataUrl = await generateAdvancedQr(qr, url, targetSize);
      } catch (advancedError) {
        console.warn("Advanced QR generation failed, falling back to basic:", advancedError);
        dataUrl = await generateBasicQr(url, targetSize);
      }
    } else {
      dataUrl = await generateBasicQr(url, targetSize);
    }

    // Download the generated QR code
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${qr.label || qr.slug}_${targetSize}px.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const generateAdvancedQr = async (qr: QR, url: string, targetSize: number): Promise<string> => {
    const qrOptions: any = {
      width: targetSize,
      height: targetSize,
      data: url,
      margin: Math.max(4, Math.floor(targetSize * 0.02)),
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "M"
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: (qr.logoSizePct || 20) / 100,
        crossOrigin: "anonymous",
        margin: 4,
      },
      backgroundOptions: {
        color: qr.bgColor || "#ffffff",
      },
      dotsOptions: {
        color: qr.fgColor || "#000000",
        type: qr.styleType === "square" ? "square" : qr.styleType,
      } as any,
      cornersSquareOptions: {
        type: "extra-rounded",
        color: qr.fgColor || "#000000"
      } as any,
      cornersDotOptions: {
        color: qr.fgColor || "#000000"
      } as any,
    };

    if (qr.logoUrl) {
      qrOptions.image = qr.logoUrl;
    }

    const qrCode = new QRCodeStyling(qrOptions);
    const blob = await qrCode.getRawData("png") as Blob;
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generateBasicQr = async (url: string, targetSize: number): Promise<string> => {
    const qrCode = new QRCodeStyling({
      width: targetSize,
      height: targetSize,
      data: url,
      margin: Math.max(4, Math.floor(targetSize * 0.02)),
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "M"
      },
      backgroundOptions: { color: "#ffffff" },
      dotsOptions: { color: "#000000", type: "square" },
      cornersSquareOptions: { type: "square", color: "#000000" },
      cornersDotOptions: { color: "#000000" },
    });

    const blob = await qrCode.getRawData("png") as Blob;
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Mobile Overlay Background */}
      {isMobile && !isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => {
            setIsSidebarCollapsed(true);
            setManuallyToggled(true);
          }}
        />
      )}

      {/* Responsive Sidebar */}
      <div className={`${
        isMobile 
          ? isSidebarCollapsed 
            ? 'hidden' 
            : 'fixed left-0 top-0 h-full w-80 z-50'
          : isSidebarCollapsed 
            ? 'w-16' 
            : 'w-80 lg:w-80 md:w-64 sm:w-56'
      } ${
        isMobile ? '' : 'flex-shrink-0'
      } border-r border-border bg-card transition-all duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!isSidebarCollapsed && (
              <h2 className="font-semibold text-lg">Folders</h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2"
            >
              {isSidebarCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </Button>
          </div>
          
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {isSidebarCollapsed ? (
              <div className="p-2 space-y-2">
                {/* All QR Codes button */}
                <Button
                  variant={selectedFolderId === null ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full p-2 h-10 flex items-center justify-center"
                  onClick={() => handleFolderSelect(null)}
                  title="All QR Codes"
                >
                  <Grid size={18} />
                </Button>
                {/* Collapsed folder icons */}
                <FolderManager
                  onFolderSelect={handleFolderSelect}
                  selectedFolderId={selectedFolderId}
                  showCreateButton={false}
                  onDropQR={handleDropQR}
                  isCollapsed={true}
                />
              </div>
            ) : (
              <div className="p-4">
                <FolderManager
                  onFolderSelect={handleFolderSelect}
                  selectedFolderId={selectedFolderId}
                  showCreateButton={false}
                  onDropQR={handleDropQR}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Responsive Top Bar */}
        <div className="bg-background border-b border-border py-3 lg:py-4">
          <div className="flex flex-col gap-3 lg:gap-4 px-4 lg:px-6">
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Mobile Sidebar Toggle */}
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsSidebarCollapsed(!isSidebarCollapsed);
                      setManuallyToggled(true);
                    }}
                    className="p-2 lg:hidden"
                  >
                    <ChevronRight 
                      size={18} 
                      className={`transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} 
                    />
                  </Button>
                )}
                <div>
                  <h1 className="text-xl lg:text-3xl font-bold">My QR Codes</h1>
                  {selectedFolderId && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground text-sm lg:text-lg">
                        {folders.find(f => f.id === selectedFolderId)?.name || 'Unknown Folder'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stats and Actions Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-muted-foreground text-sm lg:text-base">
                Manage and track your QR codes ({filteredAndSortedQrs.length} showing, {qrs.length} total)
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline"
                  onClick={() => setShowCreateFolderModal(true)}
                  size={isMobile ? "sm" : "lg"}
                  className="w-full sm:w-auto"
                >
                  <FolderPlus size={16} className="mr-2" />
                  <span className="hidden sm:inline">New Folder</span>
                  <span className="sm:hidden">Folder</span>
                </Button>
                <Button 
                  onClick={() => window.location.href = "/"}
                  size={isMobile ? "sm" : "lg"}
                  className="w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">Create New QR Code</span>
                  <span className="sm:hidden">New QR</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 lg:px-6 py-4 lg:py-6">
            <div className="space-y-4 lg:space-y-6">

      {/* Search and Filters */}
      <div className="bg-card rounded-xl border p-4 lg:p-6">
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
                  onClick={() => setShowMoveModal(true)}
                >
                  <FolderOpen size={16} className="mr-1" />
                  Move to Folder
                </Button>
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
          ? "grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "space-y-3"
        }>
          {filteredAndSortedQrs.map((qr) => (
            <QrCodeCard
              key={qr.id}
              qr={qr}
              isSelected={selectedQrs.has(qr.id)}
              onSelect={() => handleSelectQr(qr.id)}
              viewMode={viewMode}
              folders={folders}
              onDelete={() => {
                setQrs(qrs.filter(q => q.id !== qr.id));
                setSelectedQrs(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(qr.id);
                  return newSet;
                });
              }}
              onDragStart={(qrId) => {
                // Optional: Store dragged QR ID if needed for UI feedback
                console.log("Dragging QR:", qrId);
              }}
            />
          ))}
        </div>
      )}

      {/* Bulk Export Modal */}
      {showBulkExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 border shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Bulk Export QR Codes</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBulkExportModal(false)}
                disabled={isBulkExporting}
              >
                <X size={20} />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Export {selectedQrs.size} selected QR code(s) at your chosen size:
            </p>
            
            {isBulkExporting ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin text-lg">⏳</div>
                  <span className="text-sm">Exporting QR codes...</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${bulkExportProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round(bulkExportProgress)}% complete
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {BULK_DOWNLOAD_SIZES.map((size) => (
                  <Button
                    key={size.value}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => processBulkExport(size.value)}
                  >
                    <span>{size.label}</span>
                    <Download size={16} />
                  </Button>
                ))}
              </div>
            )}
            
            {!isBulkExporting && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowBulkExportModal(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

          {/* QR Code Mover Modal */}
          <QRCodeMover
            isOpen={showMoveModal}
            onClose={() => setShowMoveModal(false)}
            qrCodes={Array.from(selectedQrs).map(id => {
              const qr = qrs.find(q => q.id === id);
              return { id, label: qr?.label || 'Unknown' };
            }).filter(qr => qr)}
            currentFolderId={selectedFolderId}
            onSuccess={() => {
              refreshQRCodes();
              setSelectedQrs(new Set());
              toast.success("QR codes moved successfully");
            }}
          />

          {/* Create Folder Modal */}
          <Modal
            open={showCreateFolderModal}
            onClose={() => setShowCreateFolderModal(false)}
          >
            <ModalHeader>
              <h2 className="text-lg font-semibold">Create New Folder</h2>
            </ModalHeader>
            
            <ModalContent>
              <form id="create-folder-form" onSubmit={handleCreateFolder} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Folder Name *
                  </label>
                  <Input
                    value={folderFormData.name}
                    onChange={(e) => setFolderFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter folder name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Input
                    value={folderFormData.description}
                    onChange={(e) => setFolderFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-5 gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
                    {PRESET_ICON_KEYS.map((iconKey) => {
                      const IconComponent = FOLDER_ICONS[iconKey];
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => setFolderFormData(prev => ({ ...prev, icon: iconKey }))}
                          className={`w-10 h-10 flex items-center justify-center rounded border transition-colors ${
                            folderFormData.icon === iconKey 
                              ? "border-primary bg-primary/10" 
                              : "border-border hover:bg-muted"
                          }`}
                          title={iconKey}
                        >
                          <IconComponent size={20} className="text-foreground" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Color
                  </label>
                  <ColorPicker
                    value={folderFormData.color}
                    onChange={(color) => setFolderFormData(prev => ({ ...prev, color }))}
                    className="w-full"
                  />
                </div>
              </form>
            </ModalContent>
            
            <ModalFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowCreateFolderModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                form="create-folder-form"
              >
                Create Folder
              </Button>
            </ModalFooter>
          </Modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QrCodeCard({ 
  qr, 
  isSelected, 
  onSelect, 
  viewMode,
  onDelete,
  onDragStart,
  folders
}: { 
  qr: QR; 
  isSelected: boolean; 
  onSelect: () => void; 
  viewMode: "grid" | "list";
  onDelete: () => void;
  onDragStart?: (qrId: string) => void;
  folders: Array<{id: string, name: string, icon: string, color: string}>;
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


  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", qr.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.(qr.id);
    
    // Add visual feedback during drag
    if (e.currentTarget) {
      (e.currentTarget as HTMLElement).style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset visual feedback
    if (e.currentTarget) {
      (e.currentTarget as HTMLElement).style.opacity = "1";
    }
  };

  if (viewMode === "list") {
    return (
      <Card 
        className="animate-slide-up cursor-move"
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <CardContent className="p-3 lg:p-6">
          <div className="flex items-center gap-2 lg:gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="rounded mr-3"
              />
            </label>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
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
              <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-2 text-xs text-muted-foreground">
                <span className="hidden sm:inline">Created: {formatDate(qr.createdAt)}</span>
                <span>Scans: {qr._count?.scans || 0}</span>
                {qr.folderId && (
                  <div className="flex items-center gap-1">
                    {(() => {
                      const folder = folders.find(f => f.id === qr.folderId);
                      const IconComponent = folder?.icon ? FOLDER_ICONS[folder.icon as keyof typeof FOLDER_ICONS] || FOLDER_ICONS.folder : FOLDER_ICONS.folder;
                      return <IconComponent size={12} className="text-muted-foreground" />;
                    })()}
                    <span>{folders.find(f => f.id === qr.folderId)?.name || 'Unknown Folder'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
              <DownloadQrDropdown qr={qr} size="sm" />
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
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
    <Card 
      className="group hover:shadow-lg transition-all duration-200 animate-slide-up cursor-move"
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardHeader className="relative">
        <label className="absolute top-2 left-2 lg:top-4 lg:left-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded"
          />
        </label>
        <div className="text-center py-2 lg:py-4">
          <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto bg-muted rounded-lg flex items-center justify-center mb-3 lg:mb-4 overflow-hidden">
            {isGenerating ? (
              <div className="animate-spin text-2xl">⏳</div>
            ) : qrImageUrl ? (
              <img src={qrImageUrl} alt={qr.label} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">📱</span>
            )}
          </div>
          <h3 className="font-semibold truncate text-sm lg:text-base">{qr.label}</h3>
          <p className="text-xs lg:text-sm text-muted-foreground truncate mt-1">{qr.destination}</p>
          {qr.folderId && (
            <div className="flex items-center gap-1 mt-2">
              {(() => {
                const folder = folders.find(f => f.id === qr.folderId);
                const IconComponent = folder?.icon ? FOLDER_ICONS[folder.icon as keyof typeof FOLDER_ICONS] || FOLDER_ICONS.folder : FOLDER_ICONS.folder;
                return <IconComponent size={12} className="text-muted-foreground" />;
              })()}
              <span className="text-xs text-muted-foreground truncate">
                {folders.find(f => f.id === qr.folderId)?.name || 'Unknown Folder'}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3 lg:space-y-4 p-3 lg:p-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="hidden sm:inline">{formatDate(qr.createdAt)}</span>
          <span className="sm:hidden">Scans</span>
          <span>{qr._count?.scans || 0}</span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch gap-1 lg:gap-2">
          <DownloadQrDropdown qr={qr} size="sm" className="flex-1" />
          <Button variant="outline" size="sm" className="flex-1 sm:flex-shrink-0" asChild>
            <a href={`/api/scan/${qr.slug}`} target="_blank">
              <span className="sm:hidden">Open</span>
              <span className="hidden sm:inline">Open</span>
            </a>
          </Button>
          <DeleteQrButton id={qr.id} onSuccess={onDelete} />
        </div>
      </CardContent>
    </Card>
  );
}