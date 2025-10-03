"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { ArrowLeft, Eye, Save } from "lucide-react";

interface TemplateData {
  id?: string;
  name: string;
  description: string;
  title: string;
  subtitle: string;
  logoUrl: string;
  backgroundColor: string;
  cardColor: string;
  primaryColor: string;
  textColor: string;
  showName: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showCompany: boolean;
  showMessage: boolean;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  companyLabel: string;
  messageLabel: string;
  nameRequired: boolean;
  emailRequired: boolean;
  phoneRequired: boolean;
  companyRequired: boolean;
  messageRequired: boolean;
  buttonText: string;
  footerText: string;
}

interface LeadTemplateDesignerProps {
  templateId?: string | null;
  onSave: (template: any) => void;
  onCancel: () => void;
}

export default function LeadTemplateDesigner({ templateId, onSave, onCancel }: LeadTemplateDesignerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  
  const [formData, setFormData] = useState<TemplateData>({
    name: "",
    description: "",
    title: "Get Exclusive Access",
    subtitle: "Please provide your contact information to continue",
    logoUrl: "",
    backgroundColor: "#f8fafc",
    cardColor: "#ffffff",
    primaryColor: "#3b82f6",
    textColor: "#1f2937",
    showName: true,
    showEmail: true,
    showPhone: false,
    showCompany: true,
    showMessage: false,
    nameLabel: "Full Name",
    emailLabel: "Email Address",
    phoneLabel: "Phone Number",
    companyLabel: "Company/University",
    messageLabel: "Message",
    nameRequired: true,
    emailRequired: true,
    phoneRequired: false,
    companyRequired: true,
    messageRequired: false,
    buttonText: "Submit",
    footerText: "Your information is secure and will not be shared with third parties.",
  });

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lead-templates/${templateId}`);
      if (!response.ok) throw new Error("Failed to load template");
      
      const template = await response.json();
      setFormData({
        ...template,
        description: template.description || "",
        subtitle: template.subtitle || "",
        logoUrl: template.logoUrl || "",
      });
    } catch (error) {
      toast.error("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    setSaving(true);
    try {
      const url = templateId 
        ? `/api/lead-templates/${templateId}`
        : "/api/lead-templates";
      
      const response = await fetch(url, {
        method: templateId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save template");
      
      const savedTemplate = await response.json();
      toast.success(templateId ? "Template updated!" : "Template created!");
      onSave(savedTemplate);
    } catch (error) {
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof TemplateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p>Loading template...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {templateId ? "Edit Template" : "Create Template"}
            </h1>
            <p className="text-muted-foreground">Design your lead collection form</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye size={20} className="mr-2" />
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save size={20} className="mr-2" />
            {saving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Template Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="My Lead Form Template"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Brief description of this template"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Form Content</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Form Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                  placeholder="Optional subtitle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Logo URL</label>
                <Input
                  value={formData.logoUrl}
                  onChange={(e) => updateField("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Button Text</label>
                <Input
                  value={formData.buttonText}
                  onChange={(e) => updateField("buttonText", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Footer Text</label>
                <textarea
                  value={formData.footerText}
                  onChange={(e) => updateField("footerText", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Form Fields</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "Name", field: "name" },
                { key: "Email", field: "email" },
                { key: "Phone", field: "phone" },
                { key: "Company", field: "company" },
                { key: "Message", field: "message" },
              ].map(({ key, field }) => (
                <div key={field} className="space-y-2">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData[`show${key}` as keyof TemplateData] as boolean}
                        onChange={(e) => updateField(`show${key}` as keyof TemplateData, e.target.checked)}
                        className="rounded"
                      />
                      Show {key}
                    </label>
                    {formData[`show${key}` as keyof TemplateData] && (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData[`${field}Required` as keyof TemplateData] as boolean}
                          onChange={(e) => updateField(`${field}Required` as keyof TemplateData, e.target.checked)}
                          className="rounded"
                        />
                        Required
                      </label>
                    )}
                  </div>
                  {formData[`show${key}` as keyof TemplateData] && (
                    <Input
                      value={formData[`${field}Label` as keyof TemplateData] as string}
                      onChange={(e) => updateField(`${field}Label` as keyof TemplateData, e.target.value)}
                      placeholder={`${key} field label`}
                      className="ml-6"
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Design & Colors</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Background Color", field: "backgroundColor" },
                { label: "Card Color", field: "cardColor" },
                { label: "Primary Color", field: "primaryColor" },
                { label: "Text Color", field: "textColor" },
              ].map(({ label, field }) => (
                <div key={field} className="flex items-center gap-4">
                  <label className="text-sm font-medium min-w-[140px]">{label}</label>
                  <input
                    type="color"
                    value={formData[field as keyof TemplateData] as string}
                    onChange={(e) => updateField(field as keyof TemplateData, e.target.value)}
                    className="w-12 h-8 rounded border"
                  />
                  <Input
                    value={formData[field as keyof TemplateData] as string}
                    onChange={(e) => updateField(field as keyof TemplateData, e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Live Preview</h3>
              </CardHeader>
              <CardContent>
                <div 
                  className="min-h-[600px] rounded-lg p-6 flex items-center justify-center"
                  style={{ backgroundColor: formData.backgroundColor }}
                >
                  <div 
                    className="w-full max-w-md rounded-2xl shadow-xl p-8"
                    style={{ backgroundColor: formData.cardColor }}
                  >
                    <div className="text-center mb-6">
                      {formData.logoUrl && (
                        <div className="text-4xl mb-3">
                          <img src={formData.logoUrl} alt="Logo" className="w-16 h-16 mx-auto rounded" />
                        </div>
                      )}
                      {!formData.logoUrl && <div className="text-4xl mb-3">📝</div>}
                      <h1 className="text-2xl font-bold mb-2" style={{ color: formData.textColor }}>
                        {formData.title}
                      </h1>
                      {formData.subtitle && (
                        <p className="text-gray-600">{formData.subtitle}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {formData.showName && (
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: formData.textColor }}>
                            {formData.nameLabel} {formData.nameRequired && "*"}
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                            <span className="text-gray-400">Enter your name</span>
                          </div>
                        </div>
                      )}

                      {formData.showCompany && (
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: formData.textColor }}>
                            {formData.companyLabel} {formData.companyRequired && "*"}
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                            <span className="text-gray-400">Enter your company</span>
                          </div>
                        </div>
                      )}

                      {formData.showEmail && (
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: formData.textColor }}>
                            {formData.emailLabel} {formData.emailRequired && "*"}
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                            <span className="text-gray-400">Enter your email</span>
                          </div>
                        </div>
                      )}

                      {formData.showPhone && (
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: formData.textColor }}>
                            {formData.phoneLabel} {formData.phoneRequired && "*"}
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                            <span className="text-gray-400">Enter your phone</span>
                          </div>
                        </div>
                      )}

                      {formData.showMessage && (
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: formData.textColor }}>
                            {formData.messageLabel} {formData.messageRequired && "*"}
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                            <span className="text-gray-400">Enter your message</span>
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          className="w-full py-3 px-4 rounded-md text-white font-medium"
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          {formData.buttonText}
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 text-center text-xs text-gray-500">
                      {formData.footerText}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}