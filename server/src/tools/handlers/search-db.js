/**
 * Search database tool handler
 * Uses Prisma (MongoDB) to query products
 */

const prisma = require("../../db/prisma");

const searchDbHandler = async ({ q, category, limit = 10 }) => {
  const take = Math.max(1, Math.min(Number(limit) || 10, 100));

  const baseWhere = {};
  if (category) baseWhere.category = category;

  // Fetch a larger slice then filter in JS for case-insensitive contains
  const raw = await prisma.product.findMany({
    where: baseWhere,
    take: 200,
    orderBy: { createdAt: "desc" },
  });

  let filtered = raw;
  if (q && typeof q === "string") {
    const query = q.trim().toLowerCase();
    if (query) {
      filtered = raw.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );
    }
  }

  const hits = filtered.slice(0, take);

  return {
    hits,
    total: hits.length,
    query: q,
    category,
  };
};

module.exports = searchDbHandler;
