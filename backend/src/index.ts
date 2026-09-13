/** Serveur API SALAMA — auth, household, wearer, status. Voir app/src/types/api.ts (contrat). */
import cors from "cors";
import express from "express";

import { config } from "./config";
import { authRouter } from "./routes/auth";
import { householdRouter } from "./routes/household";
import { medicationsRouter } from "./routes/medications";
import { statusRouter } from "./routes/status";
import { wearerRouter } from "./routes/wearer";

const app = express();

// CORS ouvert en dev (l'app tourne sur des ports variables via Expo) — à
// restreindre à l'origine réelle avant tout déploiement au-delà du poste de dev.
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/household", householdRouter);
app.use("/api/wearer", wearerRouter);
app.use("/api/status", statusRouter);
app.use("/api/medications", medicationsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ code: "inconnu", message: "Erreur serveur." });
});

app.listen(config.port, () => {
  console.log(`API SALAMA sur http://localhost:${config.port}`);
});
