import { Router, Request, Response } from "express";
import { optionalAuth } from "../auth";
import { recordUsageMetric } from "../db";
import { generateAIContent } from "../gemini";

export const mediaRouter = Router();

// 45. AI LOGO DESIGNER
mediaRouter.post("/logo", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { brandName, industry, style, colorScheme } = req.body;
    if (!brandName) {
      res.status(400).json({ error: "Brand name is required." });
      return;
    }

    let cleanBrand = String(brandName).trim();
    const namingMatch = cleanBrand.match(/\b(?:naming|named|name is|name:|naam)\s*[:=\-]?\s*([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i);
    if (namingMatch && namingMatch[1].trim()) {
      cleanBrand = namingMatch[1].trim();
    }

    const isGaming = /\bff\b/i.test(cleanBrand) || /gaming|esports|free fire/i.test(industry || "") || /gaming|esports/i.test(style || "");
    const effectiveIndustry = industry || (isGaming ? "Gaming & Competitive Esports" : "Technology & AI");
    const effectiveStyle = style || (isGaming ? "Competitive Esports Warrior Crest" : "Modern Minimalist Vector");

    const prompt = `You are a world-class brand identity designer. Generate a comprehensive 4-concept logo & visual identity architecture for:
Brand Name: "${cleanBrand}"
Industry: ${effectiveIndustry}
Style Preference: ${effectiveStyle}
Color Palette: ${colorScheme || (isGaming ? "Fiery Crimson, Ember Gold, Cyber Cyan, Titanium Dark" : "Emerald Teal, Deep Slate, Pure White")}

Output JSON only:
{
  "concepts": [
    {
      "name": "Concept 1: Primary Emblem Crest",
      "symbolDescription": "Detailed visual description of the vector icon/mark silhouette and negative space",
      "typography": "Font pairings and kerning advice",
      "colors": ["#ff5500", "#12080a", "#00ffff"],
      "imageGenPrompt": "Exact prompt to render this logo with optical clarity"
    },
    {
      "name": "Concept 2: Geometric Monogram",
      "symbolDescription": "Monogram visual description with diamond facets",
      "typography": "Typography styling with balanced kerning",
      "colors": ["#00d4a0", "#0a0c12", "#ffffff"],
      "imageGenPrompt": "Geometric vector monogram prompt for image generation"
    },
    {
      "name": "Concept 3: Combination Mark",
      "symbolDescription": "Vector icon over balanced horizontal wordmark",
      "typography": "Clean geometric sans with wide tracking",
      "colors": ["#38bdf8", "#0f172a", "#f8fafc"],
      "imageGenPrompt": "Modern combination mark prompt"
    },
    {
      "name": "Concept 4: Tournament Insignia Seal",
      "symbolDescription": "Hexagonal seal badge with micro-metric borders",
      "typography": "Heavyweight industrial display typeface",
      "colors": ["#e2b144", "#18181c", "#fafafa"],
      "imageGenPrompt": "Tournament seal badge prompt"
    }
  ],
  "brandPhilosophy": "A 2-sentence rationale explaining the emotional resonance and profile-picture recognition of this identity."
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

    if (!data) {
      data = {
        concepts: [
          {
            name: "Modern Minimalist Icon",
            symbolDescription: `Sleek intersecting geometric vectors representing speed and intelligence for ${brandName}.`,
            typography: "Plus Jakarta Sans Bold with 0.1em tracking",
            colors: ["#00d4a0", "#0a0f1d", "#f8fafc"],
            imageGenPrompt: `Minimalist modern vector logo for "${brandName}", vector graphic, isolated on pure white background, flat design, award winning identity design`,
          },
        ],
        brandPhilosophy: `${brandName} conveys reliability, forward-looking innovation, and premium elegance.`,
      };
    }

    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate logo concept." });
  }
});

// 47. IMAGE-TO-PROMPT REVERSE ENGINEER
mediaRouter.post("/reverse-prompt", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64, description } = req.body;
    if (!imageBase64 && !description) {
      res.status(400).json({ error: "Image data or description is required." });
      return;
    }

    const prompt = `You are a master digital visual artist and prompt engineer. Analyze this visual concept/image and reverse-engineer the exact prompt that would recreate it in high fidelity.
Input description: ${description || "Provided image"}

Output JSON only:
{
  "optimizedPrompt": "Full high-detail master prompt with subject, camera, lighting, atmosphere, and rendering engine tags",
  "style": "Photorealistic|Cinematic 3D|Cyberpunk|Oil Painting|Anime",
  "lighting": "Volumetric rays, golden hour, neon rim light",
  "cameraAngle": "Wide angle, 85mm lens, f/1.4 depth of field",
  "negativePrompt": "blurry, low quality, distorted, extra limbs, watermark"
}`;

    let result: any = null;
    const respText = await generateAIContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      responseMimeType: "application/json",
    });

    if (respText) {
      try {
        const cleaned = respText.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
        result = JSON.parse(cleaned);
      } catch {}
    }

    if (!result) {
      result = {
        optimizedPrompt: `Ultra-detailed, masterpiece visual of ${description || "a futuristic scene"}, cinematic lighting, 8k resolution, photorealistic, octane render, Unreal Engine 5, crisp focus`,
        style: "Cinematic 3D",
        lighting: "Dramatic ambient rim lighting",
        cameraAngle: "Eye-level 50mm portrait perspective",
        negativePrompt: "lowres, text, watermark, artifacts, deformed",
      };
    }

    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to reverse engineer prompt." });
  }
});

// 48. STYLE PRESETS
mediaRouter.get("/styles", (req: Request, res: Response): void => {
  const styles = [
    { id: "photorealistic", name: "Photorealistic 8K", description: "Crisp studio photography, natural daylight, high dynamic range", modifier: "hyper-detailed photograph, 85mm f/1.4 lens, 8k, photorealistic" },
    { id: "cyberpunk", name: "Cyberpunk Neon", description: "Futuristic neon lighting, rainy reflections, moody atmosphere", modifier: "cyberpunk aesthetic, vibrant neon reflections, atmospheric fog, high tech city" },
    { id: "anime", name: "Makoto Shinkai Anime", description: "Lush skies, luminous clouds, vibrant color saturation", modifier: "Makoto Shinkai style, vibrant animated masterpiece, stunning cloudscape, crisp linework" },
    { id: "watercolor", name: "Expressive Watercolor", description: "Fluid organic brushstrokes, soft paper texture, artistic color bleed", modifier: "expressive watercolor painting, wet-on-wet technique, textured cold press paper" },
    { id: "pixar_3d", name: "Pixar 3D Animation", description: "Smooth stylized 3D characters, warm expressive lighting", modifier: "Pixar 3D animation style, adorable characters, subsurface scattering, soft studio lighting" },
    { id: "minimalist_vector", name: "Flat Vector Art", description: "Clean lines, geometric harmony, modern pastel palette", modifier: "clean minimalist vector illustration, flat colors, trending on Dribbble, SVG aesthetic" },
    { id: "oil_painting", name: "Renaissance Oil Painting", description: "Rich chiaroscuro lighting, deep textures, timeless classical feel", modifier: "classical Renaissance oil painting, dramatic chiaroscuro lighting, textured canvas" },
    { id: "isometric_3d", name: "Isometric 3D Room", description: "Cutaway miniature diorama, cute miniature props, ambient occlusion", modifier: "cute low poly isometric 3D diorama, Blender render, soft clay materials, ambient lighting" }
  ];
  res.json({ styles });
});

// 46. PRODUCT SHOWCASE CREATOR
mediaRouter.post("/product-showcase", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { productName, category, backdropSetting } = req.body;
    if (!productName) {
      res.status(400).json({ error: "Product name is required." });
      return;
    }

    const prompt = `Create 3 luxury commercial advertising photography prompts for the product: "${productName}" (${category || "Consumer Goods"}).
Backdrop style: ${backdropSetting || "Minimalist floating marble podium with warm studio rim light"}.
Include camera lens, lighting setups, and composition instructions. Output JSON only:
{
  "product": "${productName}",
  "shots": [
    { "type": "Hero Podium Shot", "prompt": "Exact generative prompt", "recommendedAspect": "1:1" },
    { "type": "Lifestyle In-Use Shot", "prompt": "Exact generative prompt", "recommendedAspect": "16:9" },
    { "type": "Macro Detail Close-up", "prompt": "Exact generative prompt", "recommendedAspect": "4:5" }
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

    if (!data) {
      data = {
        product: productName,
        shots: [
          { type: "Hero Podium", prompt: `Commercial product photography of ${productName}, resting on smooth circular travertine stone, soft morning sunlight, shallow depth of field, premium luxury advertising`, recommendedAspect: "1:1" },
        ],
      };
    }

    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate product showcase." });
  }
});
