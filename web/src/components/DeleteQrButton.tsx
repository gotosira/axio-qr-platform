"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

export default function DeleteQrButton({ 
  id, 
  onSuccess 
}: { 
  id: string; 
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending || loading}
      onClick={() => {
        if (!confirm("Delete this QR code?")) return;
        setLoading(true);
        fetch(`/api/qrcodes?id=${id}`, { method: "DELETE" })
          .then(res => {
            if (res.ok) {
              if (onSuccess) {
                onSuccess();
              } else {
                startTransition(() => router.refresh());
              }
            }
          })
          .finally(() => setLoading(false));
      }}
    >
      {loading ? "..." : "🗑"}
    </Button>
  );
}


