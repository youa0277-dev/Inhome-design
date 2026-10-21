import { Camera, Focus, ScanSearch, Sun, AlertTriangle } from "lucide-react";
const TIPS = [
  { icon: Focus, text: "Sharp and in focus — hold the phone steady and tap the damage to focus." },
  { icon: Sun, text: "Good, even light — daylight or a bright garage. Avoid heavy shadows, glare and reflections." },
  { icon: ScanSearch, text: "Show as much of the damage as possible — every dent, scratch, crack and broken part." },
  {
    icon: Camera,
    text: "Mix wide and close shots — one from 6–10 ft to show the whole area, then close-ups of each spot.",
  },
];
export function PhotoGuidelines() {
  return (
    <div role="note" className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={22} />
        <div>
          <h2 className="font-semibold text-amber-900">
            Important: your photos must be clear and show as much damage as possible
          </h2>
          <p className="text-sm text-amber-800 mt-1">
            Your estimate can only be as accurate as your photos. Blurry, dark, or partial photos lead to wider price
            ranges and damage that gets missed.
          </p>
        </div>
      </div>
      <ul className="mt-4 grid sm:grid-cols-2 gap-3">
        {TIPS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-sm text-amber-900">
            <Icon size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
