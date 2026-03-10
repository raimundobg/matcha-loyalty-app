# 🍵 MatchaLab Rewards — Plataforma de Fidelización QR

Sistema de fidelización digital para matcha bar. Los clientes escanean un QR, registran compras subiendo vouchers, y al juntar 5 tickets canjean un matcha gratis.

## Stack

- **Frontend:** React + Vite + TailwindCSS + React Router + Axios
- **Backend:** Node.js + Express + Prisma ORM + PostgreSQL
- **Auth:** JWT + bcrypt
- **Upload:** Multer + Cloudinary (o local)
- **Deploy:** Railway

## Setup Local

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd matcha-loyalty-app

# Instalar todo
npm run install:all
```

### 2. Configurar base de datos

Tener PostgreSQL corriendo localmente. Crear una DB:

```bash
createdb matcha_loyalty
```

### 3. Variables de entorno

```bash
cp .env.example backend/.env
# Editar backend/.env con tu DATABASE_URL local
```

### 4. Migrar base de datos

```bash
cd backend
npx prisma db push
# o para migraciones formales:
npx prisma migrate deploy
```

### 5. Correr en desarrollo

Terminal 1 — Backend:
```bash
cd backend
npm run dev
```

Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
```

Frontend corre en `http://localhost:5173` con proxy al backend en `:3000`.

## Deploy en Railway

### 1. Crear proyecto en Railway

1. Ir a [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Seleccionar el repo

### 2. Agregar PostgreSQL

1. En el proyecto, click **+ New** → **Database** → **PostgreSQL**
2. Railway setea `DATABASE_URL` automáticamente

### 3. Variables de entorno

En el servicio del app, agregar:

| Variable | Valor |
|---|---|
| `JWT_SECRET` | Un string largo y aleatorio |
| `NODE_ENV` | `production` |
| `CLOUDINARY_CLOUD_NAME` | (opcional) Tu cloud name |
| `CLOUDINARY_KEY` | (opcional) Tu API key |
| `CLOUDINARY_SECRET` | (opcional) Tu API secret |

### 4. Configurar dominio

1. Settings → Networking → Generate Domain
2. O agregar custom domain

### 5. El QR

Generar un QR que apunte a tu URL de Railway, por ejemplo:
```
https://matcha-loyalty.up.railway.app
```

## API Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | No | Registro |
| POST | `/auth/login` | No | Login |
| GET | `/auth/me` | Sí | Perfil + tickets |
| POST | `/purchases` | Sí | Subir voucher (multipart) |
| GET | `/purchases` | Sí | Historial de compras |
| GET | `/tickets` | Sí | Tickets del usuario |
| POST | `/tickets/redeem` | Sí | Canjear 5 tickets |
| GET | `/health` | No | Health check |

## Cloudinary (Opcional)

Sin Cloudinary, las imágenes se guardan localmente en `/backend/uploads/`. Para producción se recomienda Cloudinary:

1. Crear cuenta en [cloudinary.com](https://cloudinary.com)
2. Obtener cloud name, API key y API secret
3. Agregar como variables de entorno

## Estructura

```
matcha-loyalty-app/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── purchases.js
│   │   └── tickets.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── purchaseController.js
│   │   └── ticketController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── validate.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── MatchaBottle.jsx
│   │   │   └── TicketDisplay.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── hooks/
│   │   │   └── useAuth.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── .env.example
├── .gitignore
├── railway.json
├── package.json
└── README.md
```
