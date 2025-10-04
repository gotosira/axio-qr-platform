"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Modal, { ModalHeader, ModalContent, ModalFooter } from "@/components/ui/Modal";
import { toast } from "sonner";
import { FolderOpen, QrCode } from "lucide-react";

interface Folder {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  _count: {
    qrcodes: number;
  };
}

interface QRCode {
  id: string;
  label: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  qrCodes: QRCode[];
  currentFolderId?: string | null;
  onSuccess?: () => void;
}

export default function QRCodeMover({ isOpen, onClose, qrCodes, currentFolderId, onSuccess }: Props) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
      setSelectedFolderId(currentFolderId || null);
    }
  }, [isOpen, currentFolderId]);

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      } else {
        toast.error("Failed to fetch folders");
      }
    } catch (error) {
      toast.error("Failed to fetch folders");
    }
  };

  const handleMove = async () => {
    if (qrCodes.length === 0) return;

    setLoading(true);
    try {
      const movePromises = qrCodes.map(qr => 
        fetch(`/api/qrcodes/${qr.id}/move`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: selectedFolderId })
        })
      );

      const results = await Promise.all(movePromises);
      const allSuccessful = results.every(result => result.ok);

      if (allSuccessful) {
        const destinationName = selectedFolderId 
          ? folders.find(f => f.id === selectedFolderId)?.name || "Unknown Folder"
          : "Uncategorized";
        
        toast.success(
          `${qrCodes.length} QR code${qrCodes.length !== 1 ? 's' : ''} moved to ${destinationName}`
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error("Some QR codes could not be moved");
      }
    } catch (error) {
      toast.error("Failed to move QR codes");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFolderId(currentFolderId || null);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleCancel}
    >
      <ModalHeader>
        <h2 className="text-lg font-semibold">
          Move {qrCodes.length} QR Code{qrCodes.length !== 1 ? 's' : ''}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select a destination folder for the selected QR codes
        </p>
      </ModalHeader>
      
      <ModalContent>
        <div className="space-y-6">
          
          {/* QR Code List */}
          <div className="bg-muted/50 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
            <div className="space-y-1">
              {qrCodes.map((qr) => (
                <div key={qr.id} className="flex items-center gap-2 text-sm">
                  <QrCode size={14} className="text-muted-foreground" />
                  <span className="truncate">{qr.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Destination Folder
          </label>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {/* Uncategorized Option */}
            <div
              onClick={() => setSelectedFolderId(null)}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedFolderId === null 
                  ? "bg-primary/10 border-primary" 
                  : "hover:bg-muted/50 border-border"
              }`}
            >
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <QrCode size={16} />
              </div>
              <div>
                <p className="font-medium">Uncategorized</p>
                <p className="text-xs text-muted-foreground">No folder</p>
              </div>
            </div>

            {/* Folder Options */}
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedFolderId === folder.id 
                    ? "bg-primary/10 border-primary" 
                    : "hover:bg-muted/50 border-border"
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: folder.color }}
                >
                  {folder.icon}
                </div>
                <div>
                  <p className="font-medium">{folder.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {folder._count.qrcodes} QR code{folder._count.qrcodes !== 1 ? 's' : ''}
                    {folder.description && ` • ${folder.description}`}
                  </p>
                </div>
              </div>
            ))}

            {folders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">No folders available</p>
                <p className="text-xs">Create folders to organize your QR codes</p>
              </div>
            )}
          </div>
        </div>
      </ModalContent>
      
      <ModalFooter>
        <Button 
          type="button" 
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleMove}
          disabled={loading || selectedFolderId === currentFolderId}
        >
          {loading ? "Moving..." : "Move QR Codes"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}