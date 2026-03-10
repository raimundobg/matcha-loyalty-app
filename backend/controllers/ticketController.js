import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TICKETS_TO_REDEEM = 3;

export async function getTickets(req, res) {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });

    const available = tickets.filter((t) => !t.redeemed).length;
    const redeemed = tickets.filter((t) => t.redeemed).length;

    res.json({ tickets, available, redeemed, total: tickets.length });
  } catch (err) {
    console.error("GetTickets error:", err);
    res.status(500).json({ error: "Error al obtener tickets" });
  }
}

export async function redeemTickets(req, res) {
  try {
    const availableTickets = await prisma.ticket.findMany({
      where: { userId: req.userId, redeemed: false },
      orderBy: { createdAt: "asc" },
      take: TICKETS_TO_REDEEM,
    });

    if (availableTickets.length < TICKETS_TO_REDEEM) {
      return res.status(400).json({
        error: `Necesitas ${TICKETS_TO_REDEEM} tickets para canjear. Tienes ${availableTickets.length}.`,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const ticketIds = availableTickets.map((t) => t.id);

      await tx.ticket.updateMany({
        where: { id: { in: ticketIds } },
        data: { redeemed: true },
      });

      const reward = await tx.reward.create({
        data: {
          userId: req.userId,
          ticketsUsed: TICKETS_TO_REDEEM,
        },
      });

      return reward;
    });

    const remaining = await prisma.ticket.count({
      where: { userId: req.userId, redeemed: false },
    });

    res.json({
      reward: result,
      message: "¡Tu 4to matcha es gratis! Disfrútalo.",
      ticketsRemaining: remaining,
    });
  } catch (err) {
    console.error("RedeemTickets error:", err);
    res.status(500).json({ error: "Error al canjear" });
  }
}
