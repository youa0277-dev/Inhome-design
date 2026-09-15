import Link from "next/link";
import { Box, Camera, Link2, Palette, Sparkles, Wand2 } from "lucide-react";

const FEATURES = [
  {
    icon: Box,
    title: "True 3D room design",
    body: "Build a room from scratch and place real 3D furniture you can move, rotate, and scale with on-screen gizmo handles.",
  },
  {
    icon: Camera,
    title: "Design from your own photo",
    body: "Upload a photo of your actual room and drag furniture on top of it — resize, rotate, and layer pieces exactly where you want them.",
  },
  {
    icon: Link2,
    title: "Import furniture you find online",
    body: "Paste a link to anything you've found — we grab the photo, let you crop it, and cut out the background with on-device AI so it's ready to place.",
  },
  {
    icon: Palette,
    title: "Repaint, refloor, retile",
    body: "Swap wall paint, flooring, kitchen backsplash tile, and window styles instantly to compare looks.",
  },
  {
    icon: Sparkles,
    title: "AI design assistant",
    body: "Ask for color palettes, style pairings, or layout advice from a Claude-powered assistant that can see your current room.",
  },
  {
    icon: Wand2,
    title: "One-click auto-arrange",
    body: "Let AI propose a thoughtful furniture layout for the pieces you've added, then fine-tune it by hand.",
  },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="max-w-6xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <span className="font-semibold text-lg">
          Inhome<span className="text-blue-500">Design</span>
        </span>
        <Link
          href="/studio"
          className="text-sm font-medium px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
        >
          Open Studio
        </Link>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900">
          Design your home in 3D — with anything you find online.
        </h1>
        <p className="mt-5 text-lg text-neutral-500 max-w-2xl mx-auto">
          Move real furniture around a 3D room, drop in pieces straight from a link, and restyle paint, floors,
          backsplash and windows in seconds. An AI assistant helps you pull it all together.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/studio"
            className="text-sm font-medium px-5 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Start designing — it&apos;s free
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-neutral-200 p-5 bg-white">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
              <Icon size={18} />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-1.5">{title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      <footer className="max-w-6xl mx-auto px-6 pb-10 text-xs text-neutral-400 w-full">
        Everything you design stays in your browser unless you explicitly save a project. Background removal for
        imported furniture runs on-device — your photos are never uploaded to a server for that step.
      </footer>
    </div>
  );
}
