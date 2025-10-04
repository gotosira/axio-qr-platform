"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal, { ModalHeader, ModalContent, ModalFooter } from "@/components/ui/Modal";
import { toast } from "sonner";
import { 
  FolderPlus, 
  Edit2, 
  Trash2, 
  QrCode, 
  ChevronRight
} from "lucide-react";
import { FOLDER_ICONS, FolderIconType } from "@/components/ui/FolderIcons";
import ColorPicker from "@/components/ui/ColorPicker";

interface Folder {
  id: string;
  name: string;
  description?: string;
  icon: FolderIconType;
  color: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    qrcodes: number;
  };
}

interface Props {
  onFolderSelect?: (folderId: string | null) => void;
  selectedFolderId?: string | null;
  showCreateButton?: boolean;
  onDropQR?: (qrId: string, folderId: string | null) => void;
  isCollapsed?: boolean;
}

const PRESET_ICON_KEYS: FolderIconType[] = [
  "folder", "folderOpen", "target", "rocket", "star", "fire", 
  "diamond", "palette", "chart", "heart", "shopping", "building", 
  "book", "tool", "globe"
];

export default function FolderManager({ onFolderSelect, selectedFolderId, showCreateButton = true, onDropQR, isCollapsed = false }: Props) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "folder" as FolderIconType,
    color: "#3b82f6"
  });

  useEffect(() => {
    fetchFolders();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingFolder(null);
    setFormData({
      name: "",
      description: "",
      icon: "folder",
      color: "#3b82f6"
    });
    setShowModal(true);
  };

  const openEditModal = (folder: Folder) => {
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      description: folder.description || "",
      icon: folder.icon,
      color: folder.color
    });
    setShowModal(true);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(folderId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    const qrId = e.dataTransfer.getData("text/plain");
    if (qrId && onDropQR) {
      onDropQR(qrId, folderId);
    }
    setDragOver(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Folder name is required");
      return;
    }

    try {
      const url = editingFolder ? `/api/folders/${editingFolder.id}` : "/api/folders";
      const method = editingFolder ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (editingFolder) {
          setFolders(prev => prev.map(f => f.id === editingFolder.id ? data : f));
          toast.success("Folder updated successfully");
        } else {
          setFolders(prev => [data, ...prev]);
          toast.success("Folder created successfully");
        }
        setShowModal(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save folder");
      }
    } catch (error) {
      toast.error("Failed to save folder");
    }
  };

  const handleDelete = async (folder: Folder) => {
    if (!confirm(`Are you sure you want to delete "${folder.name}"? QR codes in this folder will be moved to uncategorized.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/folders/${folder.id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setFolders(prev => prev.filter(f => f.id !== folder.id));
        toast.success("Folder deleted successfully");
        
        // If the deleted folder was selected, reset selection
        if (selectedFolderId === folder.id && onFolderSelect) {
          onFolderSelect(null);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete folder");
      }
    } catch (error) {
      toast.error("Failed to delete folder");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Collapsed mode - just render folder icons
  if (isCollapsed) {
    return (
      <div className="space-y-2">
        {folders.map((folder) => (
          <Button
            key={folder.id}
            variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
            size="sm"
            className="w-full p-2 h-10 flex items-center justify-center"
            onClick={() => onFolderSelect?.(folder.id)}
            title={`${folder.name} (${folder._count.qrcodes} QR codes)`}
            onDragOver={(e) => handleDragOver(e, folder.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, folder.id)}
            style={{ backgroundColor: selectedFolderId === folder.id ? `${folder.color}20` : undefined }}
          >
            {React.createElement(FOLDER_ICONS[folder.icon] || FOLDER_ICONS.folder, { 
              size: 18, 
              className: "text-foreground" 
            })}
          </Button>
        ))}
        {showCreateButton && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full p-2 h-10 flex items-center justify-center"
            onClick={openCreateModal}
            title="Create New Folder"
          >
            <FolderPlus size={18} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Folders</h3>
              <p className="text-sm text-muted-foreground">Organize your QR codes</p>
            </div>
            {showCreateButton && (
              <Button onClick={openCreateModal} size="sm">
                <FolderPlus size={16} className="mr-2" />
                New Folder
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* All QR Codes / Uncategorized */}
            <div
              onClick={() => onFolderSelect?.(null)}
              onDragOver={(e) => handleDragOver(e, null)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, null)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedFolderId === null 
                  ? "bg-primary/10 border-primary" 
                  : dragOver === null
                    ? "bg-blue-50/50 border-blue-300"
                    : "hover:bg-muted/50 border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <QrCode size={16} />
                </div>
                <div>
                  <p className="font-medium">All QR Codes</p>
                  <p className="text-xs text-muted-foreground">Uncategorized</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>

            {/* Folders */}
            {folders.map((folder) => (
              <div
                key={folder.id}
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, folder.id)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  selectedFolderId === folder.id 
                    ? "bg-primary/10 border-primary" 
                    : dragOver === folder.id
                      ? "bg-blue-50/50 border-blue-300"
                      : "hover:bg-muted/50 border-border"
                }`}
              >
                <div
                  onClick={() => onFolderSelect?.(folder.id)}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ background: folder.color }}
                  >
                    {React.createElement(FOLDER_ICONS[folder.icon] || FOLDER_ICONS.folder, { 
                      size: 16, 
                      className: "text-white" 
                    })}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{folder.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {folder._count.qrcodes} QR code{folder._count.qrcodes !== 1 ? 's' : ''}
                      {folder.description && ` • ${folder.description}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(folder)}
                    className="p-2"
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(folder)}
                    className="p-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}

            {folders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FolderPlus size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">No folders yet</p>
                <p className="text-xs">Create folders to organize your QR codes</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
      >
        <ModalHeader>
          <h2 className="text-lg font-semibold">
            {editingFolder ? "Edit Folder" : "Create New Folder"}
          </h2>
        </ModalHeader>
        
        <ModalContent>
          <form id="folder-form" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Folder Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter folder name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                    onClick={() => setFormData(prev => ({ ...prev, icon: iconKey }))}
                    className={`w-10 h-10 flex items-center justify-center rounded border transition-colors ${
                      formData.icon === iconKey 
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
              value={formData.color}
              onChange={(color) => setFormData(prev => ({ ...prev, color }))}
              className="w-full"
            />
          </div>

          </form>
        </ModalContent>
        
        <ModalFooter>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            form="folder-form"
          >
            {editingFolder ? "Update Folder" : "Create Folder"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}