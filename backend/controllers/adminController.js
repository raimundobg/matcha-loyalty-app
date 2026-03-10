import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

// Simple admin auth via ADMIN_SECRET env var
function checkAdmin(req, res) {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: "No autorizado" });
    return false;
  }
  return true;
}

// POST /admin/applications - Submit ambassador application (public)
export async function submitApplication(req, res) {
  try {
    const { name, email, instagram, followers, message } = req.body;

    if (!name || !email || !instagram) {
      return res.status(400).json({ error: "Nombre, email e Instagram son obligatorios" });
    }

    // Check for duplicate pending application
    const existing = await prisma.ambassadorApplication.findFirst({
      where: { email, status: "pending" },
    });
    if (existing) {
      return res.status(400).json({ error: "Ya tienes una postulación pendiente" });
    }

    const application = await prisma.ambassadorApplication.create({
      data: { name, email, instagram, followers, message },
    });

    res.status(201).json({ message: "Postulación recibida. Te contactaremos pronto.", application });
  } catch (err) {
    console.error("SubmitApplication error:", err);
    res.status(500).json({ error: "Error al enviar postulación" });
  }
}

// GET /admin/applications - List all applications (admin only)
export async function listApplications(req, res) {
  if (!checkAdmin(req, res)) return;

  try {
    const status = req.query.status || undefined;
    const applications = await prisma.ambassadorApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
    res.json({ applications });
  } catch (err) {
    console.error("ListApplications error:", err);
    res.status(500).json({ error: "Error al listar postulaciones" });
  }
}

// POST /admin/applications/:id/approve - Approve and create ambassador account
export async function approveApplication(req, res) {
  if (!checkAdmin(req, res)) return;

  try {
    const { id } = req.params;

    const application = await prisma.ambassadorApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return res.status(404).json({ error: "Postulación no encontrada" });
    }
    if (application.status !== "pending") {
      return res.status(400).json({ error: `Postulación ya fue ${application.status}` });
    }

    // Check if user with this email already exists
    let user = await prisma.user.findUnique({
      where: { email: application.email },
    });

    let generatedPassword = null;

    if (!user) {
      // Generate a random password
      generatedPassword = crypto.randomBytes(4).toString("hex"); // 8 char password
      const passwordHash = await bcrypt.hash(generatedPassword, 10);

      // Create username from instagram handle (remove @)
      const username = application.instagram.replace("@", "").toLowerCase();

      // Check if username is taken
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      const finalUsername = existingUsername
        ? `${username}${Math.floor(Math.random() * 1000)}`
        : username;

      user = await prisma.user.create({
        data: {
          email: application.email,
          username: finalUsername,
          passwordHash,
        },
      });
    }

    // Check if already an ambassador
    const existingAmbassador = await prisma.ambassador.findUnique({
      where: { userId: user.id },
    });

    if (existingAmbassador) {
      // Update application status
      await prisma.ambassadorApplication.update({
        where: { id },
        data: { status: "approved", reviewedAt: new Date() },
      });

      return res.json({
        message: "Usuario ya era embajador. Postulación marcada como aprobada.",
        credentials: {
          email: user.email,
          username: user.username,
          password: generatedPassword || "(usuario existente, usa su contraseña actual)",
        },
      });
    }

    // Create ambassador profile
    const ambassador = await prisma.ambassador.create({
      data: {
        userId: user.id,
        name: application.name,
        instagram: application.instagram,
        phone: null,
      },
    });

    // Update application status
    await prisma.ambassadorApplication.update({
      where: { id },
      data: { status: "approved", reviewedAt: new Date() },
    });

    res.json({
      message: "Embajador aprobado y cuenta creada",
      credentials: {
        email: user.email,
        username: user.username,
        password: generatedPassword || "(usuario existente, usa su contraseña actual)",
      },
      ambassador,
      note: generatedPassword
        ? "Envía estas credenciales al embajador por email o Instagram"
        : "El usuario ya tenía cuenta. Solo se le asignó rol de embajador.",
    });
  } catch (err) {
    console.error("ApproveApplication error:", err);
    res.status(500).json({ error: "Error al aprobar postulación" });
  }
}

// GET /admin/ambassadors - List all ambassadors with full metrics (admin only)
export async function listAmbassadors(req, res) {
  if (!checkAdmin(req, res)) return;

  try {
    const ambassadors = await prisma.ambassador.findMany({
      include: {
        user: { select: { email: true, username: true } },
        discountCodes: {
          select: { id: true, code: true, active: true, timesUsed: true, discountPercent: true },
        },
        commissions: {
          select: { saleAmount: true, commissionAmount: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = ambassadors.map((amb) => {
      const totalRevenue = amb.commissions.reduce((sum, c) => sum + c.saleAmount, 0);
      const totalCommission = amb.commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
      const totalCodesUsed = amb.discountCodes.reduce((sum, dc) => sum + dc.timesUsed, 0);
      return {
        id: amb.id,
        name: amb.name,
        instagram: amb.instagram,
        phone: amb.phone,
        active: amb.active,
        createdAt: amb.createdAt,
        email: amb.user.email,
        username: amb.user.username,
        codes: amb.discountCodes,
        stats: {
          totalRevenue,
          totalCommission,
          totalReferrals: amb.commissions.length,
          totalCodesUsed,
          activeCodes: amb.discountCodes.filter((dc) => dc.active).length,
        },
      };
    });

    // Global stats
    const globalStats = {
      totalAmbassadors: ambassadors.length,
      totalRevenue: result.reduce((s, a) => s + a.stats.totalRevenue, 0),
      totalCommissions: result.reduce((s, a) => s + a.stats.totalCommission, 0),
      totalReferrals: result.reduce((s, a) => s + a.stats.totalReferrals, 0),
    };

    res.json({ ambassadors: result, globalStats });
  } catch (err) {
    console.error("ListAmbassadors error:", err);
    res.status(500).json({ error: "Error al listar embajadores" });
  }
}

// POST /admin/applications/:id/reject
export async function rejectApplication(req, res) {
  if (!checkAdmin(req, res)) return;

  try {
    const { id } = req.params;

    const application = await prisma.ambassadorApplication.update({
      where: { id },
      data: { status: "rejected", reviewedAt: new Date() },
    });

    res.json({ message: "Postulación rechazada", application });
  } catch (err) {
    console.error("RejectApplication error:", err);
    res.status(500).json({ error: "Error al rechazar postulación" });
  }
}
