const { PrismaClient } = require("@prisma/client");
const path = require("path");
const { getEmbedding } = require(path.join("..", "src", "lib", "embeddings"));

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Products
  const products = [
    { name: "Laptop Pro", category: "Electronics", price: 1299 },
    { name: "Wireless Mouse", category: "Electronics", price: 29 },
    { name: "Office Chair", category: "Furniture", price: 299 },
    { name: "Desk Lamp", category: "Furniture", price: 49 },
    { name: "Notebook", category: "Stationery", price: 5 },
  ];

  await prisma.product.deleteMany({});
  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // Seed sample tickets
  await prisma.ticket.deleteMany({});
  await prisma.ticket.create({
    data: {
      title: "Sample ticket 1",
      body: "This is a demo ticket",
      priority: "medium",
      status: "open",
    },
  });

  // Seed RAG DocChunks
  const docs = [
    {
      content:
        "Our Laptop Pro features a high-resolution display, fast SSD storage, and long battery life, ideal for developers and designers.",
      source: "catalog:products:laptop-pro",
    },
    {
      content:
        "Wireless Mouse offers precise tracking and ergonomic design, compatible with Windows and macOS. Battery lasts up to 12 months.",
      source: "catalog:products:wireless-mouse",
    },
    {
      content:
        "Office Chair provides lumbar support and adjustable height. Built with breathable mesh and steel frame for durability.",
      source: "catalog:products:office-chair",
    },
    {
      content:
        "Return policy: Products can be returned within 30 days in original condition with receipt for a full refund.",
      source: "policy:returns",
    },
  ];

  await prisma.docChunk.deleteMany({});
  for (const d of docs) {
    const embedding = await getEmbedding(d.content);
    await prisma.docChunk.create({
      data: { content: d.content, embedding, source: d.source },
    });
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
