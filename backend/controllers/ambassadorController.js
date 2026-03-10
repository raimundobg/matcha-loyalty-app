import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * Register current user as an ambassador.
 */
export async function registerAmbassador(req, res) {
  try {
    const existing = await prisma.ambassador.findUnique({
      where: { userId: req.userId },
    });
    if (existing) {
      return res.status(400).json({ error: "Ya eres embajador" });
    }

    const { name, instagram, phone } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nombre es requerido" });
    }

    const ambassador = await prisma.ambassador.create({
      data: {
        userId: req.userId,
        name,
        instagram: instagram || null,
        phone: phone || null,
      },
    });

    res.status(201).json({ ambassador });
  } catch (err) {
    console.error("RegisterAmbassador error:", err);
    res.status(500).json({ error: "Error al registrar embajador" });
  }
}

/**
 * Get ambassador profile + stats for the logged-in user.
 */
export async function getAmbassadorDashboard(req, res) {
  try {
    const ambassador = await prisma.ambassador.findUnique({
      where: { userId: req.userId },
      include: {
        discountCodes: {
          orderBy: { createdAt: "desc" },
        },
        commissions: {
          orderBy: { createdAt: "desc" },
          include: { discountCode: { select: { code: true } } },
        },
      },
    });

    if (!ambassador) {
      return res.status(404).json({ error: "No eres embajador aún" });
    }

    const totalCommission = ambassador.commissions.reduce(
      (sum, c) => sum + c.commissionAmount,
      0
    );
    const totalReferrals = ambassador.commissions.length;
    const totalCodesUsed = ambassador.discountCodes.reduce(
      (sum, dc) => sum + dc.timesUsed,
      0
    );

    res.json({
      ambassador: {
        id: ambassador.id,
        name: ambassador.name,
        instagram: ambassador.instagram,
        active: ambassador.active,
        createdAt: ambassador.createdAt,
      },
      codes: ambassador.discountCodes,
      commissions: ambassador.commissions,
      stats: {
        totalCommission,
        totalReferrals,
        totalCodesUsed,
      },
    });
  } catch (err) {
    console.error("GetAmbassadorDashboard error:", err);
    res.status(500).json({ error: "Error al obtener dashboard" });
  }
}

/**
 * Generate a new discount code for the ambassador.
 */
export async function generateCode(req, res) {
  try {
    const ambassador = await prisma.ambassador.findUnique({
      where: { userId: req.userId },
    });
    if (!ambassador) {
      return res.status(404).json({ error: "No eres embajador" });
    }

    // Generate a unique code: MATCHA-<random>
    const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    const code = `MATCHA-${suffix}`;

    const discountCode = await prisma.discountCode.create({
      data: {
        ambassadorId: ambassador.id,
        code,
        discountPercent: 10,
      },
    });

    res.status(201).json({ discountCode });
  } catch (err) {
    console.error("GenerateCode error:", err);
    res.status(500).json({ error: "Error al generar código" });
  }
}

/**
 * Toggle a discount code active/inactive.
 */
export async function toggleCode(req, res) {
  try {
    const ambassador = await prisma.ambassador.findUnique({
      where: { userId: req.userId },
    });
    if (!ambassador) {
      return res.status(404).json({ error: "No eres embajador" });
    }

    const { codeId } = req.params;
    const existing = await prisma.discountCode.findUnique({
      where: { id: codeId },
    });

    if (!existing || existing.ambassadorId !== ambassador.id) {
      return res.status(404).json({ error: "Código no encontrado" });
    }

    const updated = await prisma.discountCode.update({
      where: { id: codeId },
      data: { active: !existing.active },
    });

    res.json({ discountCode: updated });
  } catch (err) {
    console.error("ToggleCode error:", err);
    res.status(500).json({ error: "Error al actualizar código" });
  }
}

/**
 * Public endpoint: validate a discount code.
 * Returns discount info if code is valid and active.
 */
export async function validateCode(req, res) {
  try {
    const { code } = req.params;
    const discountCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { ambassador: { select: { name: true } } },
    });

    if (!discountCode || !discountCode.active) {
      return res.status(404).json({ valid: false, error: "Código inválido o inactivo" });
    }

    res.json({
      valid: true,
      code: discountCode.code,
      discountPercent: discountCode.discountPercent,
      ambassadorName: discountCode.ambassador.name,
    });
  } catch (err) {
    console.error("ValidateCode error:", err);
    res.status(500).json({ error: "Error al validar código" });
  }
}
