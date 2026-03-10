import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const EMAIL_FROM = "MatchaLab <rai@zenlab.cl>";

function emailLayout(content) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background: #f8faf5; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #5a7a3a, #7a9f4a); padding: 32px 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 26px; letter-spacing: 0.5px;">MatchaLab</h1>
        <p style="color: #e8f0d8; margin: 8px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Programa de Embajadores</p>
      </div>
      <div style="padding: 32px 24px;">
        ${content}
      </div>
      <div style="padding: 20px 24px; text-align: center; border-top: 1px solid #e4ecd4;">
        <p style="color: #9aaa8a; font-size: 11px; margin: 0;">MatchaLab Santiago &mdash; Programa de Embajadores</p>
        <p style="color: #b8c8a8; font-size: 10px; margin: 6px 0 0;">Este email fue enviado porque postulaste al programa de embajadores.</p>
      </div>
    </div>
  `;
}

function approvalEmailHtml({ name, email, username, password, loginUrl }) {
  const credentialsBlock = password
    ? `
      <div style="background: #fff; border: 1px solid #d4e4c4; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
        <p style="color: #4a5a3a; margin: 0 0 12px; font-size: 14px; font-weight: 600;">Tus credenciales de acceso:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #7a8a6a; font-size: 13px; width: 100px;">Email:</td>
            <td style="padding: 6px 0; color: #2d3a1e; font-weight: 600; font-size: 13px;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #7a8a6a; font-size: 13px;">Usuario:</td>
            <td style="padding: 6px 0; color: #2d3a1e; font-weight: 600; font-size: 13px;">${username}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #7a8a6a; font-size: 13px;">Contrase&ntilde;a:</td>
            <td style="padding: 6px 0; color: #2d3a1e; font-weight: 600; font-size: 13px;">${password}</td>
          </tr>
        </table>
      </div>
      <p style="color: #7a8a6a; font-size: 12px; margin: 0 0 24px;">
        Te recomendamos cambiar tu contrase&ntilde;a despu&eacute;s de iniciar sesi&oacute;n.
      </p>
    `
    : `
      <div style="background: #fff; border: 1px solid #d4e4c4; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
        <p style="color: #4a5a3a; margin: 0; font-size: 14px;">
          Ya ten&iacute;as una cuenta en MatchaLab. Usa tus credenciales actuales para acceder a tu nuevo panel de embajador.
        </p>
      </div>
    `;

  return emailLayout(`
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; background: #e8f5d0; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 28px;">&#127861;</div>
    </div>
    <h2 style="color: #2d3a1e; margin: 0 0 8px; font-size: 22px; text-align: center;">&iexcl;Felicidades, ${name}!</h2>
    <p style="color: #5a7a3a; text-align: center; margin: 0 0 24px; font-size: 15px; font-weight: 600;">Tu postulaci&oacute;n ha sido aprobada</p>
    <p style="color: #4a5a3a; line-height: 1.7; margin: 0 0 8px; font-size: 14px;">
      Nos alegra mucho que quieras ser parte de nuestra comunidad. A partir de ahora eres oficialmente embajador/a de MatchaLab.
    </p>
    <p style="color: #4a5a3a; line-height: 1.7; margin: 0 0 24px; font-size: 14px;">
      Ya puedes acceder a tu panel para generar c&oacute;digos de descuento exclusivos, compartirlos con tu comunidad y ganar comisiones por cada venta referida.
    </p>
    ${credentialsBlock}
    <div style="text-align: center; margin-top: 8px;">
      <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #5a7a3a, #7a9f4a); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-weight: 600; font-size: 15px;">
        Ir a mi panel de embajador
      </a>
    </div>
    <p style="color: #9aaa8a; font-size: 12px; text-align: center; margin: 20px 0 0;">
      &iquest;Dudas? Resp&oacute;ndenos a este email y te ayudamos.
    </p>
  `);
}

function rejectionEmailHtml({ name }) {
  return emailLayout(`
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; background: #f0ead8; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 28px;">&#128154;</div>
    </div>
    <h2 style="color: #2d3a1e; margin: 0 0 8px; font-size: 22px; text-align: center;">Hola, ${name}</h2>
    <p style="color: #7a8a6a; text-align: center; margin: 0 0 24px; font-size: 15px; font-weight: 500;">Gracias por tu inter&eacute;s en nuestro programa</p>
    <p style="color: #4a5a3a; line-height: 1.7; margin: 0 0 16px; font-size: 14px;">
      Antes que nada, queremos agradecerte por tomarte el tiempo de postular al programa de embajadores de MatchaLab. Nos encanta ver personas apasionadas que quieren ser parte de nuestra comunidad.
    </p>
    <p style="color: #4a5a3a; line-height: 1.7; margin: 0 0 16px; font-size: 14px;">
      Lamentablemente, en esta oportunidad no pudimos aprobar tu postulaci&oacute;n. Esto no significa un &ldquo;no&rdquo; definitivo &mdash; nuestro programa evoluciona constantemente y siempre estamos buscando nuevas caras.
    </p>
    <p style="color: #4a5a3a; line-height: 1.7; margin: 0 0 24px; font-size: 14px;">
      <strong style="color: #5a7a3a;">No te desanimes.</strong> Contamos contigo siempre como parte de la familia MatchaLab. Te invitamos a seguir disfrutando de nuestros productos y a volver a postular m&aacute;s adelante.
    </p>
    <div style="background: #fff; border: 1px solid #e4ecd4; border-radius: 12px; padding: 20px; margin: 0 0 24px; text-align: center;">
      <p style="color: #5a7a3a; margin: 0 0 4px; font-size: 14px; font-weight: 600;">&#128140; Mientras tanto...</p>
      <p style="color: #4a5a3a; margin: 0; font-size: 13px; line-height: 1.6;">
        S&iacute;guenos en Instagram para estar al tanto de futuras convocatorias y novedades.
      </p>
    </div>
    <p style="color: #9aaa8a; font-size: 12px; text-align: center; margin: 0;">
      Con cari&ntilde;o, el equipo de MatchaLab &#127811;
    </p>
  `);
}

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

    // Send welcome email to the new ambassador
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const loginUrl = `${frontendUrl}/login`;

    try {
      if (resend) await resend.emails.send({
        from: EMAIL_FROM,
        to: [application.email],
        subject: "Bienvenido al equipo de embajadores de MatchaLab",
        html: approvalEmailHtml({
          name: application.name,
          email: user.email,
          username: user.username,
          password: generatedPassword,
          loginUrl,
        }),
      });
      console.log(`Welcome email sent to ${application.email}`);
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
    }

    res.json({
      message: "Embajador aprobado y cuenta creada",
      credentials: {
        email: user.email,
        username: user.username,
        password: generatedPassword || "(usuario existente, usa su contraseña actual)",
      },
      ambassador,
      emailSent: true,
      note: generatedPassword
        ? "Credenciales enviadas por email al embajador"
        : "El usuario ya tenía cuenta. Se le notificó por email.",
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

    // Send rejection email
    try {
      if (resend) await resend.emails.send({
        from: EMAIL_FROM,
        to: [application.email],
        subject: "Actualización sobre tu postulación - MatchaLab",
        html: rejectionEmailHtml({ name: application.name }),
      });
      console.log(`Rejection email sent to ${application.email}`);
    } catch (emailErr) {
      console.error("Failed to send rejection email:", emailErr);
    }

    res.json({ message: "Postulación rechazada", application, emailSent: true });
  } catch (err) {
    console.error("RejectApplication error:", err);
    res.status(500).json({ error: "Error al rechazar postulación" });
  }
}

// POST /admin/reset-password - Generate reset link for any user (admin only)
export async function adminResetPassword(req, res) {
  if (!checkAdmin(req, res)) return;

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email es obligatorio" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h for admin-generated

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    res.json({
      message: "Link de recuperación generado",
      resetUrl,
      email: user.email,
      expiresIn: "24 horas",
    });
  } catch (err) {
    console.error("AdminResetPassword error:", err);
    res.status(500).json({ error: "Error al generar link de reset" });
  }
}
