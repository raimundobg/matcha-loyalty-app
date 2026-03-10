export function validateRegister(req, res, next) {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }

  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: "Username debe tener entre 3 y 30 caracteres" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password debe tener al menos 6 caracteres" });
  }

  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y password son obligatorios" });
  }

  next();
}
