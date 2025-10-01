"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

type Props = {
  id: string;
  label: string;
  destination: string;
  slug: string;
  logoUrl?: string | null;
  fgColor?: string | null;
  bgColor?: string | null;
  styleType?: string | null;
  logoAspect?: string | null;
  cornerRadius?: number | null;
  logoSizePct?: number | null;
};

export default function QrPreviewCard({
  label,
  destination,
  slug,
  logoUrl,
  fgColor = "#000000",
  bgColor = "#ffffff",
  styleType = "square",
  logoAspect = "1:1",
  cornerRadius = 8,
  logoSizePct = 24,
}: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);
  const scanUrl = typeof window !== "undefined" ? `${window.location.origin}/api/scan/${slug}` : "";

  useEffect(() => {
    (async () => {
      try {
        const { default: QRCodeStyling } = await import("qr-code-styling");
        const qr = new QRCodeStyling({
          width: 256,
          height: 256,
          data: scanUrl,
          image: logoUrl || undefined,
          imageOptions: { imageSize: logoUrl ? (logoSizePct || 24) / 100 : 0, margin: 4, crossOrigin: "anonymous" },
          backgroundOptions: { color: bgColor || "#ffffff" },
          dotsOptions: { color: fgColor || "#000000", type: styleType === "square" ? "square" : (styleType as any) },
          cornersSquareOptions: { type: "extra-rounded", color: fgColor || "#000000" } as any,
          cornersDotOptions: { color: fgColor || "#000000" } as any,
        });
        const blob = (await qr.getRawData("png")) as Blob;
        const url = await blobToDataURL(blob);
        setDataUrl(url);
        return;
      } catch {
        const png = await QRCode.toDataURL(scanUrl, { margin: 1, width: 256, color: { dark: fgColor || "#000000", light: bgColor || "#ffffff" } });
        setDataUrl(png);
      }
    })();
  }, [scanUrl, logoUrl, fgColor, bgColor, styleType, logoAspect, cornerRadius, logoSizePct]);

  useEffect(() => {
    if (!dataUrl) return;
    if (!logoUrl) { setCompositeUrl(dataUrl); return; }
    composeWithLogo(dataUrl, logoUrl, (logoSizePct || 24) / 100, cornerRadius || 8, (logoAspect as any) || "1:1")
      .then(setCompositeUrl)
      .catch(() => setCompositeUrl(dataUrl));
  }, [dataUrl, logoUrl, logoSizePct, cornerRadius, logoAspect]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{label}</div>
            <div className="text-xs text-gray-500 break-all">{destination}</div>
          </div>
          <a href={scanUrl} className="text-xs text-blue-700 underline" target="_blank">Open</a>
        </div>
      </CardHeader>
      <CardContent>
        {compositeUrl && (<img src={compositeUrl} alt={label} className="w-full h-auto rounded" />)}
        <div className="text-xs text-gray-600 break-all mt-2">{scanUrl}</div>
        {compositeUrl && (
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(scanUrl).then(() => toast.success("Link copied"))}>Copy link</Button>
            <Button variant="secondary" size="sm" onClick={() => downloadDataUrl(compositeUrl, `${slug}.png`)}>Download PNG</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function composeWithLogo(qrPng: string, logoPng: string, ratio: number, radiusPct = 8, aspect: "1:1" | "16:9" | "3:4" = "1:1") {
  const qrImg = await loadImage(qrPng);
  const logoImg = await loadImage(logoPng);
  const size = Math.max(qrImg.width, qrImg.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(qrImg, 0, 0, size, size);

  const logoMax = Math.floor(size * ratio);
  let w = logoMax, h = logoMax;
  if (aspect === "16:9") { w = logoMax; h = Math.floor((logoMax * 9) / 16); }
  if (aspect === "3:4") { w = Math.floor((logoMax * 3) / 4); h = logoMax; }
  const x = Math.floor((size - w) / 2);
  const y = Math.floor((size - h) / 2);

  const radius = Math.floor(Math.min(w, h) * (radiusPct / 100));
  roundRect(ctx, x - 6, y - 6, w + 12, h + 12, radius);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.drawImage(logoImg, x, y, w, h);
  return canvas.toDataURL("image/png");
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function blobToDataURL(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}


