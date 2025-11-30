const OpenAI = require("openai");

async function getEmbedding(text) {
  const fallback = () => {
    const dim = 256;
    const vec = new Array(dim).fill(0);
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      const idx = (c + i) % dim;
      vec[idx] += ((c % 31) + 1) / 31;
    }
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map((v) => v / norm);
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const client = new OpenAI({ apiKey });
      const model =
        process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
      const resp = await client.embeddings.create({ model, input: text });
      return resp.data[0].embedding;
    } catch (e) {
      return fallback();
    }
  }
  return fallback();
}

module.exports = { getEmbedding };
