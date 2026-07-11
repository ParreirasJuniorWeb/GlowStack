// 1. SEMPRE A PRIMEIRA LINHA DO SISTEMA (Fundamental)
import "dotenv/config";

// 2. Demais importações do ecossistema
import express from "express";
import cors from "cors";

// 3. Importação das rotas modulares
import webhookRoutes from "./routes/webhookRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import { rateLimit } from "express-rate-limit";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: [
        "https://glow-stack-original.vercel.app/", // 👈 COLE AQUI A URL OFICIAL GERADA PELA VERCEL
        "http://localhost:5173", // Mantém o acesso local para seus testes
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
      message:
        "Muitas tentativas de login vindas deste IP. Tente novamente após 15 minutos.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // 1. Rota do Webhook declarada ANTES do middleware global de JSON
  app.use(webhookRoutes);

  // 2. Middleware global de parse de JSON aplicado para as demais rotas
  app.use(express.json());

  // 3. Rotas auxiliares e de domínio
  app.use(logRoutes);
  app.use(checkoutRoutes);
  app.use("/admin", adminRoutes);

  // 4. Rota crítica com limiter
  app.post("/api/custom-login", loginLimiter, (req, res) => {
    return res.status(200).json({ ok: true });
  });

  return app;
};

export const startServer = () => {
  const app = createApp();
  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`🚀 Servidor modular da GlowStack rodando na porta ${PORT}`);
  });
};
