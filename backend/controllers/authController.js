import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function register(req, res) {
  try {
    const { email, username, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(409).json({ error: `${field} ya registrado` });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, username, passwordHash },
      select: { id: true, email: true, username: true, createdAt: true },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Error al registrar" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { ambassador: { select: { id: true, active: true } } },
    });
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const ticketCount = await prisma.ticket.count({
      where: { userId: user.id, redeemed: false },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAmbassador: !!user.ambassador?.active,
      },
      token,
      ticketCount,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
}

export async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        ambassador: { select: { id: true, active: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const ticketCount = await prisma.ticket.count({
      where: { userId: req.userId, redeemed: false },
    });

    const totalRewards = await prisma.reward.count({
      where: { userId: req.userId },
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        isAmbassador: !!user.ambassador?.active,
      },
      ticketCount,
      totalRewards,
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
}

// POST /auth/forgot-password - Request password reset
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email es obligatorio" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: "Si el email existe, recibirás instrucciones para recuperar tu contraseña." });
    }

    // Generate reset token (valid 1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    // Build reset URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send reset email via Resend
    if (!resend) {
      console.log(`[PASSWORD RESET] Resend not configured. Link: ${resetUrl}`);
    } else {
      console.log(`[PASSWORD RESET] Attempting to send email to: ${email}`);
    }
    try {
      if (resend) await resend.emails.send({
        from: "MatchaLab <rai@zenlab.cl>",
        to: [email],
        subject: "Recupera tu contraseña - MatchaLab",
        html: `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:480px;margin:0 auto;background:#fafaf5;border-radius:16px;overflow:hidden;border:1px solid #e8e6d9">
            <div style="background:#4a7c59;padding:28px 24px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:1px">🍵 MatchaLab</h1>
            </div>
            <div style="padding:32px 24px;text-align:center">
              <h2 style="color:#2d2d2d;font-size:20px;margin:0 0 12px">Recuperar contraseña</h2>
              <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 24px">
                Hiciste una solicitud para restablecer tu contraseña. Haz clic en el botón para crear una nueva.
              </p>
              <a href="${resetUrl}" style="display:inline-block;background:#4a7c59;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;font-size:14px">
                Restablecer contraseña
              </a>
              <p style="color:#999;font-size:12px;margin:24px 0 0;line-height:1.5">
                Este enlace expira en 1 hora.<br>Si no solicitaste esto, ignora este correo.
              </p>
            </div>
            <div style="background:#f0efe6;padding:16px;text-align:center">
              <p style="color:#999;font-size:11px;margin:0">MatchaLab · Santiago, Chile</p>
            </div>
          </div>
        `,
      });
      console.log(`[PASSWORD RESET] Email sent to: ${email}`);
    } catch (emailErr) {
      console.error("[PASSWORD RESET] Email failed:", emailErr);
      // Still log the URL as fallback
      console.log(`[PASSWORD RESET] Fallback link for ${email}: ${resetUrl}`);
    }

    res.json({ message: "Si el email existe, recibirás instrucciones para recuperar tu contraseña." });
  } catch (err) {
    console.error("ForgotPassword error:", err);
    res.status(500).json({ error: "Error al procesar solicitud" });
  }
}

// POST /auth/reset-password - Reset password with token
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token y nueva contraseña son obligatorios" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const user = await prisma.user.findUnique({ where: { resetToken: token } });
    if (!user || !user.resetTokenExp || user.resetTokenExp < new Date()) {
      return res.status(400).json({ error: "Token inválido o expirado. Solicita un nuevo enlace." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExp: null },
    });

    res.json({ message: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión." });
  } catch (err) {
    console.error("ResetPassword error:", err);
    res.status(500).json({ error: "Error al cambiar contraseña" });
  }
}
