import fs from 'fs/promises';
import ai, { AI_MODEL } from '../configs/gemini.js';

const CATEGORY_OPTIONS = ['Vegetables', 'Fruits', 'Drinks', 'Instant', 'Dairy', 'Bakery', 'Grains'];

const IMAGE_MIME_BY_EXT = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
};

// ─── POST /api/product/generate ───────────────────────────────────────────────

export const generateProductContent = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    const promptText =
      `You are helping a seller list a grocery product on an e-commerce site.\n` +
      `Product name: "${name.trim()}"\n\n` +
      `Return a JSON object with this exact shape:\n` +
      `{\n` +
      `  "description": ["bullet point 1", "bullet point 2", "bullet point 3"],\n` +
      `  "category": "one of: ${CATEGORY_OPTIONS.join(', ')}",\n` +
      `  "tags": ["short", "lowercase", "search", "keywords"]\n` +
      `}\n\n` +
      `Rules:\n` +
      `- description: 3-5 short, factual, appealing bullet points a shopper would find useful (no pricing, no emojis).\n` +
      `- category: must be exactly one of the listed options, pick the closest match.\n` +
      `- tags: 4-8 lowercase single/two-word search keywords (synonyms, use-cases, dietary notes if visually obvious), no duplicates of the product name itself.`;

    const parts = [];

    if (req.file) {
      const ext = '.' + req.file.originalname.split('.').pop().toLowerCase();
      const mimeType = IMAGE_MIME_BY_EXT[ext];

      if (mimeType) {
        const imageBuffer = await fs.readFile(req.file.path);
        parts.push({
          inlineData: {
            mimeType,
            data: imageBuffer.toString('base64'),
          },
        });
      }
    }

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: parts,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = (response.text || '')
      .trim()
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return res.status(502).json({ success: false, message: 'AI returned an unexpected format, please try again' });
    }

    const description = Array.isArray(parsed.description) ? parsed.description.filter(Boolean) : [];
    const category = CATEGORY_OPTIONS.includes(parsed.category) ? parsed.category : '';
    const tags = Array.isArray(parsed.tags) ? parsed.tags.filter(Boolean) : [];

    return res.json({ success: true, description, category, tags });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    // Multer's diskStorage leaves a temp file behind — clean it up either way.
    if (req.file?.path) {
      fs.unlink(req.file.path).catch(() => {});
    }
  }
};
