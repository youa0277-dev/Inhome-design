"use client";

import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Loader2, Scissors, X } from "lucide-react";

interface Props {
  imageUrl: string;
  suggestedName: string;
  onCancel: () => void;
  onComplete: (result: { imageUrl: string; aspect: number; name: string }) => void;
}

function getCroppedDataUrl(imageSrc: string, area: Area): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(area.width));
      canvas.height = Math.max(1, Math.round(area.height));
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Couldn't load the image."));
    img.src = imageSrc;
  });
}

type Stage = "crop" | "processing" | "preview";

export function CropModal({ imageUrl, suggestedName, onCancel, onComplete }: Props) {
  const [stage, setStage] = useState<Stage>("crop");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [progress, setProgress] = useState(0);
  const [name, setName] = useState(suggestedName);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [aspect, setAspect] = useState(1);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  const process = async () => {
    if (!croppedArea) return;
    setError(null);
    setStage("processing");
    setProgress(0);
    try {
      const croppedDataUrl = await getCroppedDataUrl(imageUrl, croppedArea);
      let finalUrl = croppedDataUrl;
      if (removeBg) {
        const { removeBackground } = await import("@imgly/background-removal");
        const blob = await removeBackground(croppedDataUrl, {
          model: "isnet_quint8",
          output: { format: "image/png", quality: 0.9 },
          progress: (_key, current, total) => {
            setProgress(total > 0 ? Math.round((current / total) * 100) : 0);
          },
        });
        finalUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Couldn't read processed image."));
          reader.readAsDataURL(blob);
        });
      }
      setResultUrl(finalUrl);
      setAspect(croppedArea.width / croppedArea.height);
      setStage("preview");
    } catch {
      setError(
        removeBg
          ? "Background removal failed (this runs in your browser and needs to download a small AI model on first use — check your connection and try again, or skip background removal below)."
          : "Something went wrong while processing the image."
      );
      setStage("crop");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <h2 className="font-semibold text-sm">Crop &amp; prepare your item</h2>
          <button onClick={onCancel} className="icon-btn">
            <X size={18} />
          </button>
        </div>

        {stage === "crop" && (
          <>
            <div className="relative h-80 bg-neutral-900">
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={undefined}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit="contain"
              />
            </div>
            <div className="p-4 space-y-3">
              <label className="flex items-center gap-2 text-xs">
                <span className="w-14 text-neutral-500">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1"
                />
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)} />
                Cut out the background with AI (recommended)
              </label>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={onCancel} className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200">
                  Cancel
                </button>
                <button
                  onClick={process}
                  disabled={!croppedArea}
                  className="px-4 py-1.5 text-sm rounded-lg bg-blue-500 text-white disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Scissors size={14} /> Crop &amp; continue
                </button>
              </div>
            </div>
          </>
        )}

        {stage === "processing" && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-sm text-neutral-600">
              {removeBg ? `Removing background… ${progress}%` : "Processing…"}
            </p>
            <p className="text-xs text-neutral-400 text-center max-w-xs">
              First use downloads a small on-device AI model, so this may take a moment.
            </p>
          </div>
        )}

        {stage === "preview" && resultUrl && (
          <div className="p-4 space-y-3">
            <div
              className="h-64 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                backgroundImage:
                  "repeating-conic-gradient(#e5e5e5 0% 25%, white 0% 50%) 50% / 20px 20px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultUrl} alt={name} className="max-h-full max-w-full object-contain" />
            </div>
            <label className="block text-xs">
              <span className="text-neutral-500">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 mt-1"
              />
            </label>
            <div className="flex justify-between items-center pt-1">
              <button onClick={() => setStage("crop")} className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200">
                Redo
              </button>
              <button
                onClick={() => onComplete({ imageUrl: resultUrl, aspect, name: name.trim() || suggestedName })}
                className="px-4 py-1.5 text-sm rounded-lg bg-blue-500 text-white"
              >
                Add to my furniture
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
