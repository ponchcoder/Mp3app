"use client";

/**
 * Full-screen image cropper — touch and mouse friendly.
 */

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area } from "react-easy-crop";
import { X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getCroppedImageDataUrl } from "@/utils/cropImage";

interface ImageCropModalProps {
  imageSrc: string;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}

export function ImageCropModal({
  imageSrc,
  onConfirm,
  onCancel,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const dataUrl = await getCroppedImageDataUrl(imageSrc, croppedAreaPixels);
      onConfirm(dataUrl);
    } catch {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[300] flex flex-col bg-[var(--color-bg)]">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel crop"
          className="p-2 rounded-full hover:bg-[var(--color-glass)] transition-colors"
        >
          <X size={22} className="text-[var(--color-text)]" />
        </button>
        <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
          Crop Artwork
        </h2>
        <div className="w-10" aria-hidden="true" />
      </div>

      <p className="px-4 pb-3 text-sm text-[var(--color-text-secondary)] text-center">
        Pinch or scroll to zoom, drag to reposition
      </p>

      <div className="relative flex-1 min-h-0 bg-black/90">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="rect"
          showGrid
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          objectFit="contain"
        />
      </div>

      <div className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-4 bg-[var(--color-bg)] border-t border-[var(--color-card-border)]">
        <div className="flex items-center gap-3">
          <ZoomIn size={18} className="text-[var(--color-text-secondary)] shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="flex-1 accent-[var(--color-accent)]"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={!croppedAreaPixels || saving}
          >
            {saving ? "Saving…" : "Use Photo"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
