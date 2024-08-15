"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";

type Options = {
  onError?: (err: any) => void;
  onCopy?: () => void;
};

export function useCopyToClipboard(options?: Options) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      options?.onCopy?.();
    } catch (err) {
      toast.error("Failed to copy text!", {
        richColors: true,
      });
      options?.onError?.(err);
    }
  };

  return { isCopied, copyToClipboard };
}
