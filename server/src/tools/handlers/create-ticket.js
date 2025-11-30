/**
 * Create support ticket tool handler
 * Stores tickets in MongoDB via Prisma
 */
const prisma = require("../../db/prisma");

const createTicketHandler = async ({ title, body, priority = "medium" }) => {
  const ticket = await prisma.ticket.create({
    data: {
      title,
      body,
      priority,
      status: "open",
    },
  });

  return { success: true, ticket };
};

const getTickets = async () => {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
  });
  return tickets;
};

module.exports = { createTicketHandler, getTickets };
