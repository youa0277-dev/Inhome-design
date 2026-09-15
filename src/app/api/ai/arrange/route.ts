import { NextRequest, NextResponse } from "next/server";
import { AI_MODEL, getAnthropicClient } from "@/lib/anthropic";

export const runtime = "nodejs";

interface ArrangeBody {
  room: { width: number; depth: number; height: number };
  items: { id: string; name: string; category: string; footprint: [number, number] }[];
  style?: string;
}

const TOOL_NAME = "place_furniture";

export async function POST(req: NextRequest) {
  const anthropic = getAnthropicClient();
  if (!anthropic) {
    return NextResponse.json(
      { error: "The AI assistant isn't configured yet. Set an ANTHROPIC_API_KEY environment variable to enable it." },
      { status: 503 }
    );
  }

  let body: ArrangeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: "Add some furniture first, then ask me to arrange it." }, { status: 400 });
  }

  const { width, depth } = body.room;
  const halfW = width / 2 - 0.15;
  const halfD = depth / 2 - 0.15;

  const itemList = body.items
    .map((i) => `- id="${i.id}" name="${i.name}" category=${i.category} footprint=${i.footprint[0]}x${i.footprint[1]}m`)
    .join("\n");

  const prompt = `You are arranging furniture inside a rectangular room that is ${width}m wide (x-axis, from ${-halfW.toFixed(
    2
  )} to ${halfW.toFixed(2)}) and ${depth}m deep (z-axis, from ${-halfD.toFixed(2)} to ${halfD.toFixed(2)}). The room's back wall is at z=${(-depth / 2).toFixed(
    2
  )}, left wall at x=${(-width / 2).toFixed(2)}, right wall at x=${(width / 2).toFixed(2)}, and the open side (no wall) is at z=${(depth / 2).toFixed(2)}.

Furniture to place (x,z in meters, rotation in radians around the vertical axis, 0 = facing the open side toward +z):
${itemList}

${body.style ? `Desired style: ${body.style}.` : ""}

Arrange these pieces the way a thoughtful interior designer would: keep a walkway clear, place seating so it faces a focal point (like a coffee table or TV stand), keep pieces fully inside the room bounds with their footprint, avoid overlaps, and put rugs centered under seating groups. Call the ${TOOL_NAME} tool with your placement for every item id listed above.`;

  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
      tools: [
        {
          name: TOOL_NAME,
          description: "Place each furniture item at an x,z coordinate (meters) with a rotation (radians).",
          input_schema: {
            type: "object",
            properties: {
              placements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    x: { type: "number" },
                    z: { type: "number" },
                    rotation: { type: "number" },
                  },
                  required: ["id", "x", "z", "rotation"],
                },
              },
            },
            required: ["placements"],
          },
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "The AI didn't return a layout. Try again." }, { status: 502 });
    }

    const input = toolUse.input as { placements?: { id: string; x: number; z: number; rotation: number }[] };
    const placements = (input.placements ?? []).filter((p) => body.items.some((i) => i.id === p.id));

    const clamped = placements.map((p) => ({
      ...p,
      x: Math.min(halfW, Math.max(-halfW, p.x)),
      z: Math.min(halfD, Math.max(-halfD, p.z)),
    }));

    return NextResponse.json({ placements: clamped });
  } catch (err) {
    console.error("AI arrange error", err);
    return NextResponse.json({ error: "The AI assistant had trouble arranging the room. Please try again." }, { status: 502 });
  }
}
