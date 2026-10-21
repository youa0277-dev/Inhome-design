export interface PreparedPhoto {
  id: string;
  name: string;
  previewUrl: string;
  mediaType: "image/jpeg";
  /** Base64 without the data: prefix. */
  data: string;
  width: number;
  height: number;
}

const MAX_DIMENSION = 1600;

/**
 * Downscale and re-encode a photo in the browser so uploads stay small. Damage detail survives
 * at this size, and re-encoding normalizes whatever format the camera produced.
 */
export async function prepareImage(file: File, id: string): Promise<PreparedPhoto> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
  return {
    id,
    name: file.name,
    previewUrl: dataUrl,
    mediaType: "image/jpeg",
    data: dataUrl.slice(dataUrl.indexOf(",") + 1),
    width,
    height,
  };
}
