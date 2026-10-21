const MAX_DIMENSION = 1600;
let counter = 0;

/**
 * Downscale and re-encode a photo in the browser before it's uploaded. Damage detail survives at
 * this size, uploads stay fast, and re-encoding normalizes whatever format the camera produced.
 */
export async function prepareImage(file) {
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

  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode photo."))), "image/jpeg", 0.88),
  );
  counter += 1;
  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return {
    id: `photo-${Date.now().toString(36)}-${counter}`,
    name,
    file: new File([blob], name, { type: "image/jpeg" }),
    previewUrl: URL.createObjectURL(blob),
    fileUrl: null,
  };
}
