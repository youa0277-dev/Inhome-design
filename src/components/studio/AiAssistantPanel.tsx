"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Wand2, Loader2 } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { makeId } from "@/lib/id";

export function AiAssistantPanel() {
  const chat = useStudioStore((s) => s.chat);
  const pushChat = useStudioStore((s) => s.pushChat);
  const chatBusy = useStudioStore((s) => s.chatBusy);
  const setChatBusy = useStudioStore((s) => s.setChatBusy);
  const room = useStudioStore((s) => s.room);
  const items = useStudioStore((s) => s.items);
  const updateItem = useStudioStore((s) => s.updateItem);
  const mode = useStudioStore((s) => s.mode);

  const [input, setInput] = useState("");
  const [arranging, setArranging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat, chatBusy]);

  const send = async (text: string) => {
    if (!text.trim() || chatBusy) return;
    const userMsg = { id: makeId("msg"), role: "user" as const, content: text.trim() };
    pushChat(userMsg);
    setInput("");
    setChatBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chat, userMsg].map((m) => ({ role: m.role, content: m.content })),
          room: { width: room.width, depth: room.depth, height: room.height, wallColor: room.wallColor, floorMaterial: room.floorMaterial },
          items: items.map((i) => ({ name: i.name, category: i.category })),
        }),
      });
      const data = await res.json();
      pushChat({ id: makeId("msg"), role: "assistant", content: res.ok ? data.reply : data.error || "Something went wrong." });
    } catch {
      pushChat({ id: makeId("msg"), role: "assistant", content: "I couldn't reach the AI service. Please try again." });
    } finally {
      setChatBusy(false);
    }
  };

  const autoArrange = async () => {
    if (items.length === 0 || arranging) return;
    setArranging(true);
    try {
      const res = await fetch("/api/ai/arrange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: { width: room.width, depth: room.depth, height: room.height },
          items: items.map((i) => ({ id: i.id, name: i.name, category: i.category, footprint: [i.scale, i.scale] })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushChat({ id: makeId("msg"), role: "assistant", content: data.error || "Couldn't auto-arrange the room." });
        return;
      }
      for (const p of data.placements as { id: string; x: number; z: number; rotation: number }[]) {
        updateItem(p.id, { position: [p.x, 0, p.z], rotation: p.rotation });
      }
      pushChat({ id: makeId("msg"), role: "assistant", content: "I've rearranged your furniture for better flow — feel free to fine-tune anything by dragging it." });
    } catch {
      pushChat({ id: makeId("msg"), role: "assistant", content: "I couldn't reach the AI service. Please try again." });
    } finally {
      setArranging(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-2">
        <Sparkles size={16} className="text-blue-500" />
        <h3 className="font-semibold text-sm">Design assistant</h3>
      </div>

      {mode === "studio" && (
        <div className="px-4 pt-3">
          <button
            onClick={autoArrange}
            disabled={arranging || items.length === 0}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40"
          >
            {arranging ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            Auto-arrange my furniture
          </button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto panel-scroll px-4 py-3 space-y-3">
        {chat.length === 0 && (
          <p className="text-xs text-neutral-400">
            Ask for color palette ideas, style pairings, or layout tips. I can see your current room dimensions,
            colors, and furniture.
          </p>
        )}
        {chat.map((m) => (
          <div
            key={m.id}
            className={`text-xs rounded-xl px-3 py-2 max-w-[90%] whitespace-pre-wrap ${
              m.role === "user" ? "bg-blue-500 text-white ml-auto" : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {m.content}
          </div>
        ))}
        {chatBusy && (
          <div className="text-xs rounded-xl px-3 py-2 bg-neutral-100 text-neutral-400 w-fit flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin" /> Thinking…
          </div>
        )}
      </div>

      <form
        className="p-3 border-t border-neutral-200 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for design advice…"
          className="flex-1 text-xs px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={chatBusy || !input.trim()}
          className="px-3 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
