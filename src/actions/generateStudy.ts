"use server";

import { getGeminiClient } from "@/lib/gemini";
import { StudyDifficulty, StudyLength, SECTION_DEFINITIONS } from "@/lib/constants";
import { BibleStudy, StudyMetadata } from "@/types";

export async function generateStudyAction(
  topic: string,
  difficulty: StudyDifficulty,
  length: StudyLength
): Promise<{ success: boolean; study?: BibleStudy; error?: string }> {
  try {
    const client = getGeminiClient();

    const prompt = `
      You are an expert biblical scholar and theologian specializing in the Inductive Bible Study Method.
      Create a structured, verse-by-verse inductive study on the topic: "${topic}".
      
      Target Audience: ${difficulty} (Adjust tone and depth accordingly).
      Length: ${length} (Adjust verbosity and number of cross-references).
      
      The study MUST follow this exact 14-section structure. For each section, provide deep, rich content formatted in **HTML**.
      
      IMPORTANT FORMATTING RULES:
      1. Do NOT use Markdown. Use standard HTML tags: <h3> for headers, <p> for paragraphs, <ul>/<li> for lists.
      2. **CRITICAL**: You MUST detect and wrap *EVERY* Bible verse reference (e.g., "John 3:16", "Romans 8:1", "Gen 1:1") in the custom tag: <bible-verse reference="John 3:16">John 3:16</bible-verse>.
      3. Example: "As written in <bible-verse reference='Genesis 1:1'>Genesis 1:1</bible-verse>, God created..."
      4. Do not miss any references. If a verse is mentioned, it MUST be interactive.
      
      Structure:
      
      Structure:
      ${Object.entries(SECTION_DEFINITIONS).map(([key, def]) => `- ${key}: ${def}`).join("\n")}
      
      Output Format:
      Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.
      The JSON must contain:
      {
        "title": "A creative, cinematic title for the study",
        "theme": "A short, 2-5 word thematic summary",
        "passages": "The primary scripture references used (e.g. John 1:1-14)",
        "sections": {
          "historical_context": "HTML content...",
          "literary_genre": "HTML content...",
          "structural_layout": "HTML content...",
          "key_terms_greek_hebrew": "HTML content...",
          "verse_analysis": "HTML content...",
          "cross_references": "HTML content...",
          "theological_themes": "HTML content...",
          "cultural_background": "HTML content...",
          "comparative_theology": "HTML content...",
          "interpretative_challenges": "HTML content...",
          "practical_application": "HTML content...",
          "devotional_reflection": "HTML content...",
          "prayer_points": "HTML content...",
          "theological_quiz": "A JSON Array of 3 objects with keys: q (question string), o (array of 4 options), a (index of correct answer 0-3)"
        }
      }
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    
    // Clean up potential markdown code blocks from the response
    const cleanJson = text ? text.replace(/```json/g, "").replace(/```/g, "").trim() : "{}";
    
    let data;
    try {
        data = JSON.parse(cleanJson);
    } catch (e) {
        console.log("Failed to parse Gemini response:", text);
        return { success: false, error: "AI generated invalid format. Please try again." };
    }

    // transform 'sections' object back into what the UI expects (standard content map + quiz handling)
    // The UI currently expects 'sections' to be a mapped array OR raw content map.
    // Based on `src/types/index.ts`, `BibleStudy` has `content: StudyContent`.
    
    // Convert quiz array to string for storage consistency if needed, or keep as object if type allows
    const content = { ...data.sections };
    if (typeof content.theological_quiz !== 'string') {
        content.theological_quiz = JSON.stringify(content.theological_quiz);
    }

    const studyId = crypto.randomUUID();
    
    const study: BibleStudy = {
        metadata: {
            id: studyId,
            ownerId: "guest", // Placeholder, will be overwritten by PersistenceService if logged in, or kept for guest
            title: data.title,
            theme: data.theme,
            passages: data.passages,
            difficulty,
            length,
            createdAt: Date.now(),
            isPublic: false,
            imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800", // Default placeholder
            stats: { views: 0, likes: 0, clones: 0, shares: 0 }
        },
        content
    };

    return { success: true, study };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return { success: false, error: "Failed to generate study. Please check API configuration." };
  }
}
