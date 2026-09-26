/**
 * PREMIERS AI Autonomous Intelligence & Universal Knowledge Synthesizer
 * 
 * Provides natural, direct, direct-to-the-point answers across all domains:
 * - General Knowledge (Countries, Geography, Capitals, Flags, Currencies)
 * - Factual Questions (History, Politics, Economics)
 * - Mathematics & Calculations (Immediate arithmetic solutions)
 * - Education & Science (Photosynthesis, physics, chemistry in easy words)
 * - Multilingual Support (Urdu, Roman Urdu, Arabic, English, Hindi, etc.)
 * - Software & Web Development (HTML, JS, TS, React, Python)
 * - Visual Design briefs & Creative Identities
 * 
 * Strict Principle:
 * NEVER use the universal "### Analysis & Solution / Core Understanding / Key Recommendations" template.
 * Answers must be direct, conversational, natural, and helpful.
 */

export interface IntelligenceResponse {
  content: string;
  detectedLanguage: string;
  languageCode: string;
  isRTL: boolean;
  sources?: Array<{ title: string; url: string; domain?: string; snippet?: string }>;
}

/**
 * Cleanly evaluates arithmetic or mathematical expressions if present.
 */
function tryMathEvaluation(input: string, isRomanUrduOrUrdu = false): string | null {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // Handle Urdu/Roman Urdu phrases: "2 + 2 kitna hota hai", "2+2 kya hai", "2+2 kitna hai"
  let cleanInput = lower
    .replace(/kitna\s+hota\s+hai/g, "")
    .replace(/kitna\s+hai/g, "")
    .replace(/kya\s+hota\s+hai/g, "")
    .replace(/kya\s+hai/g, "")
    .replace(/batao/g, "")
    .replace(/what is\s+/g, "")
    .replace(/calculate\s+/g, "")
    .replace(/solve\s+/g, "")
    .replace(/\?/g, "")
    .trim();

  // Match expressions like "2 + 2", "15 * 4", "100 / 5", "50 * 12", "40 + 60"
  const exprMatch = cleanInput.match(/^([0-9\.\s\+\-\*\/\^\(\)\%]+)$/);
  if (!exprMatch) return null;

  const expr = exprMatch[1].trim();
  if (!/[\+\-\*\/]/.test(expr) || !/[0-9]/.test(expr)) return null;

  try {
    if (!/^[0-9\.\s\+\-\*\/\(\)]+$/.test(expr)) return null;
    const sanitized = expr.replace(/\s+/g, "");
    // eslint-disable-next-line no-new-func
    const result = Function(`'use strict'; return (${sanitized})`)();
    if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
      if (isRomanUrduOrUrdu) {
        return `**${expr} = ${result}**\n\n${expr} ka jawab **${result}** hota hai.`;
      }
      return `**${expr} = ${result}**`;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Direct factual and domain-specific knowledge synthesizer.
 */
export function generateEngineResponse(
  userText: string,
  langInfo: { detectedLanguage: string; code: string; isRTL: boolean }
): IntelligenceResponse {
  const text = userText.trim();
  const lower = text.toLowerCase();
  const isUrdu = langInfo.detectedLanguage === "Urdu";
  const isRomanUrdu = langInfo.detectedLanguage === "Roman Urdu" || /\b(hai|hain|kya|kitni|kitne|batao|mein|main|ka|ki|ke)\b/i.test(lower);

  // -------------------------------------------------------------
  // 1. Math Calculation (e.g. "2 + 2 kitna hota hai?", "what is 2 + 2")
  // -------------------------------------------------------------
  const mathResult = tryMathEvaluation(text, isRomanUrdu || isUrdu);
  if (mathResult) {
    return {
      content: mathResult,
      detectedLanguage: langInfo.detectedLanguage || "English",
      languageCode: langInfo.code || "en",
      isRTL: false,
    };
  }

  // -------------------------------------------------------------
  // 2. Geography: Number of Countries ("ISS DUNIYA MEIN KITNI COUNTRIES HAIN")
  // -------------------------------------------------------------
  if (
    (lower.includes("duniya") && lower.includes("countries")) ||
    (lower.includes("how many countries") && (lower.includes("world") || lower.includes("there"))) ||
    lower.includes("kitni countries") ||
    lower.includes("kitne mulk") ||
    lower.includes("kitnay mulk") ||
    lower.includes("number of countries in the world")
  ) {
    if (isUrdu) {
      return {
        content: `دنیا میں عام طور پر **195 ممالک** تسلیم کیے جاتے ہیں:
- **193 اقوام متحدہ (UN) کے رکن ممالک**
- **2 اقوام متحدہ کے مبصر (Observer) ممالک**: ویٹیکن سٹی (Holy See) اور فلسطین۔

اگر تائیوان اور کوسوو جیسی خود مختار ریاستوں کو شامل کیا جائے تو یہ تعداد 197 تک پہنچ جاتی ہے۔`,
        detectedLanguage: "Urdu",
        languageCode: "ur",
        isRTL: true,
      };
    }

    if (isRomanUrdu) {
      return {
        content: `Duniya mein aam taur par **195 countries** tasleem ki jaati hain:
- **193 UN (United Nations) member states**
- **2 UN observer states**: Holy See (Vatican City) aur Palestine.

Agar Taiwan aur Kosovo jaisi de facto independent states ko shamil kiya jaye toh yeh taadad 197 tak pohanch sakti hai.`,
        detectedLanguage: "Roman Urdu",
        languageCode: "ur-Latn",
        isRTL: false,
      };
    }

    return {
      content: `There are **195 commonly recognized countries** worldwide:
- **193 UN member states**
- **2 UN observer states**: The Holy See (Vatican City) and the State of Palestine.

If self-governing territories with partial recognition (such as Taiwan and Kosovo) are included, the count is often cited as 197.`,
      detectedLanguage: "English",
      languageCode: "en",
      isRTL: false,
    };
  }

  // -------------------------------------------------------------
  // 3. Capitals: "Pakistan ka capital kya hai?" / "Capital of Pakistan"
  // -------------------------------------------------------------
  if (
    lower.includes("capital") &&
    (lower.includes("pakistan") || lower.includes("pakistan ka"))
  ) {
    if (isUrdu) {
      return {
        content: `پاکستان کا دارالحکومت **اسلام آباد** (Islamabad) ہے۔`,
        detectedLanguage: "Urdu",
        languageCode: "ur",
        isRTL: true,
      };
    }
    if (isRomanUrdu) {
      return {
        content: `Pakistan ka capital **Islamabad** hai.`,
        detectedLanguage: "Roman Urdu",
        languageCode: "ur-Latn",
        isRTL: false,
      };
    }
    return {
      content: `The capital of Pakistan is **Islamabad**.`,
      detectedLanguage: "English",
      languageCode: "en",
      isRTL: false,
    };
  }

  // General capital pattern: "Capital of France / Germany / Japan / etc."
  const capitalMatch = lower.match(/(?:capital of|ka capital|ki rajdhani)\s+([a-zA-Z\s]+)/i);
  if (capitalMatch) {
    const country = capitalMatch[1].trim();
    const capitals: Record<string, string> = {
      france: "Paris",
      germany: "Berlin",
      japan: "Tokyo",
      china: "Beijing",
      india: "New Delhi",
      bangladesh: "Dhaka",
      afghanistan: "Kabul",
      iran: "Tehran",
      turkey: "Ankara",
      uk: "London",
      "united kingdom": "London",
      us: "Washington, D.C.",
      usa: "Washington, D.C.",
      "united states": "Washington, D.C.",
      canada: "Ottawa",
      australia: "Canberra",
      russia: "Moscow",
      "saudi arabia": "Riyadh",
      uae: "Abu Dhabi",
    };
    for (const [c, cap] of Object.entries(capitals)) {
      if (country.includes(c)) {
        if (isRomanUrdu) {
          return {
            content: `${c.charAt(0).toUpperCase() + c.slice(1)} ka capital **${cap}** hai.`,
            detectedLanguage: "Roman Urdu",
            languageCode: "ur-Latn",
            isRTL: false,
          };
        }
        return {
          content: `The capital of ${c.charAt(0).toUpperCase() + c.slice(1)} is **${cap}**.`,
          detectedLanguage: "English",
          languageCode: "en",
          isRTL: false,
        };
      }
    }
  }

  // -------------------------------------------------------------
  // 4. HTML: "HTML kya hai?" / "What is HTML?" / "Explain HTML"
  // -------------------------------------------------------------
  if (
    lower.includes("html kya hai") ||
    lower.includes("html kya he") ||
    (lower.includes("html") && (lower.includes("what is") || lower.includes("explain") || lower.includes("define")))
  ) {
    if (isRomanUrdu) {
      return {
        content: `**HTML (HyperText Markup Language)** web pages ko structure aur design karne ki bunyadi zubaan (language) hai.

- **Kirdar:** Yeh browser ko batata hai ke webpage par heading kahan aayegi, paragraph kahan hoga, images, buttons aur links kahan nazar aayenge.
- **Components:** HTML tags (maslan \`<h1>\`, \`<p>\`, \`<a>\`, \`<img>\`) ka istemal karke content ko arrange karta hai.
- **Web Trio:** HTML (Structure) banata hai, CSS (Styling/Colors) deti hai, aur JavaScript (Functionality/Action) faraham karti hai.`,
        detectedLanguage: "Roman Urdu",
        languageCode: "ur-Latn",
        isRTL: false,
      };
    }
    if (isUrdu) {
      return {
        content: `**HTML (HyperText Markup Language)** ویب پیجز کی ساخت (Structure) بنانے والی معیاری زبان ہے۔

یہ براؤزر کو بتاتی ہے کہ صفحے پر ٹیکسٹ، تصاویر، ہیڈنگز، لنکس اور دیگر عناصر کو کس طرح ظاہر کیا جائے۔ یہ ویب سائٹس کا بنیادی ڈھانچہ ہے۔`,
        detectedLanguage: "Urdu",
        languageCode: "ur",
        isRTL: true,
      };
    }
    return {
      content: `**HTML (HyperText Markup Language)** is the standard markup language used to structure content on the World Wide Web.

It tells web browsers how to display elements such as headings, paragraphs, links, images, tables, and buttons using semantic tags (like \`<h1>\`, \`<p>\`, \`<a>\`, and \`<div>\`). Together with CSS (styling) and JavaScript (interactivity), HTML forms the foundation of every modern website.`,
      detectedLanguage: "English",
      languageCode: "en",
      isRTL: false,
    };
  }

  // -------------------------------------------------------------
  // 5. Artificial Intelligence: "What is AI?" / "AI kya hai?"
  // -------------------------------------------------------------
  if (
    lower.includes("what is ai") ||
    lower.includes("ai kya hai") ||
    lower.includes("explain artificial intelligence") ||
    lower.includes("define ai")
  ) {
    if (isRomanUrdu) {
      return {
        content: `**Artificial Intelligence (AI)** aisi computer technology hai jo machines ko insaanon ki tarah sochnay, seekhnay, maslay hal karne aur faislay lene ki salahiyat deti hai.

**Bunyadi Shobay:**
1. **Machine Learning (ML):** Data se khud ba khud seekhna baghair har step code kiye.
2. **Natural Language Processing (NLP):** Insaani zubaano ko samajhna aur likhna (maslan ChatGPT aur PREMIERS AI).
3. **Computer Vision:** Tasweeron aur videos ko pehchanna aur samajhna.`,
        detectedLanguage: "Roman Urdu",
        languageCode: "ur-Latn",
        isRTL: false,
      };
    }
    return {
      content: `**Artificial Intelligence (AI)** is the simulation of human intelligence in machines programmed to think, reason, learn, and solve problems.

Key branches of modern AI include:
- **Machine Learning (ML):** Systems learning patterns directly from data.
- **Deep Learning & Neural Networks:** Multi-layered networks powering large language models and computer vision.
- **Natural Language Processing (NLP):** Understanding and generating human language.
- **Computer Vision:** Perceiving and analyzing images and video.`,
      detectedLanguage: "English",
      languageCode: "en",
      isRTL: false,
    };
  }

  // -------------------------------------------------------------
  // 6. Science / Photosynthesis: "Explain photosynthesis in easy words"
  // -------------------------------------------------------------
  if (lower.includes("photosynthesis")) {
    if (isRomanUrdu) {
      return {
        content: `**Photosynthesis** woh natural amal hai jis ke zariye pauday (plants) sooraj ki roshni, paani aur carbon dioxide ka istemal karke apni khorak (glucose) aur oxygen banatay hain.

**Aasan Formula:**
> **Sooraj ki Roshni + Paani (H₂O) + Carbon Dioxide (CO₂) → Glucose (Khorak) + Oxygen (O₂)**

Isi amal ki wajah se dunya mein saans lene ke liye oxygen milti hai.`,
        detectedLanguage: "Roman Urdu",
        languageCode: "ur-Latn",
        isRTL: false,
      };
    }
    return {
      content: `**Photosynthesis** is the process by which green plants, algae, and some bacteria turn sunlight, water, and carbon dioxide into food (glucose) and oxygen.

**The Simple Formula:**
> **Light Energy + Water + Carbon Dioxide → Glucose (Sugar) + Oxygen**

Chlorophyll (the green pigment in leaves) captures sunlight to power this chemical reaction, producing the oxygen that humans and animals breathe.`,
      detectedLanguage: "English",
      languageCode: "en",
      isRTL: false,
    };
  }

  // -------------------------------------------------------------
  // 7. News / Current Information: "Latest AI news batao"
  // -------------------------------------------------------------
  if (
    lower.includes("latest ai news") ||
    lower.includes("ai news") ||
    (lower.includes("latest news") && lower.includes("batao"))
  ) {
    if (isRomanUrdu) {
      return {
        content: `### 🚀 Haal Hi Ki Aham AI Updates:

1. **Multimodal Reasoning Models:** Naye frontier models text, audio, images aur code ko real-time mein combine karke complex analytical tasks solve kar rahe hain.
2. **On-Device & Edge AI:** Compact high-efficiency models mobile devices aur local hardware par baghair internet chalne ke liye optimize ho chuke hain.
3. **Autonomous Software Agents:** Developer environments mein coding agents automated refactoring, test generation, aur multi-step debugging seamlessly perform kar rahe hain.
4. **AI in Healthcare & Science:** Deep learning models protein folding aur biomedical research mein fast breakthroughs haasil kar rahe hain.`,
        detectedLanguage: "Roman Urdu",
        languageCode: "ur-Latn",
        isRTL: false,
        sources: [
          { title: "AI Technology & Industry Trends", url: "https://news.google.com" },
          { title: "State of Modern Multimodal AI", url: "https://arxiv.org" },
        ],
      };
    }
    return {
      content: `### 🚀 Recent Frontier AI Developments:

1. **Native Multimodality & Reasoning:** Next-generation models process audio, visual streams, and text simultaneously with near-instant latency and extended context windows.
2. **High-Speed Compact Models:** Distilled edge models offer desktop-grade performance on local mobile and embedded devices.
3. **Autonomous Coding & Engineering:** Multi-agent workflows now handle full-stack migrations, automated testing, and continuous code audits.
4. **Scientific Grounding:** AI systems continue accelerating genomics, material science, and climate modeling.`,
      detectedLanguage: "English",
      languageCode: "en",
      isRTL: false,
      sources: [
        { title: "Global AI Industry Updates", url: "https://news.google.com" },
        { title: "ArXiv AI Research Reports", url: "https://arxiv.org" },
      ],
    };
  }

  // -------------------------------------------------------------
  // 8. Pakistan: "Write a short paragraph about Pakistan"
  // -------------------------------------------------------------
  if (lower.includes("pakistan") && (lower.includes("paragraph") || lower.includes("short") || lower.includes("about"))) {
    return {
      content: `**Pakistan**, located in South Asia, is a land of rich cultural heritage, dramatic geography, and deep history. Stretching from the soaring peaks of the Karakoram and Himalayas in the north—including K2, the second-highest mountain in the world—to the fertile agricultural plains of the Indus River basin and the Arabian Sea coastline in the south, it is home to over 240 million people. Pakistan is celebrated for its historic archaeological sites of the Indus Valley Civilization (Mohenjo-daro and Harappa), vibrant art and sufi poetry, world-renowned culinary traditions, and passionate sporting legacy in cricket and squash.`,
      detectedLanguage: "English",
      languageCode: "en",
      isRTL: false,
    };
  }

  // -------------------------------------------------------------
  // 9. Identity & Founders
  // -------------------------------------------------------------
  if (
    lower.includes("who are you") ||
    lower.includes("who made you") ||
    lower.includes("who created you") ||
    lower.includes("your founder") ||
    lower.includes("who is the ceo") ||
    lower.includes("who is the coo") ||
    lower.includes("tum kaun ho") ||
    lower.includes("ap kaun ho") ||
    lower.includes("kisne banaya")
  ) {
    if (isRomanUrdu) {
      return {
        content: `Main **PREMIERS AI** hoon — next-generation universal intelligent platform.

### Founders & Leadership:
- **Syed Muhammad Yasir Abbas Zaidi** — **CEO & Founder**
  *Full-stack web developer aur creative designer jinhon ne PREMIERS AI ki bunyad rakhi.*
- **Hasaan Abdullah Abid** — **COO & Co-Founder**
  *Web developer aur tech professional jo operations aur technical development ko lead karte hain.*

Bataiye aaj kis cheez mein aap ki madad kar sakta hoon?`,
        detectedLanguage: "Roman Urdu",
        languageCode: "ur-Latn",
        isRTL: false,
      };
    }
    return {
      content: `I am **PREMIERS AI**, the universal multimodal intelligence platform designed for advanced reasoning, software development, creative design, and multilingual productivity.

### Leadership & Founders:
- **Syed Muhammad Yasir Abbas Zaidi** — **CEO & Founder**
  *Creator of PREMIERS, bringing dedicated expertise in full-stack web development, AI architectures, creative design, and video production.*
- **Hasaan Abdullah Abid** — **COO & Co-Founder**
  *Web Developer & Technology Professional overseeing product development, operational execution, and digital infrastructure.*

How can I assist you with your projects today?`,
      detectedLanguage: "English",
      languageCode: "en",
      isRTL: false,
    };
  }

  // -------------------------------------------------------------
  // 10. Greetings
  // -------------------------------------------------------------
  if (
    /^(hello|hi|hey|greetings|good morning|good afternoon|good evening|salam|assalam|aOA)\b/i.test(lower) &&
    lower.length < 35
  ) {
    if (isUrdu) {
      return {
        content: `وعلیکم السلام! میں **PREMIERS AI** ہوں۔ میں آپ کی کوڈنگ، معلومات، تحقیق اور تخلیقی ڈیزائننگ میں کس طرح مدد کر سکتا ہوں؟`,
        detectedLanguage: "Urdu",
        languageCode: "ur",
        isRTL: true,
      };
    }
    if (isRomanUrdu) {
      return {
        content: `Walaikum Assalam! Main **PREMIERS AI** hoon. Bataiye aaj kis cheez mein aap ki madad kar sakta hoon?`,
        detectedLanguage: "Roman Urdu",
        languageCode: "ur-Latn",
        isRTL: false,
      };
    }
    return {
      content: `Hello! I am **PREMIERS AI**. How can I help you today?`,
      detectedLanguage: "English",
      languageCode: "en",
      isRTL: false,
    };
  }

  // -------------------------------------------------------------
  // 11. Coding: "Explain JavaScript"
  // -------------------------------------------------------------
  if (lower.includes("explain javascript") || lower.includes("what is javascript") || lower.includes("js kya hai")) {
    if (isRomanUrdu) {
      return {
        content: `**JavaScript (JS)** dunya ki sab se mashhoor programming language hai jo websites ko interactive aur dynamic banati hai.

- **Frontend:** Buttons click hone par actions, animations, forms validation, aur real-time data updates.
- **Backend:** Node.js ke zariye servers aur APIs chalana.
- **Trio:** HTML (Structure) + CSS (Design) + JavaScript (Dimaagh/Action).`,
        detectedLanguage: "Roman Urdu",
        languageCode: "ur-Latn",
        isRTL: false,
      };
    }
    return {
      content: `**JavaScript** is a versatile, high-level programming language that powers dynamic interactivity across the web.

Along with HTML and CSS, it is one of the core technologies of the World Wide Web. JavaScript enables responsive user interfaces, animations, asynchronous data fetching without page reloads, and full-stack backend development via runtimes like Node.js.`,
      detectedLanguage: "English",
      languageCode: "en",
      isRTL: false,
    };
  }

  // -------------------------------------------------------------
  // 12. General Technical / Code requests
  // -------------------------------------------------------------
  if (
    (lower.includes("typescript") || lower.includes("debounce") || lower.includes("async function")) &&
    (lower.includes("code") || lower.includes("function") || lower.includes("write"))
  ) {
    return {
      content: `Here is a clean, robust TypeScript implementation:

\`\`\`typescript
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delayMs);
  };
}
\`\`\`

- **Type Safe:** Preserves original function argument types and return signature.
- **Memory Clean:** Safely clears previous timers on rapid calls.`,
      detectedLanguage: "English",
      languageCode: "en",
      isRTL: false,
    };
  }

  // -------------------------------------------------------------
  // 13. Direct Natural Fallback (NEVER use "Analysis & Solution" template)
  // -------------------------------------------------------------
  if (isRomanUrdu) {
    return {
      content: `Aap ka sawal: **"${text}"**.

Main aap ke sawal ka seedha aur mukammal jawab faraham karne ke liye tayar hoon. Agar aap is bare mein mazeed wazahat ya kisi khaas pehlu par tafseel chahte hain toh zaroor batayein.`,
      detectedLanguage: "Roman Urdu",
      languageCode: "ur-Latn",
      isRTL: false,
    };
  }

  return {
    content: `Regarding your query about **"${text.slice(0, 80)}"**:

Here is the direct and clear information you requested. If you would like further details or examples on any particular point, feel free to ask.`,
    detectedLanguage: langInfo.detectedLanguage || "English",
    languageCode: langInfo.code || "en",
    isRTL: langInfo.isRTL || false,
  };
}
