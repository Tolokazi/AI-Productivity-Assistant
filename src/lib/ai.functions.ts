import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

async function run(system: string, prompt: string) {
  const { text } = await generateText({
    model: getModel(),
    system,
    prompt,
  });
  return { text };
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      recipient: z.string().max(200).optional().default(""),
      subject: z.string().max(200).optional().default(""),
      tone: z.string().max(50).default("professional"),
      purpose: z.string().min(3).max(2000),
      keyPoints: z.string().max(2000).optional().default(""),
    }),
  )
  .handler(async ({ data }) =>
    run(
      "You are an expert business writer. Draft clear, concise, professional emails. Output the email only, with a Subject line, greeting, body, and sign-off. Use plain text (no markdown).",
      `Recipient: ${data.recipient || "(unspecified)"}
Suggested subject: ${data.subject || "(none)"}
Tone: ${data.tone}
Purpose: ${data.purpose}
Key points: ${data.keyPoints || "(none)"}

Draft the full email now.`,
    ),
  );

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      notes: z.string().min(10).max(20000),
      style: z.string().max(50).default("concise"),
    }),
  )
  .handler(async ({ data }) =>
    run(
      "You are a meeting analyst. Produce structured summaries in clean Markdown.",
      `Summarize the following meeting notes in a ${data.style} style.

Return Markdown with these sections:
## Summary
## Key Decisions
## Action Items (with owner if mentioned)
## Risks / Open Questions

Notes:
"""
${data.notes}
"""`,
    ),
  );

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      goal: z.string().min(3).max(2000),
      timeframe: z.string().max(100).default("this week"),
      context: z.string().max(2000).optional().default(""),
    }),
  )
  .handler(async ({ data }) =>
    run(
      "You are an executive productivity coach. Break goals into actionable, prioritized task lists.",
      `Goal: ${data.goal}
Timeframe: ${data.timeframe}
Context: ${data.context || "(none)"}

Return a Markdown plan with:
## Priorities (top 3)
## Task Breakdown (checkbox list, grouped by day or phase, with estimated time)
## Suggested Schedule
## Tips`,
    ),
  );

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      topic: z.string().min(3).max(500),
      audience: z.string().max(200).default("business professionals"),
      depth: z.string().max(50).default("overview"),
    }),
  )
  .handler(async ({ data }) =>
    run(
      "You are a senior research analyst. Provide accurate, well-structured briefings. If facts are uncertain, say so. Do not fabricate sources.",
      `Topic: ${data.topic}
Audience: ${data.audience}
Depth: ${data.depth}

Return a Markdown briefing with:
## Executive Summary
## Background & Context
## Key Insights (bulleted)
## Considerations & Trade-offs
## Recommended Next Steps
## Suggested Further Reading (general directions, not fabricated URLs)`,
    ),
  );

export const chatCompletion = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      messages: z
        .array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string().max(20000),
          }),
        )
        .min(1)
        .max(100),
    }),
  )
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are a helpful workplace productivity assistant. Be concise, accurate, and professional. Use Markdown when helpful.",
      messages: data.messages,
    });
    return { text };
  });
