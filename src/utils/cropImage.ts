/**
 * Crop an image to a square data URL for album artwork.
 * Preserves PNG/WebP when possible; JPEG otherwise.
 */

import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = src;
  });
}

function getOutputFormat(imageSrc: string): { mime: string; quality?: number } {
  if (imageSrc.startsWith("data:image/png")) {
    return { mime: "image/png" };
  }
  if (imageSrc.startsWith("data:image/webp")) {
    return { mime: "image/webp", quality: 0.92 };
  }
  return { mime: "image/jpeg", quality: 0.92 };
}

export async function getCroppedImageDataUrl(
  imageSrc: string,
  pixelCrop: Area,
  outputSize = 512
): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");

  canvas.width = outputSize;
  canvas.height = outputSize;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  const { mime, quality } = getOutputFormat(imageSrc);
  return quality !== undefined
    ? canvas.toDataURL(mime, quality)
    : canvas.toDataURL(mime);
}
