const { PrismaClient } = require("@prisma/client");

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
