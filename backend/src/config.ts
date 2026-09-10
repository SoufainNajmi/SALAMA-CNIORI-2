/** Configuration issue des variables d'environnement (voir .env.example). */
import "dotenv/config";

function requis(nom: string, defaut?: string): string {
  const valeur = process.env[nom] ?? defaut;
  if (valeur === undefined) {
    throw new Error(`Variable d'environnement manquante : ${nom}`);
  }
  return valeur;
}

export const config = {
  port: Number(requis("PORT", "4000")),
  db: {
    host: requis("DB_HOST", "127.0.0.1"),
    port: Number(requis("DB_PORT", "3308")),
    user: requis("DB_USER"),
    password: requis("DB_PASSWORD"),
    database: requis("DB_NAME"),
  },
  jwtSecret: requis("JWT_SECRET"),
  jwtExpiresInDays: Number(requis("JWT_EXPIRES_IN_DAYS", "7")),
};
