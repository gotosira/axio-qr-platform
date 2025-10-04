"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

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
      className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
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
      {loading ? (
        <div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full"></div>
      ) : (
        <Trash2 size={16} className="text-white" />
      )}
    </Button>
  );
}


