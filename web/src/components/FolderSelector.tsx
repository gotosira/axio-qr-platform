"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import Modal, { ModalHeader, ModalContent, ModalFooter } from './ui/Modal';
import { ChevronDown, Plus, X } from 'lucide-react';
import { FOLDER_ICONS, FolderIconType } from './ui/FolderIcons';
import ColorPicker from './ui/ColorPicker';
import { toast } from 'sonner';

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

interface FolderSelectorProps {
  value: string | null;
  onChange: (folderId: string | null) => void;
  required?: boolean;
  className?: string;
}

const PRESET_ICON_KEYS: FolderIconType[] = [
  "folder", "folderOpen", "target", "rocket", "star", "fire", 
  "diamond", "palette", "chart", "heart", "shopping", "building", 
  "book", "tool", "globe"
];

export default function FolderSelector({ value, onChange, required = false, className = '' }: FolderSelectorProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "folder" as FolderIconType,
    color: "#3b82f6"
  });

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Folder name is required");
      return;
    }

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newFolder = await response.json();
        setFolders(prev => [newFolder, ...prev]);
        onChange(newFolder.id); // Automatically select the new folder
        setShowCreateModal(false);
        setFormData({
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

  const selectedFolder = folders.find(f => f.id === value);

  return (
    <>
      <div className={`relative ${className}`} ref={dropdownRef}>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {selectedFolder ? (
              <>
                <div 
                  className="w-5 h-5 rounded flex items-center justify-center text-white"
                  style={{ background: selectedFolder.color }}
                >
                  {React.createElement(FOLDER_ICONS[selectedFolder.icon] || FOLDER_ICONS.folder, { 
                    size: 12, 
                    className: "text-white" 
                  })}
                </div>
                <span>{selectedFolder.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">
                {required ? "Select a folder *" : "Select a folder (optional)"}
              </span>
            )}
          </div>
          <ChevronDown size={16} />
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading folders...
              </div>
            ) : (
              <>
                {/* Create New Folder Option */}
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 border-b border-border"
                >
                  <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                    <Plus size={12} className="text-primary" />
                  </div>
                  <span className="font-medium text-primary">Create New Folder</span>
                </button>

                {/* No Folder Option (if not required) */}
                {!required && (
                  <button
                    onClick={() => {
                      onChange(null);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 p-3 hover:bg-muted/50 text-left ${
                      value === null ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="w-5 h-5 rounded bg-muted flex items-center justify-center">
                      <span className="text-xs">—</span>
                    </div>
                    <span>No folder</span>
                  </button>
                )}

                {/* Existing Folders */}
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onChange(folder.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 p-3 hover:bg-muted/50 text-left ${
                      value === folder.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div 
                      className="w-5 h-5 rounded flex items-center justify-center text-white"
                      style={{ background: folder.color }}
                    >
                      {React.createElement(FOLDER_ICONS[folder.icon] || FOLDER_ICONS.folder, { 
                        size: 12, 
                        className: "text-white" 
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{folder.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {folder._count.qrcodes} QR code{folder._count.qrcodes !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </button>
                ))}

                {folders.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No folders yet. Create your first folder!
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
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
            onClick={() => setShowCreateModal(false)}
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
    </>
  );
}