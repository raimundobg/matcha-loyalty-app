import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    const user = await prisma.user.findUnique({ where: { email } });
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
      select: { id: true, email: true, username: true, createdAt: true },
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

    res.json({ user, ticketCount, totalRewards });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
}
