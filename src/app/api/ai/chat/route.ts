import { NextRequest, NextResponse } from "next/server";
import { AI_MODEL, getAnthropicClient } from "@/lib/anthropic";

export const runtime = "nodejs";

interface ChatBody {
  messages: { role: "user" | "assistant"; content: string }[];
  room?: { width: number; depth: number; height: number; wallColor: string; floorMaterial: string };
  items?: { name: string; category: string }[];
}

export async function POST(req: NextRequest) {
  const anthropic = getAnthropicClient();
  if (!anthropic) {
    return NextResponse.json(
      { error: "The AI assistant isn't configured yet. Set an ANTHROPIC_API_KEY environment variable to enable it." },
      { status: 503 }
    );
  }

  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages = (body.messages ?? []).slice(-16).filter((m) => m.content?.trim());
  if (messages.length === 0) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  const roomSummary = body.room
    ? `Room: ${body.room.width}m x ${body.room.depth}m, ceiling ${body.room.height}m. Wall color ${body.room.wallColor}. Floor: ${body.room.floorMaterial}.`
    : "No room set up yet.";
  const itemsSummary =
    body.items && body.items.length > 0
      ? `Furniture currently in the room: ${body.items.map((i) => `${i.name} (${i.category})`).join(", ")}.`
      : "The room is currently empty of furniture.";

  const system = `You are the built-in interior design assistant inside "Inhome Design", a 3D home design web app. Users design rooms with paint colors, flooring, backsplash, windows, and furniture (from a catalog and items they import from online stores). Give warm, concrete, concise interior-design advice: color palettes, furniture arrangement, scale, and style pairing. When relevant, suggest specific actions they can take in the app (e.g. "swap the floor to light oak", "add a floor lamp beside the armchair", "try a sage green accent wall"). Keep replies under ~130 words, plain conversational text, no markdown headers or bullet-heavy formatting unless it truly helps.

Current design state:
${roomSummary}
${itemsSummary}`;

  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 500,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content
      .filter((block): block is Extract<typeof block, { type: "text" }> => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return NextResponse.json({ reply: text || "I couldn't come up with a suggestion just now — try asking again." });
  } catch (err) {
    console.error("AI chat error", err);
    return NextResponse.json({ error: "The AI assistant had trouble responding. Please try again." }, { status: 502 });
  }
}
