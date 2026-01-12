"use server";

import { getGeminiClient } from "@/lib/gemini";
import { UserTier } from "@/types";

interface StudyContext {
  title: string;
  theme: string;
  passages: string;
}

export async function regenerateSectionAction(
  sectionId: string,
  context: StudyContext,
  currentContent?: string,
  tier: UserTier = UserTier.SEEKER
): Promise<string> {
  try {
    const client = getGeminiClient();

    // Scribe Tier gets a deeper model or more tokens
    const model = tier === UserTier.SCRIBE ? 'gemini-2.0-flash-exp' : 'gemini-2.0-flash-exp';

    const prompt = `
      You are an expert biblical scholar.
      Your task is to REWRITE and DEEPEN the specific section: "${sectionId}" for the study: "${context.title}" (Theme: ${context.theme}, Passage: ${context.passages}).

      Specific Goal: Provide fresh, profound theological insight, ensuring clarity and depth.
      LENGTH CONSTRAINT: Keep the output concise and roughly the same length as the original content. Avoid excessive verbosity.

      IMPORTANT FORMATTING RULES (CRITICAL):
      1. Do NOT use Markdown. Use standard HTML tags: <h3> for headers, <p> for paragraphs, <ul>/<li> for lists.
      2. **CRITICAL**: You MUST detect and wrap *EVERY* Bible verse reference (e.g., "John 3:16", "Romans 8:1", "Gen 1:1") in the custom tag: <bible-verse reference="John 3:16">John 3:16</bible-verse>.
      3. Example: "As written in <bible-verse reference='Genesis 1:1'>Genesis 1:1</bible-verse>, God created..."
      4. Note: Do not return a JSON object. Return only the raw HTML string for the content of this section.

      ${currentContent ? `Current Content (for context, improve upon this): \n${currentContent}` : ""}
    `;

    const response = await client.models.generateContent({
      model: model,
      contents: prompt,
    });

    const text = response.text;
    
    // Clean up potential markdown code blocks if the model hallucinates them
    const cleanText = text ? text.replace(/```html/g, "").replace(/```/g, "").trim() : "";

    return cleanText || "<p>Failed to regenerate content.</p>";

  } catch (error) {
    console.error("Regenerate Section Error:", error);
    throw new Error("Failed to regenerate section.");
  }
}
