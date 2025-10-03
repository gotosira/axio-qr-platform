"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import LeadTemplateDesignerAdvanced from "./LeadTemplateDesignerAdvanced";
import { Plus, Edit, Trash, Eye } from "lucide-react";

type LeadTemplate = {
  id: string;
  name: string;
  description?: string | null;
  title: string;
  subtitle?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // We'll include other fields when needed for editing
};

interface LeadTemplateClientProps {
  initialTemplates: LeadTemplate[];
}

export default function LeadTemplateClient({ initialTemplates }: LeadTemplateClientProps) {
  const [templates, setTemplates] = useState<LeadTemplate[]>(initialTemplates);
  const [showDesigner, setShowDesigner] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowDesigner(true);
  };

  const handleEdit = (templateId: string) => {
    setEditingTemplate(templateId);
    setShowDesigner(true);
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/lead-templates/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete template");

      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success("Template deleted successfully");
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const handleSave = (template: LeadTemplate) => {
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates([template, ...templates]);
    }
    setShowDesigner(false);
    setEditingTemplate(null);
  };

  if (showDesigner) {
    return (
      <LeadTemplateDesignerAdvanced
        templateId={editingTemplate}
        onSave={handleSave}
        onCancel={() => {
          setShowDesigner(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Lead Form Templates</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage custom lead collection form designs ({templates.length} templates)
          </p>
        </div>
        <Button onClick={handleCreateNew} size="lg">
          <Plus size={20} className="mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl border p-6">
        <Input
          placeholder="Search templates by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? "No templates found" : "No templates yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? "Try adjusting your search criteria"
              : "Create your first lead form template to get started"
            }
          </p>
          {!searchTerm && (
            <Button onClick={handleCreateNew}>
              <Plus size={20} className="mr-2" />
              Create Your First Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.title}
                    </p>
                    {template.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template.id)}
                    className="flex-1"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}