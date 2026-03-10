import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * POST /discount/activate
 * Customer enters a discount code → gets a time-stamped voucher to show in-store.
 * Voucher expires in 30 minutes.
 */
export async function activateVoucher(req, res) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Código es requerido" });
    }

    const discountCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { ambassador: { select: { name: true } } },
    });

    if (!discountCode || !discountCode.active) {
      return res.status(404).json({ error: "Código inválido o inactivo" });
    }

    // Check if user already has an active (non-expired, non-used) voucher for this code
    const userId = req.userId || null;
    if (userId) {
      const existing = await prisma.discountVoucher.findFirst({
        where: {
          userId,
          discountCodeId: discountCode.id,
          used: false,
          expiresAt: { gt: new Date() },
        },
      });
      if (existing) {
        return res.json({
          voucher: {
            id: existing.id,
            code: discountCode.code,
            discountPercent: existing.discountPercent,
            ambassadorName: discountCode.ambassador.name,
            activatedAt: existing.activatedAt,
            expiresAt: existing.expiresAt,
          },
          message: "Ya tienes un voucher activo para este código",
        });
      }
    }

    // Create voucher — expires in 30 minutes
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

    const voucher = await prisma.discountVoucher.create({
      data: {
        userId,
        discountCodeId: discountCode.id,
        discountPercent: discountCode.discountPercent,
        activatedAt: now,
        expiresAt,
      },
    });

    // Increment timesUsed on the discount code
    await prisma.discountCode.update({
      where: { id: discountCode.id },
      data: { timesUsed: { increment: 1 } },
    });

    res.status(201).json({
      voucher: {
        id: voucher.id,
        code: discountCode.code,
        discountPercent: voucher.discountPercent,
        ambassadorName: discountCode.ambassador.name,
        activatedAt: voucher.activatedAt,
        expiresAt: voucher.expiresAt,
      },
    });
  } catch (err) {
    console.error("ActivateVoucher error:", err);
    res.status(500).json({ error: "Error al activar voucher" });
  }
}

/**
 * GET /discount/voucher/:id
 * Check voucher status (for store staff or user).
 */
export async function getVoucher(req, res) {
  try {
    const { id } = req.params;
    const voucher = await prisma.discountVoucher.findUnique({
      where: { id },
      include: {
        discountCode: {
          select: { code: true, ambassador: { select: { name: true } } },
        },
        user: { select: { username: true } },
      },
    });

    if (!voucher) {
      return res.status(404).json({ error: "Voucher no encontrado" });
    }

    const now = new Date();
    const expired = now > voucher.expiresAt;

    res.json({
      voucher: {
        id: voucher.id,
        code: voucher.discountCode.code,
        discountPercent: voucher.discountPercent,
        ambassadorName: voucher.discountCode.ambassador.name,
        username: voucher.user?.username || "Invitado",
        activatedAt: voucher.activatedAt,
        expiresAt: voucher.expiresAt,
        used: voucher.used,
        usedAt: voucher.usedAt,
        expired,
        valid: !voucher.used && !expired,
      },
    });
  } catch (err) {
    console.error("GetVoucher error:", err);
    res.status(500).json({ error: "Error al obtener voucher" });
  }
}
