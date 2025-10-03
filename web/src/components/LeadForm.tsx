"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

interface FormField {
  id: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "radio";
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
}

interface LeadFormProps {
  qrId: string;
  destination: string;
  qrLabel: string;
  template?: {
    id?: string;
    title?: string;
    subtitle?: string;
    logoUrl?: string;
    bannerUrl?: string;
    bannerPosition?: string;
    backgroundColor?: string;
    cardColor?: string;
    primaryColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    buttonText?: string;
    footerText?: string;
    formFields?: FormField[];
    facebookUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    youtubeUrl?: string;
    tiktokUrl?: string;
    websiteUrl?: string;
    termsUrl?: string;
    privacyUrl?: string;
  };
}

export default function LeadForm({ qrId, destination, qrLabel, template }: LeadFormProps) {
  const renderFormField = (field: FormField, value: any) => {
    const commonProps = {
      id: field.id,
      placeholder: field.placeholder,
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent",
      style: { 
        borderColor: template?.primaryColor + "40" || "#d1d5db",
        focusRingColor: template?.primaryColor || "#3b82f6"
      },
      required: field.required,
    };

    const handleChange = (newValue: any) => {
      setFormData(prev => ({ ...prev, [field.id]: newValue }));
    };

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows={3}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
      case "select":
        return (
          <select 
            {...commonProps}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => {
              const checked = Array.isArray(value) && value.includes(option);
              return (
                <label key={i} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={checked}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleChange([...currentValues, option]);
                      } else {
                        handleChange(currentValues.filter(v => v !== option));
                      }
                    }}
                  />
                  <span style={{ color: template?.textColor || "#374151" }}>{option}</span>
                </label>
              );
            })}
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name={field.id}
                  className="rounded"
                  checked={value === option}
                  onChange={() => handleChange(option)}
                />
                <span style={{ color: template?.textColor || "#374151" }}>{option}</span>
              </label>
            ))}
          </div>
        );
      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
    }
  };
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initialData: Record<string, any> = {};
    
    // Initialize form data based on template fields or default fields
    if (template?.formFields && Array.isArray(template.formFields)) {
      template.formFields.forEach(field => {
        if (field.type === "checkbox") {
          initialData[field.id] = [];
        } else {
          initialData[field.id] = "";
        }
      });
    } else {
      // Default fields for backwards compatibility
      initialData.name = "";
      initialData.email = "";
      initialData.company = "";
    }
    
    return initialData;
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on template
    if (template?.formFields && Array.isArray(template.formFields)) {
      const missingFields = template.formFields.filter(field => {
        if (!field.required) return false;
        
        const value = formData[field.id];
        if (field.type === "checkbox") {
          return !Array.isArray(value) || value.length === 0;
        }
        return !value || (typeof value === "string" && value.trim() === "");
      });
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.map(f => f.label).join(", ")}`);
        return;
      }
    } else {
      // Backwards compatibility validation
      if (!formData.name || !formData.email || !formData.company) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrId,
          formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setSubmitted(true);
      toast.success("Thank you! Redirecting you now...");
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = destination;
      }, 2000);
    } catch (error) {
      toast.error("Failed to submit form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  if (submitted) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: template?.backgroundColor || "#f8fafc" }}
      >
        <div 
          className="rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
          style={{ backgroundColor: template?.cardColor || "#ffffff" }}
        >
          <div className="text-6xl mb-4">✅</div>
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: template?.textColor || "#1f2937" }}
          >
            Thank You!
          </h1>
          <p 
            className="mb-4"
            style={{ color: template?.textColor || "#6b7280" }}
          >
            Your information has been submitted successfully.
          </p>
          <p 
            className="text-sm"
            style={{ color: template?.textColor || "#9ca3af" }}
          >
            Redirecting you to {qrLabel}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: template?.backgroundColor || "#f8fafc" }}
    >
      <div 
        className="rounded-2xl shadow-xl p-8 max-w-md w-full"
        style={{ backgroundColor: template?.cardColor || "#ffffff" }}
      >
        {/* Banner - Top */}
        {template?.bannerUrl && template?.bannerPosition === "top" && (
          <div className="mb-6">
            <img 
              src={template.bannerUrl} 
              alt="Banner" 
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="text-center mb-6">
          {template?.logoUrl ? (
            <div className="mb-3">
              <img 
                src={template.logoUrl} 
                alt="Logo" 
                className="w-16 h-16 mx-auto rounded object-cover"
              />
            </div>
          ) : (
            <div className="text-4xl mb-3">📝</div>
          )}
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: template?.textColor || "#1f2937" }}
          >
            {template?.title || "Get Exclusive Access"}
          </h1>
          {(template?.subtitle || !template) && (
            <p style={{ color: template?.textColor || "#6b7280" }}>
              {template?.subtitle || `Please provide your contact information to continue to`}{" "}
              <strong>{qrLabel}</strong>
            </p>
          )}
        </div>

        {/* Banner - Middle */}
        {template?.bannerUrl && template?.bannerPosition === "middle" && (
          <div className="mb-6">
            <img 
              src={template.bannerUrl} 
              alt="Banner" 
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {template?.formFields && Array.isArray(template.formFields) ? (
            // Render custom form fields from template
            template.formFields.map((field) => (
              <div key={field.id}>
                <label 
                  htmlFor={field.id}
                  className="block text-sm font-medium mb-1"
                  style={{ color: template?.textColor || "#374151" }}
                >
                  {field.label} {field.required && "*"}
                </label>
                {renderFormField(field, formData[field.id])}
              </div>
            ))
          ) : (
            // Default fields for backwards compatibility
            <>
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium mb-1"
                  style={{ color: template?.textColor || "#374151" }}
                >
                  Full Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium mb-1"
                  style={{ color: template?.textColor || "#374151" }}
                >
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label 
                  htmlFor="company" 
                  className="block text-sm font-medium mb-1"
                  style={{ color: template?.textColor || "#374151" }}
                >
                  Company/University *
                </label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company || ""}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Enter your company"
                  className="w-full"
                  required
                />
              </div>
            </>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full font-medium py-3"
              style={{ 
                backgroundColor: template?.buttonColor || "#3b82f6",
                color: template?.buttonTextColor || "#ffffff"
              }}
            >
              {submitting ? "Submitting..." : (template?.buttonText || "Submit")}
            </Button>
          </div>
        </form>

        {/* Banner - Bottom */}
        {template?.bannerUrl && template?.bannerPosition === "bottom" && (
          <div className="mt-6">
            <img 
              src={template.bannerUrl} 
              alt="Banner" 
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Social Media Links */}
        {(template?.facebookUrl || template?.twitterUrl || template?.instagramUrl || 
          template?.linkedinUrl || template?.youtubeUrl || template?.tiktokUrl || 
          template?.websiteUrl) && (
          <div className="mt-6 flex justify-center gap-3">
            {template?.facebookUrl && (
              <a href={template.facebookUrl} target="_blank" rel="noopener noreferrer">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm hover:opacity-80">
                  f
                </div>
              </a>
            )}
            {template?.twitterUrl && (
              <a href={template.twitterUrl} target="_blank" rel="noopener noreferrer">
                <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-sm hover:opacity-80">
                  t
                </div>
              </a>
            )}
            {template?.instagramUrl && (
              <a href={template.instagramUrl} target="_blank" rel="noopener noreferrer">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm hover:opacity-80">
                  i
                </div>
              </a>
            )}
            {template?.linkedinUrl && (
              <a href={template.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm hover:opacity-80">
                  in
                </div>
              </a>
            )}
            {template?.youtubeUrl && (
              <a href={template.youtubeUrl} target="_blank" rel="noopener noreferrer">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm hover:opacity-80">
                  yt
                </div>
              </a>
            )}
            {template?.tiktokUrl && (
              <a href={template.tiktokUrl} target="_blank" rel="noopener noreferrer">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm hover:opacity-80">
                  tk
                </div>
              </a>
            )}
            {template?.websiteUrl && (
              <a href={template.websiteUrl} target="_blank" rel="noopener noreferrer">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm hover:opacity-80">
                  w
                </div>
              </a>
            )}
          </div>
        )}

        <div 
          className="mt-6 text-center text-xs"
          style={{ color: template?.textColor + "AA" || "#6b7280" }}
        >
          {template?.footerText || "Your information is secure and will not be shared with third parties."}
        </div>

        {/* Legal Links */}
        {(template?.termsUrl || template?.privacyUrl) && (
          <div className="mt-4 text-center text-xs space-x-4">
            {template?.termsUrl && (
              <a 
                href={template.termsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:opacity-80" 
                style={{ color: template?.primaryColor || "#3b82f6" }}
              >
                Terms & Conditions
              </a>
            )}
            {template?.privacyUrl && (
              <a 
                href={template.privacyUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:opacity-80" 
                style={{ color: template?.primaryColor || "#3b82f6" }}
              >
                Privacy Policy
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}