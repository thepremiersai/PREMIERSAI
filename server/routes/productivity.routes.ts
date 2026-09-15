import { Router, Request, Response } from "express";
import { optionalAuth } from "../auth";
import { recordUsageMetric } from "../db";
import { generateAIContent } from "../gemini";

export const productivityRouter = Router();

// 12. AI REWRITE TOOLS (8 TONES)
productivityRouter.post("/rewrite", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, tone } = req.body;
    if (!text) {
      res.status(400).json({ error: "Text is required for rewriting." });
      return;
    }

    const validTones = ["Professional", "Friendly", "Formal", "Simple", "Concise", "Detailed", "Creative", "Academic"];
    const selectedTone = validTones.includes(tone) ? tone : "Professional";

    const prompt = `Rewrite the following text with a ${selectedTone} tone. Maintain the core meaning and facts while adjusting vocabulary, sentence structure, and flow to suit this style perfectly:\n\n${text}`;

    let result = await generateAIContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    if (!result) {
      if (selectedTone === "Concise") {
        result = text.split(".").slice(0, 2).join(". ") + ".";
      } else if (selectedTone === "Formal" || selectedTone === "Professional") {
        result = `We would like to convey that ${text.trim()}. Thank you for your consideration.`;
      } else if (selectedTone === "Friendly") {
        result = `Hey there! Just wanted to share: ${text.trim()} 😊 Let me know what you think!`;
      } else {
        result = text;
      }
    }

    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json({ rewrittenText: result, tone: selectedTone });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to rewrite text." });
  }
});

// 13. AI GRAMMAR & SPELL CHECKER
productivityRouter.post("/grammar", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: "Text is required." });
      return;
    }

    const prompt = `Analyze this text for grammar, punctuation, and spelling errors. Output JSON only in this schema:
{
  "correctedText": "full corrected text",
  "issues": [
    { "original": "error word/phrase", "suggestion": "corrected word/phrase", "explanation": "why this was changed", "type": "spelling|grammar|punctuation" }
  ],
  "score": 95
}
Text to check:
${text}`;

    let jsonResult: any = null;
    const respText = await generateAIContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      responseMimeType: "application/json",
    });

    if (respText) {
      try {
        const cleaned = respText.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
        jsonResult = JSON.parse(cleaned);
      } catch {}
    }

    if (!jsonResult) {
      jsonResult = {
        correctedText: text.trim(),
        issues: [],
        score: 100,
      };
    }

    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json(jsonResult);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to check grammar." });
  }
});

// 14. AI SUMMARIZATION (Short, Medium, Detailed, Bullet Points)
productivityRouter.post("/summarize", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, type } = req.body;
    if (!text) {
      res.status(400).json({ error: "Text is required." });
      return;
    }

    let instruction = "Summarize the text clearly and accurately.";
    if (type === "short") instruction = "Provide a 1-2 sentence executive summary highlighting only the primary finding or takeaway.";
    else if (type === "detailed") instruction = "Provide an in-depth summary covering all key aspects, background, methodology, and conclusions.";
    else if (type === "bullets") instruction = "Provide 4-6 concise bullet points capturing the core insights and actionable takeaways.";
    else instruction = "Provide a balanced, medium-length paragraph summary.";

    const prompt = `${instruction}\n\nText:\n${text}`;
    let summary = await generateAIContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    if (!summary) {
      summary = `• ${text.slice(0, 180)}...`;
    }

    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json({ summary, type: type || "medium" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to summarize text." });
  }
});

// 15. AI TRANSLATION
productivityRouter.post("/translate", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      res.status(400).json({ error: "Text and targetLanguage are required." });
      return;
    }

    const prompt = `Translate the following text into ${targetLanguage}. Maintain markdown formatting, code blocks, bullet points, tone, and cultural nuance strictly:\n\n${text}`;
    let translated = await generateAIContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    if (!translated) {
      translated = `[Translated to ${targetLanguage}]: ${text}`;
    }

    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json({ translatedText: translated, targetLanguage });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to translate text." });
  }
});

// 16. AI BRAINSTORMING BOARD
productivityRouter.post("/brainstorm", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, category } = req.body;
    if (!topic) {
      res.status(400).json({ error: "Topic is required." });
      return;
    }

    const prompt = `Generate 6-8 innovative, creative brainstorming idea cards for: "${topic}" (${category || "general"}). Output JSON:
{
  "topic": "${topic}",
  "cards": [
    { "title": "Card Title", "description": "2-3 sentences explaining idea", "category": "Strategy|Creative|Execution", "impact": "High|Medium", "feasibility": "Easy|Moderate|Challenging" }
  ]
}`;

    let data: any = null;
    const respText = await generateAIContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      responseMimeType: "application/json",
    });

    if (respText) {
      try {
        const cleaned = respText.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
        data = JSON.parse(cleaned);
      } catch {}
    }

    if (!data || !Array.isArray(data.cards)) {
      data = {
        topic,
        cards: [
          { title: "Direct Audience Engagement", description: "Create weekly interactive Q&A or livestreams focused on community challenges.", category: "Strategy", impact: "High", feasibility: "Easy" },
          { title: "Automated Content Ecosystem", description: "Repurpose each core insight across short video reels, carousels, and email briefings.", category: "Creative", impact: "High", feasibility: "Moderate" },
          { title: "Strategic Co-branding", description: "Partner with complementary micro-influencers to cross-pollinate user bases.", category: "Execution", impact: "Medium", feasibility: "Easy" },
        ],
      };
    }

    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate brainstorming ideas." });
  }
});

// 17. AI OUTLINE GENERATOR
productivityRouter.post("/outline", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, format } = req.body;
    if (!topic) {
      res.status(400).json({ error: "Topic is required." });
      return;
    }

    const selectedFormat = format || "Article";
    const prompt = `Create a structured, professional outline for a ${selectedFormat} on the topic: "${topic}". Include title, hook/introduction, 4-6 detailed sections with subsections, and conclusion/action steps. Output formatted markdown.`;

    let outline = await generateAIContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    if (!outline) {
      outline = `# ${selectedFormat} Outline: ${topic}\n\n## 1. Introduction & Hook\n- Context and background\n- Core premise\n\n## 2. Key Framework\n- Step 1: Foundation\n- Step 2: Implementation\n\n## 3. Practical Case Study\n- Real world application\n- Metrics of success\n\n## 4. Conclusion & Action Checklist`;
    }

    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json({ outline, format: selectedFormat });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate outline." });
  }
});

// 18. AI EMAIL ASSISTANT
productivityRouter.post("/email", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { goal, recipient, keyPoints, tone } = req.body;
    if (!goal) {
      res.status(400).json({ error: "Email goal is required." });
      return;
    }

    const prompt = `Write a polished professional email.
Goal: ${goal}
Recipient: ${recipient || "Business Partner / Client"}
Key points to include: ${keyPoints || "Clear call to action and mutually beneficial proposal"}
Tone: ${tone || "Professional and courteous"}

Output JSON:
{
  "subjectLines": ["Subject Option 1", "Subject Option 2", "Subject Option 3"],
  "body": "Full email text with greeting, clear value proposition, and professional sign-off."
}`;

    let emailData: any = null;
    const respText = await generateAIContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      responseMimeType: "application/json",
    });

    if (respText) {
      try {
        const cleaned = respText.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
        emailData = JSON.parse(cleaned);
      } catch {}
    }

    if (!emailData) {
      emailData = {
        subjectLines: [`Regarding: ${goal}`, `Next steps for ${goal}`, `Connecting regarding ${goal}`],
        body: `Dear ${recipient || "Partner"},\n\nI am reaching out regarding ${goal}.\n\n${keyPoints || "I would love to explore how we can collaborate effectively."}\n\nPlease let me know your availability for a brief conversation this week.\n\nBest regards,\n[Your Name]`,
      };
    }

    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json(emailData);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate email." });
  }
});

// 19. AI SOCIAL MEDIA ASSISTANT
productivityRouter.post("/social", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, platform } = req.body;
    if (!topic) {
      res.status(400).json({ error: "Topic is required." });
      return;
    }

    const selectedPlatform = platform || "LinkedIn";
    let prompt = "";
    if (selectedPlatform === "7-Day Calendar") {
      prompt = `Generate a 7-day social media content calendar for topic: "${topic}". Output JSON:
{
  "days": [
    { "day": "Day 1 - Monday", "theme": "Motivational Hook", "post": "Post copy with hashtags", "mediaIdea": "Image/Video concept" },
    { "day": "Day 2 - Tuesday", "theme": "Educational Tip", "post": "Post copy with hashtags", "mediaIdea": "Carousel slide concept" },
    { "day": "Day 3 - Wednesday", "theme": "Behind the Scenes", "post": "Post copy with hashtags", "mediaIdea": "Video reel" },
    { "day": "Day 4 - Thursday", "theme": "Case Study", "post": "Post copy with hashtags", "mediaIdea": "Infographic" },
    { "day": "Day 5 - Friday", "theme": "Question / Poll", "post": "Post copy with hashtags", "mediaIdea": "Interactive story" },
    { "day": "Day 6 - Saturday", "theme": "Deep Dive", "post": "Post copy with hashtags", "mediaIdea": "Longform breakdown" },
    { "day": "Day 7 - Sunday", "theme": "Weekly Reflection", "post": "Post copy with hashtags", "mediaIdea": "Inspirational quote card" }
  ]
}`;
    } else {
      prompt = `Generate 3 high-engagement post options for ${selectedPlatform} on topic: "${topic}". Include viral hooks, engaging body copy, call-to-action, and relevant hashtags. Output JSON:
{
  "posts": [
    { "option": "Option 1 (Hook Driven)", "content": "Full post text", "hashtags": ["#tag1", "#tag2"] },
    { "option": "Option 2 (Storytelling)", "content": "Full post text", "hashtags": ["#tag1", "#tag2"] },
    { "option": "Option 3 (Actionable Framework)", "content": "Full post text", "hashtags": ["#tag1", "#tag2"] }
  ]
}`;
    }

    let resultData: any = null;
    const respText = await generateAIContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      responseMimeType: "application/json",
    });

    if (respText) {
      try {
        const cleaned = respText.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
        resultData = JSON.parse(cleaned);
      } catch {}
    }

    if (!resultData) {
      if (selectedPlatform === "7-Day Calendar") {
        resultData = {
          days: [
            { day: "Day 1 - Monday", theme: "Strategic Foundation", post: `Start strong with ${topic}. Here's what 99% get wrong... #Strategy #Growth`, mediaIdea: "Bold headline visual" },
            { day: "Day 2 - Tuesday", theme: "Practical Framework", post: `3 steps to optimize ${topic} today: 1. Audit. 2. Automate. 3. Scale. #Productivity`, mediaIdea: "3-step diagram" },
            { day: "Day 3 - Wednesday", theme: "Industry Insight", post: `Why the future of ${topic} is changing faster than you think. #Innovation`, mediaIdea: "Chart graphic" },
          ],
        };
      } else {
        resultData = {
          posts: [
            { option: "Option 1", content: `Here is what nobody tells you about ${topic}: Consistency beats intensity every single time.\n\nWhat is your biggest roadblock?`, hashtags: ["#Growth", "#Strategy"] },
          ],
        };
      }
    }

    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json(resultData);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate social media content." });
  }
});

// 20. AI PROMPT ENHANCER
productivityRouter.post("/enhance-prompt", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required." });
      return;
    }

    const systemPrompt = `You are an expert prompt engineer. Take the user's raw prompt and turn it into a high-performance, structured master prompt. Output JSON:
{
  "originalPrompt": "${prompt.replace(/"/g, '\\"')}",
  "enhancedPrompt": "The comprehensive structured prompt with role, context, instructions, output constraints, and formatting requirements.",
  "role": "Defined expert persona",
  "context": "Context background",
  "keyDirectives": ["Directive 1", "Directive 2", "Directive 3"]
}`;

    let data: any = null;
    const respText = await generateAIContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      responseMimeType: "application/json",
    });

    if (respText) {
      try {
        const cleaned = respText.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
        data = JSON.parse(cleaned);
      } catch {}
    }

    if (!data) {
      data = {
        originalPrompt: prompt,
        enhancedPrompt: `Act as a senior specialist in this domain. Your task is to provide an in-depth, structured solution for:\n\n"${prompt}"\n\nPlease structure your response with: 1. Executive Summary 2. Actionable Step-by-Step Guidance 3. Best Practices & Pitfalls 4. Verification Checklist.`,
        role: "Domain Specialist",
        context: "Strategic execution",
        keyDirectives: ["Provide structured markdown", "Include realistic examples", "Highlight common pitfalls"],
      };
    }

    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to enhance prompt." });
  }
});
