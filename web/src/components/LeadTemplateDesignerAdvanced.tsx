"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { ArrowLeft, Eye, Save, Plus, Trash2, Upload, X } from "lucide-react";

interface FormField {
  id: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "radio";
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[]; // for select, checkbox, radio
}

interface TemplateData {
  id?: string;
  name: string;
  description: string;
  title: string;
  subtitle: string;
  logoUrl: string;
  bannerUrl: string;
  bannerPosition: string;
  backgroundColor: string;
  cardColor: string;
  primaryColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonText: string;
  footerText: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  websiteUrl: string;
  termsUrl: string;
  privacyUrl: string;
  formFields: FormField[];
}

interface LeadTemplateDesignerAdvancedProps {
  templateId?: string | null;
  onSave: (template: any) => void;
  onCancel: () => void;
}

export default function LeadTemplateDesignerAdvanced({ 
  templateId, 
  onSave, 
  onCancel 
}: LeadTemplateDesignerAdvancedProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  
  const [formData, setFormData] = useState<TemplateData>({
    name: "",
    description: "",
    title: "Get Exclusive Access",
    subtitle: "Please provide your contact information to continue",
    logoUrl: "",
    bannerUrl: "",
    bannerPosition: "top",
    backgroundColor: "#f8fafc",
    cardColor: "#ffffff",
    primaryColor: "#3b82f6",
    textColor: "#1f2937",
    buttonColor: "#3b82f6",
    buttonTextColor: "#ffffff",
    buttonText: "Submit",
    footerText: "Your information is secure and will not be shared with third parties.",
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    websiteUrl: "",
    termsUrl: "",
    privacyUrl: "",
    formFields: [
      {
        id: "name",
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email",
        required: true,
      },
      {
        id: "company",
        type: "text",
        label: "Company/University",
        placeholder: "Enter your company",
        required: true,
      },
    ],
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
        bannerUrl: template.bannerUrl || "",
        formFields: Array.isArray(template.formFields) ? template.formFields : [],
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

    if (formData.formFields.length === 0) {
      toast.error("Please add at least one form field");
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, assetType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetType", assetType);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      if (assetType === "logo") {
        updateField("logoUrl", result.url);
      } else if (assetType === "banner") {
        updateField("bannerUrl", result.url);
      }
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
    }
  };

  const addFormField = () => {
    if (formData.formFields.length >= 10) {
      toast.error("Maximum 10 fields allowed");
      return;
    }

    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "New Field",
      placeholder: "Enter value",
      required: false,
    };

    updateField("formFields", [...formData.formFields, newField]);
  };

  const updateFormField = (index: number, field: Partial<FormField>) => {
    const updatedFields = [...formData.formFields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    updateField("formFields", updatedFields);
  };

  const removeFormField = (index: number) => {
    const updatedFields = formData.formFields.filter((_, i) => i !== index);
    updateField("formFields", updatedFields);
  };

  const addSelectOption = (fieldIndex: number) => {
    const updatedFields = [...formData.formFields];
    const field = updatedFields[fieldIndex];
    field.options = [...(field.options || []), "New Option"];
    updateField("formFields", updatedFields);
  };

  const updateSelectOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const updatedFields = [...formData.formFields];
    const field = updatedFields[fieldIndex];
    if (field.options) {
      field.options[optionIndex] = value;
      updateField("formFields", updatedFields);
    }
  };

  const removeSelectOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...formData.formFields];
    const field = updatedFields[fieldIndex];
    if (field.options) {
      field.options = field.options.filter((_, i) => i !== optionIndex);
      updateField("formFields", updatedFields);
    }
  };

  const renderFormField = (field: FormField, value: string = "") => {
    const commonProps = {
      placeholder: field.placeholder,
      className: "w-full px-3 py-2 border border-gray-300 rounded-md",
      style: { borderColor: formData.primaryColor + "40" },
    };

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows={3}
            defaultValue={value}
          />
        );
      case "select":
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {field.options?.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                {option}
              </label>
            ))}
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center gap-2">
                <input type="radio" name={field.id} className="rounded" />
                {option}
              </label>
            ))}
          </div>
        );
      default:
        return <input type={field.type} {...commonProps} defaultValue={value} />;
    }
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

      <div className={`grid gap-8 ${showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {[
                { id: "basic", label: "Basic Info" },
                { id: "design", label: "Design" },
                { id: "fields", label: "Form Fields" },
                { id: "social", label: "Social & Links" },
                { id: "legal", label: "Legal" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "basic" && (
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
          )}

          {activeTab === "design" && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Design & Styling</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Logo</label>
                  <div className="flex items-center gap-4">
                    {formData.logoUrl && (
                      <img 
                        src={formData.logoUrl} 
                        alt="Logo" 
                        className="w-16 h-16 object-cover rounded border"
                      />
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "logo")}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md cursor-pointer hover:bg-muted"
                      >
                        <Upload size={16} />
                        Upload Logo
                      </label>
                      {formData.logoUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateField("logoUrl", "")}
                          className="ml-2"
                        >
                          <X size={14} />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Banner Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Banner Image</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      {formData.bannerUrl && (
                        <img 
                          src={formData.bannerUrl} 
                          alt="Banner" 
                          className="w-24 h-16 object-cover rounded border"
                        />
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "banner")}
                          className="hidden"
                          id="banner-upload"
                        />
                        <label
                          htmlFor="banner-upload"
                          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md cursor-pointer hover:bg-muted"
                        >
                          <Upload size={16} />
                          Upload Banner
                        </label>
                        {formData.bannerUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateField("bannerUrl", "")}
                            className="ml-2"
                          >
                            <X size={14} />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Banner Position</label>
                      <select
                        value={formData.bannerPosition}
                        onChange={(e) => updateField("bannerPosition", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="top">Top (before title)</option>
                        <option value="middle">Middle (after title)</option>
                        <option value="bottom">Bottom (after form)</option>
                        <option value="none">Don't show</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Color Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => updateField("backgroundColor", e.target.value)}
                        className="w-12 h-10 border border-border rounded"
                      />
                      <Input
                        value={formData.backgroundColor}
                        onChange={(e) => updateField("backgroundColor", e.target.value)}
                        placeholder="#f8fafc"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.cardColor}
                        onChange={(e) => updateField("cardColor", e.target.value)}
                        className="w-12 h-10 border border-border rounded"
                      />
                      <Input
                        value={formData.cardColor}
                        onChange={(e) => updateField("cardColor", e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => updateField("primaryColor", e.target.value)}
                        className="w-12 h-10 border border-border rounded"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => updateField("primaryColor", e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => updateField("textColor", e.target.value)}
                        className="w-12 h-10 border border-border rounded"
                      />
                      <Input
                        value={formData.textColor}
                        onChange={(e) => updateField("textColor", e.target.value)}
                        placeholder="#1f2937"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Button Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.buttonColor}
                        onChange={(e) => updateField("buttonColor", e.target.value)}
                        className="w-12 h-10 border border-border rounded"
                      />
                      <Input
                        value={formData.buttonColor}
                        onChange={(e) => updateField("buttonColor", e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Button Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.buttonTextColor}
                        onChange={(e) => updateField("buttonTextColor", e.target.value)}
                        className="w-12 h-10 border border-border rounded"
                      />
                      <Input
                        value={formData.buttonTextColor}
                        onChange={(e) => updateField("buttonTextColor", e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "fields" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Form Fields (Max: 10)</h3>
                  <Button
                    onClick={addFormField}
                    disabled={formData.formFields.length >= 10}
                    size="sm"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Field
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {formData.formFields.map((field, index) => (
                    <div key={field.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Field {index + 1}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFormField(index)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Field Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => updateFormField(index, { type: e.target.value as FormField['type'] })}
                            className="w-full px-3 py-2 border border-border rounded-md"
                          >
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="tel">Phone</option>
                            <option value="textarea">Textarea</option>
                            <option value="select">Dropdown</option>
                            <option value="checkbox">Checkboxes</option>
                            <option value="radio">Radio Buttons</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Label</label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateFormField(index, { label: e.target.value })}
                            placeholder="Field label"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Placeholder</label>
                          <Input
                            value={field.placeholder}
                            onChange={(e) => updateFormField(index, { placeholder: e.target.value })}
                            placeholder="Placeholder text"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateFormField(index, { required: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm font-medium">Required field</span>
                          </label>
                        </div>
                      </div>

                      {/* Options for select, checkbox, radio */}
                      {(field.type === "select" || field.type === "checkbox" || field.type === "radio") && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">Options</label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addSelectOption(index)}
                            >
                              <Plus size={14} className="mr-1" />
                              Add Option
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {field.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateSelectOption(index, optionIndex, e.target.value)}
                                  placeholder="Option text"
                                  className="flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeSelectOption(index, optionIndex)}
                                >
                                  <X size={14} />
                                </Button>
                              </div>
                            )) || []}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {formData.formFields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No form fields added yet. Click "Add Field" to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "social" && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Social Media & External Links</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Website URL</label>
                  <Input
                    value={formData.websiteUrl}
                    onChange={(e) => updateField("websiteUrl", e.target.value)}
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Facebook URL</label>
                  <Input
                    value={formData.facebookUrl}
                    onChange={(e) => updateField("facebookUrl", e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    type="url"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Twitter URL</label>
                  <Input
                    value={formData.twitterUrl}
                    onChange={(e) => updateField("twitterUrl", e.target.value)}
                    placeholder="https://twitter.com/youraccount"
                    type="url"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Instagram URL</label>
                  <Input
                    value={formData.instagramUrl}
                    onChange={(e) => updateField("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/youraccount"
                    type="url"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                  <Input
                    value={formData.linkedinUrl}
                    onChange={(e) => updateField("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    type="url"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">YouTube URL</label>
                  <Input
                    value={formData.youtubeUrl}
                    onChange={(e) => updateField("youtubeUrl", e.target.value)}
                    placeholder="https://youtube.com/yourchannel"
                    type="url"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">TikTok URL</label>
                  <Input
                    value={formData.tiktokUrl}
                    onChange={(e) => updateField("tiktokUrl", e.target.value)}
                    placeholder="https://tiktok.com/@youraccount"
                    type="url"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "legal" && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Legal & Policy Links</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Terms & Conditions URL</label>
                  <Input
                    value={formData.termsUrl}
                    onChange={(e) => updateField("termsUrl", e.target.value)}
                    placeholder="https://example.com/terms"
                    type="url"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Link to your terms and conditions page
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Privacy Policy URL</label>
                  <Input
                    value={formData.privacyUrl}
                    onChange={(e) => updateField("privacyUrl", e.target.value)}
                    placeholder="https://example.com/privacy"
                    type="url"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Link to your privacy policy page
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sticky Preview Panel */}
        {showPreview && (
          <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-6rem)]">
            <Card className="h-full">
              <CardHeader>
                <h3 className="font-semibold">Live Preview</h3>
              </CardHeader>
              <CardContent className="h-full overflow-auto">
                <div 
                  className="min-h-[600px] rounded-lg p-6 flex items-start justify-center"
                  style={{ backgroundColor: formData.backgroundColor }}
                >
                  <div 
                    className="w-full max-w-md rounded-2xl shadow-xl p-8"
                    style={{ backgroundColor: formData.cardColor }}
                  >
                    {/* Banner - Top */}
                    {formData.bannerUrl && formData.bannerPosition === "top" && (
                      <div className="mb-6">
                        <img 
                          src={formData.bannerUrl} 
                          alt="Banner" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="text-center mb-6">
                      {formData.logoUrl && (
                        <div className="mb-3">
                          <img 
                            src={formData.logoUrl} 
                            alt="Logo" 
                            className="w-16 h-16 mx-auto rounded object-cover"
                          />
                        </div>
                      )}
                      <h1 
                        className="text-2xl font-bold mb-2"
                        style={{ color: formData.textColor }}
                      >
                        {formData.title}
                      </h1>
                      {formData.subtitle && (
                        <p style={{ color: formData.textColor + "CC" }}>
                          {formData.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Banner - Middle */}
                    {formData.bannerUrl && formData.bannerPosition === "middle" && (
                      <div className="mb-6">
                        <img 
                          src={formData.bannerUrl} 
                          alt="Banner" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      {formData.formFields.map((field, index) => (
                        <div key={field.id}>
                          <label 
                            className="block text-sm font-medium mb-1"
                            style={{ color: formData.textColor }}
                          >
                            {field.label} {field.required && "*"}
                          </label>
                          {renderFormField(field)}
                        </div>
                      ))}

                      <div className="pt-2">
                        <button
                          className="w-full py-3 px-4 rounded-md font-medium"
                          style={{ 
                            backgroundColor: formData.buttonColor,
                            color: formData.buttonTextColor
                          }}
                        >
                          {formData.buttonText}
                        </button>
                      </div>
                    </div>

                    {/* Banner - Bottom */}
                    {formData.bannerUrl && formData.bannerPosition === "bottom" && (
                      <div className="mt-6">
                        <img 
                          src={formData.bannerUrl} 
                          alt="Banner" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Social Media Links */}
                    {(formData.facebookUrl || formData.twitterUrl || formData.instagramUrl || 
                      formData.linkedinUrl || formData.youtubeUrl || formData.tiktokUrl || 
                      formData.websiteUrl) && (
                      <div className="mt-6 flex justify-center gap-3">
                        {formData.facebookUrl && <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">f</div>}
                        {formData.twitterUrl && <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-sm">t</div>}
                        {formData.instagramUrl && <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm">i</div>}
                        {formData.linkedinUrl && <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm">in</div>}
                        {formData.youtubeUrl && <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm">yt</div>}
                        {formData.tiktokUrl && <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm">tk</div>}
                        {formData.websiteUrl && <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm">w</div>}
                      </div>
                    )}

                    <div className="mt-6 text-center text-xs" style={{ color: formData.textColor + "AA" }}>
                      {formData.footerText}
                    </div>

                    {/* Legal Links */}
                    {(formData.termsUrl || formData.privacyUrl) && (
                      <div className="mt-4 text-center text-xs space-x-4">
                        {formData.termsUrl && (
                          <a href="#" className="underline" style={{ color: formData.primaryColor }}>
                            Terms & Conditions
                          </a>
                        )}
                        {formData.privacyUrl && (
                          <a href="#" className="underline" style={{ color: formData.primaryColor }}>
                            Privacy Policy
                          </a>
                        )}
                      </div>
                    )}
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