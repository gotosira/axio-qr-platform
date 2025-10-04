"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronDown, Download } from "lucide-react";
import QRCodeStyling from "qr-code-styling";

interface DownloadQrDropdownProps {
  qr: {
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
  };
  className?: string;
  size?: "sm" | "default" | "lg";
}

const DOWNLOAD_SIZES = [
  { label: "Small (256px)", value: 256 },
  { label: "Medium (512px)", value: 512 },
  { label: "Large (1024px)", value: 1024 },
  { label: "Extra Large (1536px)", value: 1536 },
  { label: "Highest (2000px)", value: 2000 },
];

export default function DownloadQrDropdown({ qr, className = "", size = "sm" }: DownloadQrDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateAndDownloadQr = async (targetSize: number) => {
    setIsGenerating(true);
    setIsOpen(false);

    try {
      const url = `${window.location.origin}/api/scan/${qr.slug}`;
      let dataUrl: string;

      // Try advanced QR generation if we have custom styling
      if (qr.logoUrl || qr.styleType !== "square" || (qr.cornerRadius && qr.cornerRadius > 0)) {
        try {
          dataUrl = await generateAdvancedQr(url, targetSize);
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

    } catch (error) {
      console.error("Failed to generate QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAdvancedQr = async (url: string, targetSize: number): Promise<string> => {
    const qrOptions: any = {
      width: targetSize,
      height: targetSize,
      data: url,
      margin: Math.max(4, Math.floor(targetSize * 0.02)), // Dynamic margin based on size
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

    const qrCode = new QRCodeStyling(qrOptions);
    
    return new Promise<string>((resolve, reject) => {
      try {
        const container = document.createElement('div');
        container.style.width = `${targetSize}px`;
        container.style.height = `${targetSize}px`;
        
        qrCode.append(container);
        
        setTimeout(() => {
          try {
            const canvas = container.querySelector('canvas');
            if (canvas) {
              const dataUrl = canvas.toDataURL('image/png');
              resolve(dataUrl);
            } else {
              throw new Error('Canvas not found after QR generation');
            }
          } catch (error) {
            reject(error);
          }
        }, 500); // Longer timeout for larger images
        
      } catch (error) {
        reject(error);
      }
    });
  };

  const generateBasicQr = async (url: string, targetSize: number): Promise<string> => {
    const QRCode = await import("qrcode");
    return await QRCode.toDataURL(url, { 
      margin: Math.max(1, Math.floor(targetSize * 0.02)),
      width: targetSize,
      color: { 
        dark: qr.fgColor || "#000000", 
        light: qr.bgColor || "#ffffff" 
      } 
    });
  };

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

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center">
        <Button
          variant="outline"
          size={size}
          onClick={() => generateAndDownloadQr(512)} // Default download size
          disabled={isGenerating}
          className="rounded-r-none border-r-0 flex-1 min-w-0"
        >
          {isGenerating ? (
            <div className="animate-spin text-sm">⏳</div>
          ) : (
            <>
              <Download size={16} className="mr-1 flex-shrink-0" />
              <span className="truncate">Download</span>
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size={size}
          onClick={() => setIsOpen(!isOpen)}
          disabled={isGenerating}
          className="rounded-l-none px-2 flex-shrink-0"
        >
          <ChevronDown size={16} />
        </Button>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 min-w-full">
          <div className="py-1">
            {DOWNLOAD_SIZES.map((sizeOption) => (
              <button
                key={sizeOption.value}
                onClick={() => generateAndDownloadQr(sizeOption.value)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                disabled={isGenerating}
              >
                {sizeOption.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}