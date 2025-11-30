/**
 * Search database tool handler
 * Uses Prisma (MongoDB) to query products
 */

const prisma = require("../../db/prisma");

const searchDbHandler = async ({ q, category, limit = 10 }) => {
  const where = {};

  if (q) {
    where.OR = [{ name: { contains: q } }, { category: { contains: q } }];
  }

  if (category) {
    where.category = category;
  }

  const take = Math.max(1, Math.min(Number(limit) || 10, 100));

  const results = await prisma.product.findMany({
    where,
    take,
    orderBy: { createdAt: "desc" },
  });

  return {
    hits: results,
    total: results.length,
    query: q,
    category,
  };
};

module.exports = searchDbHandler;
