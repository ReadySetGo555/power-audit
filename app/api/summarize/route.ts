import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  const { category, items } = await request.json() as {
    category: string;
    items: Array<{ set: string; stage: string; score: number; why: string; makeTen: string }>;
  };

  if (!items?.length) {
    return Response.json({ summary: "" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const itemLines = items.map((i) => {
    const parts = [`${i.set} / ${i.stage} (${i.score}/10)`];
    if (i.why) parts.push(`  Why: ${i.why}`);
    if (i.makeTen) parts.push(`  What would make it a 10: ${i.makeTen}`);
    return parts.join("\n");
  }).join("\n\n");

  const prompt = `You are reviewing someone's Power Audit responses for the "${category}" score range.

Here are their answers:

${itemLines}

Write a single paragraph (3–5 sentences) that reflects back what this person is experiencing in this area of their creative power. Be honest, specific, and direct — draw from their actual words. Don't be generic or use filler. Speak to them as if you deeply understand their situation.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const summary = message.content[0].type === "text" ? message.content[0].text : "";
  return Response.json({ summary });
}
