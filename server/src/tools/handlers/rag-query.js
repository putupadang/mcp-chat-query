const prisma = require("../../db/prisma");
const { getEmbedding } = require("../../lib/embeddings");

function cosineSim(a, b) {
  const len = Math.min(a.length, b.length);
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < len; i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
  return dot / denom;
}

const ragQueryHandler = async ({ query, topK = 3 }) => {
  const qVec = await getEmbedding(query);
  const k = Math.max(1, Math.min(Number(topK) || 3, 10));

  // Fetch a reasonable number of chunks (adjust as needed)
  const chunks = await prisma.docChunk.findMany({
    take: 500,
    orderBy: { createdAt: "desc" },
  });

  const scored = chunks
    .map((c) => {
      const sim = cosineSim(qVec, c.embedding || []);
      return { id: c.id, content: c.content, source: c.source, score: sim };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  const context = scored
    .map((c) => `- (${c.score.toFixed(3)}) ${c.content}`)
    .join("\n");

  return {
    query,
    topK: k,
    results: scored,
    context,
  };
};

module.exports = ragQueryHandler;
