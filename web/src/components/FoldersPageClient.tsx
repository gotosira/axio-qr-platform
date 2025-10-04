"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import FolderManager from "@/components/FolderManager";
import QRCodeMover from "@/components/QRCodeMover";
import { 
  Search,
  QrCode,
  ExternalLink,
  FolderOpen,
  MoreVertical,
  Move,
  Eye
} from "lucide-react";
import Link from "next/link";

interface QRCode {
  id: string;
  label: string;
  slug: string;
  destination: string;
  createdAt: string;
  folderId?: string;
  _count: {
    scans: number;
  };
}

interface Folder {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  qrcodes: QRCode[];
  _count: {
    qrcodes: number;
  };
}

export default function FoldersPageClient() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderData, setFolderData] = useState<Folder | null>(null);
  const [allQRCodes, setAllQRCodes] = useState<QRCode[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedQRs, setSelectedQRs] = useState<Set<string>>(new Set());
  const [showMoveModal, setShowMoveModal] = useState(false);

  useEffect(() => {
    if (selectedFolderId) {
      fetchFolderData(selectedFolderId);
    } else {
      fetchAllQRCodes();
    }
  }, [selectedFolderId]);

  const fetchFolderData = async (folderId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/folders/${folderId}`);
      if (response.ok) {
        const data = await response.json();
        setFolderData(data);
      } else {
        toast.error("Failed to fetch folder data");
      }
    } catch (error) {
      toast.error("Failed to fetch folder data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllQRCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/qrcodes");
      if (response.ok) {
        const data = await response.json();
        setAllQRCodes(data.filter((qr: QRCode) => !qr.folderId));
        setFolderData(null);
      } else {
        toast.error("Failed to fetch QR codes");
      }
    } catch (error) {
      toast.error("Failed to fetch QR codes");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    if (selectedFolderId) {
      fetchFolderData(selectedFolderId);
    } else {
      fetchAllQRCodes();
    }
    setSelectedQRs(new Set());
  };

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    setSelectedQRs(new Set());
    setSearchTerm("");
  };

  const handleQRSelection = (qrId: string, checked: boolean) => {
    setSelectedQRs(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(qrId);
      } else {
        newSet.delete(qrId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const visibleQRs = getCurrentQRCodes().map(qr => qr.id);
      setSelectedQRs(new Set(visibleQRs));
    } else {
      setSelectedQRs(new Set());
    }
  };

  const getCurrentQRCodes = () => {
    const qrCodes = folderData ? folderData.qrcodes : allQRCodes;
    return qrCodes.filter(qr => 
      qr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getSelectedQRCodes = () => {
    const currentQRs = getCurrentQRCodes();
    return currentQRs.filter(qr => selectedQRs.has(qr.id));
  };

  const currentQRs = getCurrentQRCodes();
  const selectedQRCodes = getSelectedQRCodes();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Folder Manager */}
        <div className="lg:w-80">
          <FolderManager
            onFolderSelect={handleFolderSelect}
            selectedFolderId={selectedFolderId}
            showCreateButton={true}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    {folderData ? (
                      <>
                        <span 
                          className="w-6 h-6 rounded flex items-center justify-center text-white text-sm"
                          style={{ backgroundColor: folderData.color }}
                        >
                          {folderData.icon}
                        </span>
                        {folderData.name}
                      </>
                    ) : (
                      <>
                        <QrCode size={20} />
                        All QR Codes
                      </>
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {folderData?.description || "Uncategorized QR codes"}
                    {" • "}
                    {currentQRs.length} QR code{currentQRs.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {selectedQRs.size > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowMoveModal(true)}
                      size="sm"
                    >
                      <Move size={16} className="mr-2" />
                      Move ({selectedQRs.size})
                    </Button>
                  )}
                  
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search QR codes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : currentQRs.length > 0 ? (
                <div className="space-y-4">
                  {/* Select All */}
                  <div className="flex items-center gap-3 pb-2 border-b">
                    <input
                      type="checkbox"
                      checked={selectedQRs.size === currentQRs.length && currentQRs.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedQRs.size > 0 
                        ? `${selectedQRs.size} of ${currentQRs.length} selected`
                        : "Select all"
                      }
                    </span>
                  </div>

                  {/* QR Code List */}
                  <div className="space-y-3">
                    {currentQRs.map((qr) => (
                      <div
                        key={qr.id}
                        className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                          selectedQRs.has(qr.id) 
                            ? "bg-primary/5 border-primary" 
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedQRs.has(qr.id)}
                          onChange={(e) => handleQRSelection(qr.id, e.target.checked)}
                          className="rounded"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                              <QrCode size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{qr.label}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {qr.destination}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span>/{qr.slug}</span>
                                <span>{qr._count?.scans || 0} scans</span>
                                <span>Created {formatDate(qr.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/analytics/${qr.id}`}>
                              <Eye size={16} />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={qr.destination} target="_blank">
                              <ExternalLink size={16} />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen size={64} className="mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? "No QR codes found" : "No QR codes in this folder"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? "Try adjusting your search terms"
                      : folderData 
                        ? "Move QR codes to this folder to organize them"
                        : "Create some QR codes to get started"
                    }
                  </p>
                  {!searchTerm && !folderData && (
                    <Button asChild>
                      <Link href="/">Create QR Code</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Move QR Codes Modal */}
      <QRCodeMover
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        qrCodes={selectedQRCodes}
        currentFolderId={selectedFolderId}
        onSuccess={refreshData}
      />
    </div>
  );
}